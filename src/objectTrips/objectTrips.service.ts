import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataList, Paging } from '../app.dto';
import { tbObjectTrips } from '@prisma/client';
import { CreateObjectTrip } from './objectTrips.dto';
import { Builder, WebDriver, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { GetElement, GetElements } from 'src/utils';
import axios from 'axios';
import { ObjectTrip } from './objectTrips.entity';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';

const token = process.env.TOKEN_HUBSPOT;

const cronjobCrawlReviewEnv = process.env.CRONJOB_CRAWL_REVIEW;

async function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

@Injectable()
export class ObjectTripsService {
  constructor(private prismaService: PrismaService) {
    console.log('init object trips service');
  }

  async getAllObjectTrips(query: Paging): Promise<DataList<tbObjectTrips>> {
    // console.log('get');
    // const response = await axios.get(
    //   'https://api.hubapi.com/analytics/v2/reports/social-assists/total',
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //     },
    //   },
    // );
    // console.log(response.data, 'hubspot');
    const count = await this.prismaService.tbObjectTrips.count({
      where: {
        ...query.cond,
      },
    })
    const data =  await this.prismaService.tbObjectTrips.findMany({
      where: {
        ...query.cond,
      },
      skip: query.page,
      take: query.limit,
    });
    return {
      count,
      page: query.page,
      limit: query.limit,
      data,
    }
  }

  async createObjectTrip(
    data: CreateObjectTrip,
  ): Promise<tbObjectTrips | undefined> {
    const objectTrip = await this.crawlObjectTrip(data.url);
    if (!objectTrip) return undefined
    const newObjectTrip = await this.prismaService.tbObjectTrips.create({
      data: {
        ...objectTrip,
        updatedAt: new Date(),
      },
    });
    return newObjectTrip;
  }

  async updateObjectTrip(data: tbObjectTrips): Promise<tbObjectTrips> {
    const objectTrip = await this.crawlObjectTrip(data.url);
    if (!objectTrip) return undefined
    const updatedObjectTrips = await this.prismaService.tbObjectTrips.update({
      where: {
        id: data.id,
      },
      data: {
        ...objectTrip,
        updatedAt: new Date(),
      },
    });
    return updatedObjectTrips;
  }

  async deleteObjectTrip(id: number): Promise<tbObjectTrips> {
    return await this.prismaService.tbObjectTrips.delete({
      where: {
        id,
      },
    });
  }

  @Cron(cronjobCrawlReviewEnv)
  async crawlSchedule(): Promise<void> {
    const listObjectTrips = await this.prismaService.tbObjectTrips.findMany();
    for (let i = 0; i < listObjectTrips.length; i++) {
      await this.updateObjectTrip(listObjectTrips[i]);
      await sleep(5000)
    }
  }

  async crawlObjectTrip(url: string): Promise<ObjectTrip | undefined> {
    let driver: WebDriver;
    try {
      console.log('Start chrome');
      const option = new Options().addArguments('--no-proxy-server');
      // .addArguments('headless');
      driver = await new Builder()
        .usingServer('http://localhost:4444/wd/hub')
        .forBrowser('firefox')
        .setChromeOptions(option)
        .build();
      console.log(url);
      // await driver.sleep(100000000);
      await driver.get(url);
      console.log('get name');

      const titleEle = await GetElement(driver, '//h1[@id="HEADING"]');
      if (!titleEle) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy tiêu đề',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const name = await titleEle.getText();

      console.log('get score');
      const scoreReviewEle = await GetElement(
        driver,
        '//div[@class="ui_column  "]/div/span',
      );
      if (!scoreReviewEle) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy điểm review',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const score = parseFloat(await scoreReviewEle.getText());

      console.log('get total reviews');
      const numberScoreReviewEle = await GetElements(
        driver,
        '//div[@id="hrReviewFilters"]/div/div/ul/li/span[text()]',
      );
      if (!numberScoreReviewEle) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy tổng số reviews',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      let numberScoreReviews = [];
      for (let i = 0; i < numberScoreReviewEle.length; i++) {
        numberScoreReviews = numberScoreReviews.concat(
          parseInt(
            (await numberScoreReviewEle[i].getText()).replaceAll(',', ''),
          ),
        );
      }

      console.log("get ranking")
      const rankingEles = GetElements(
        driver,
        '//div[@class="ui_column  "]/span[contains(text(), "#")]',
      );
      if (!rankingEles) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy rank reviews',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      let rankings = [];
      const arrRankingEles = await rankingEles;
      for (let i = 0; i < arrRankingEles.length; i++) {
        rankings = rankings.concat(await arrRankingEles[i].getText());
      }

      console.log(name, score, rankings, numberScoreReviews);
      const objectTrip: ObjectTrip = {
        name,
        url,
        score,
        numberScoreReviews,
        rank: rankings,
        updatedAt: new Date(),
      };

      await driver.quit();
      console.log("crawl done")
      return objectTrip;
    } catch (e) {
      console.log(e, 'error');
    }

    await driver.quit();
    return undefined;
  }
}
