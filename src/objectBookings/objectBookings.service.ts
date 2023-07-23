import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataList, Paging } from '../app.dto';
import { tbObjectBookings } from '@prisma/client';
import { CreateObjectBooking } from './objectBookings.dto';
import { Builder, WebDriver, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { GetElement, GetElements } from 'src/utils';
import axios from 'axios';
import { ObjectBooking } from './objectBookings.entity';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';

const token = process.env.TOKEN_HUBSPOT;

const cronjobCrawlReviewEnv = process.env.CRONJOB_CRAWL_REVIEW;

async function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

@Injectable()
export class ObjectBookingsService {
  constructor(private prismaService: PrismaService) {
    console.log('init object trips service');
  }

  async getAllObjectBookings(query: Paging): Promise<DataList<tbObjectBookings>> {
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
    const count = await this.prismaService.tbObjectBookings.count({
      where: {
        ...query.cond,
      },
    })
    const data =  await this.prismaService.tbObjectBookings.findMany({
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

  async createObjectBooking(
    data: CreateObjectBooking,
  ): Promise<tbObjectBookings | undefined> {
    const objectBooking = await this.crawlObjectBooking(data.url);
    if (!objectBooking) return undefined;
    const newObjectBooking = await this.prismaService.tbObjectBookings.create({
      data: {
        ...objectBooking,
        updatedAt: new Date(),
      },
    });
    return newObjectBooking;
  }

  async updateObjectBooking(data: tbObjectBookings): Promise<tbObjectBookings> {
    const objectBooking = await this.crawlObjectBooking(data.url);
    if (!objectBooking) return undefined;
    const updatedObjectBooking = await this.prismaService.tbObjectBookings.update({
      where: {
        id: data.id,
      },
      data: {
        ...objectBooking,
        updatedAt: new Date(),
      },
    });
    return updatedObjectBooking;
  }

  async deleteObjectBooking(id: number): Promise<tbObjectBookings> {
    return await this.prismaService.tbObjectBookings.delete({
      where: {
        id,
      },
    });
  }

  @Cron(cronjobCrawlReviewEnv)
  async crawlSchedule(): Promise<void> {
    const listObjectBookings = await this.prismaService.tbObjectBookings.findMany();
    for (let i = 0; i < listObjectBookings.length; i++) {
      await this.updateObjectBooking(listObjectBookings[i]);
      await sleep(5000)
    }
  }

  async crawlObjectBooking(url: string): Promise<ObjectBooking | undefined> {
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

      const titleEle = await GetElement(driver, '//h2[contains(concat(" ", @class, " "), " pp-header__title ")]');
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
        '//button[@data-testid="read-all-actionable"]/div/div/div[@aria-label]',
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
      const numberReviewsEle = await GetElement(
        driver,
        '//button[@data-testid="read-all-actionable"]',
      );
      if (!numberReviewsEle) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy tổng số reviews',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      await driver.executeScript(
        'arguments[0].click()',
        numberReviewsEle,
      );
      await driver.sleep(2000);
      
      let liScore = [];
      await driver.executeScript(
        'arguments[0].click()',
        await GetElement(driver, '//div[@id="review_score_filter"]/button'),
      );
      await driver.sleep(2000);
      const liScoreEles = await GetElements(driver, '//div[@id="review_score_filter"]/div/div/ul/li/button/span[@class="review-filter-item__counter"]')
      if (!liScoreEles) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy tổng số reviews',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      for(let i=0; i<liScoreEles.length; i++) {
        liScore = liScore.concat(await liScoreEles[i].getText())
      }

      let numberScoreReviews = []
      for(let i=0; i<liScore.length; i++) {
        let text = liScore[i];        
        text = text.split("(");
        text = text[1].split(")");
        numberScoreReviews = numberScoreReviews.concat(text[0])
      }

      // console.log("get ranking")
      // const rankingEles = GetElements(
      //   driver,
      //   '//div[@class="ui_column  "]/span[contains(text(), "#")]',
      // );
      // if (!rankingEles) {
      //   throw new HttpException(
      //     {
      //       status: HttpStatus.BAD_REQUEST,
      //       detail: 'Không tìm thấy rank reviews',
      //     },
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }
      // let rankings = [];
      // const arrRankingEles = await rankingEles;
      // for (let i = 0; i < arrRankingEles.length; i++) {
      //   rankings = rankings.concat(await arrRankingEles[i].getText());
      // }

      console.log(name, score, liScore, numberScoreReviews);
      const objectBooking: ObjectBooking = {
        name,
        url,
        score,
        numberScoreReviews: numberScoreReviews.map(sc => parseInt(sc)),
        updatedAt: new Date(),
      };

      await driver.quit();
      console.log("crawl done")
      return objectBooking;
    } catch (e) {
      console.log(e, 'error');
    }

    await driver.quit();
    return undefined;
  }
}