import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataList, Paging } from '../app.dto';
import { tbObjectTrips } from '@prisma/client';
import { CreateObjectTrip } from './objectTrips.dto';
import { Builder, WebDriver, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { GetElement, GetElements, seleniumUrl } from 'src/utils';
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

  async getLastUpdate(): Promise<{ updatedAt: Date }> {
    const setting = await this.prismaService.tbObjectTripsLog.findFirst({
      orderBy: {
        updatedAt: 'desc'
      } 
    })
    return {
      updatedAt: setting.updatedAt,
    }
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
      orderBy: {
        rank: 'asc'
      }
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

  async updateObjectTrip(data: tbObjectTrips, updatedAt: Date | undefined = undefined): Promise<tbObjectTrips> {
    const objectTrip = await this.crawlObjectTrip(data.url);
    if (!objectTrip) return undefined
    const updatedObjectTrips = await this.prismaService.tbObjectTrips.update({
      where: {
        id: data.id,
      },
      data: {
        ...objectTrip,
        updatedAt: updatedAt? updatedAt : new Date(),
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
    const updatedAt = new Date();
    for (let i = 0; i < listObjectTrips.length; i++) {
      await this.updateObjectTrip(listObjectTrips[i], updatedAt);
      await sleep(5000)
    }
    await this.prismaService.tbObjectTripsLog.create({
      data: {
        updatedAt,
      }
    })
  }

  async crawlObjectTrip(url: string): Promise<ObjectTrip | undefined> {
    let driver: WebDriver;
    try {
      console.log('Start chrome');
      const option = new Options().addArguments('--no-proxy-server');
      // .addArguments('headless');
      driver = await new Builder()
        .usingServer(seleniumUrl)
        .forBrowser('chrome')
        .setChromeOptions(option)
        .build();
      console.log(url);
      await driver.sleep(4000);
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
      console.log(await scoreReviewEle.getAttribute("innerHTML"), 'html')
      if (!scoreReviewEle) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy điểm review',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      let textScore = await scoreReviewEle.getText();
      console.log(textScore, 'textScore')
      textScore = textScore.replaceAll(",", ".")
      const score = parseFloat(textScore);

      console.log('get total reviews');
      const tabReviewEle = await GetElement(driver, '//div[@data-tab="TABS_REVIEWS"]')
      await driver.executeScript(
          'arguments[0].scrollIntoView(true);',
          tabReviewEle,
        );
      await driver.sleep(5000);
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
      console.log('ele total reviews');
      for (let i = 0; i < numberScoreReviewEle.length; i++) {
        
        
        numberScoreReviews = numberScoreReviews.concat(
          parseInt(
            (await numberScoreReviewEle[i].getText()).replaceAll(',', ''),
          ),
        );
      }

      console.log("get ranking")
      const rankingEle = await GetElement(
        driver,
        '//div[@class="ui_column  "]/span[contains(text(), "#")]',
      );
      if (!rankingEle) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy rank reviews',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      let textRank = await rankingEle.getText();
      textRank = textRank.split(" ")?.[0].split("#")?.[1];
      const rank = parseInt(textRank);

      console.log(name, score, rank, numberScoreReviews);
      const objectTrip: ObjectTrip = {
        name,
        url,
        score,
        numberScoreReviews,
        rank,
        updatedAt: new Date(),
      };

      await driver.quit();
      console.log("crawl done", objectTrip)
      // return undefined;
      return objectTrip;
    } catch (e) {
      console.log(e, 'error');
    }

    await driver.quit();
    return undefined;
  }
}
