import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Paging } from '../app.dto';
import { tbObjectTrips } from '@prisma/client';
import { CreateObjectTrip } from './objectTrips.dto';
import { Builder, WebDriver, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { GetElement, GetElements } from 'src/utils';
import axios from 'axios';

const token = process.env.TOKEN_HUBSPOT;

@Injectable()
export class ObjectTripsService {
  constructor(private prismaService: PrismaService) {
    console.log('init object trips service');
  }

  async getAllObjectTrips(query: Paging): Promise<tbObjectTrips[]> {
    console.log('get');
    const response = await axios.get(
      'https://api.hubapi.com/analytics/v2/reports/social-assists/total',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(response, 'hubspot');
    return await this.prismaService.tbObjectTrips.findMany({
      where: {
        ...query.cond,
      },
      skip: query.page,
      take: query.limit,
    });
  }

  async createObjectTrip(
    data: CreateObjectTrip,
  ): Promise<tbObjectTrips | undefined> {
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
      console.log(data.url);
      // await driver.sleep(100000000);
      await driver.get(data.url);
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
      const scoreReview = parseFloat(await scoreReviewEle.getText());

      console.log('get total reviews');
      const totalReviewEle = GetElements(
        driver,
        '//div[@class="ui_column  "]/div/a/span',
      );
      if (!totalReviewEle) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy tổng số reviews',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const totalReviews = await totalReviewEle;
      if (totalReviews.length < 2) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy tổng số reviews',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const totalReviewText = await totalReviews[1].getText();

      const totalReview = parseInt(
        totalReviewText.replaceAll(',', '').split(' ')?.[0],
      );

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

      console.log(name, scoreReview, totalReview, rankings);
      const newObjectTrip = await this.prismaService.tbObjectTrips.create({
        data: {
          name,
          url: data.url,
          scoreReview,
          totalReviews: totalReview,
          rank: rankings,
        },
      });
      await driver.quit();
      return newObjectTrip;
    } catch (e) {
      console.log(e, 'error');
    }

    await driver.quit();
    return undefined;
  }
}
