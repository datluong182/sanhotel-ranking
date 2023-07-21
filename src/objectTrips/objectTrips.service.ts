import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Paging } from '../app.dto';
import { tbObjectTrips } from '@prisma/client';
import { CreateObjectTrip } from './objectTrips.dto';
import { Builder, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { GetElement, GetElements } from 'src/utils';

@Injectable()
export class ObjectTripsService {
  constructor(private prismaService: PrismaService) {
    console.log('init object trips service');
  }

  async getAllObjectTrips(query: Paging): Promise<tbObjectTrips[]> {
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
        .forBrowser('chrome')
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
      const name = titleEle.getText();

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
      const totalReview = totalReviews[1].getText();

      console.log(name, scoreReview, totalReview);
    } catch (e) {
      console.log(e, 'error');
    }
    // const newObjectTrip = await this.prismaService.tbObjectTrips.create({
    //   data: {

    //   }
    // });
    await driver.quit();
    return undefined;
  }
}
