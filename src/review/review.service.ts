import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  PLATFORM,
  tbHotel,
  tbLastUpdateReview,
  tbReview,
} from '@prisma/client';
import { DataList, Paging } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Builder, Capabilities } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { seleniumUrl } from 'src/utils';
import {
  NewReview,
  ReviewAgoda,
  ReviewBooking,
  ReviewGoogle,
  ReviewTrip,
} from './review.entity';
import extractReviewTrip from './utils/trip';
import extractReviewBooking from './utils/booking';
import extractReviewGoogle from './utils/google';
import * as moment from 'moment-timezone';
import { HttpService } from '@nestjs/axios';
import extractReviewAgoda from './utils/agoda';

const cronjobCrawlReviewEnv = process.env.CRONJOB_CRAWL_REVIEW;

@Injectable()
export class ReviewService {
  constructor(
    private prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {
    console.log('init review service');
  }

  async getLastUpdatedReview(): Promise<tbLastUpdateReview> {
    return await this.prismaService.tbLastUpdateReview.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getAllReview(query: Paging): Promise<DataList<tbReview>> {
    const count = await this.prismaService.tbReview.count({
      where: {
        ...query.cond,
        platform: query.platform,
      },
    });
    const data = await this.prismaService.tbReview.findMany({
      where: {
        ...query.cond,
        platform: query.platform,
      },
      take: parseInt(query.limit),
      skip: parseInt(query.page) * parseInt(query.limit),
    });
    return {
      count,
      page: query.page,
      limit: query.limit,
      data,
    };
  }

  // @Cron(cronjobCrawlReviewEnv)
  async crawlSchedule(
    isManual = true,
    currentMonth = moment().get('month') + 1,
    currentYear = moment().get('year'),
  ): Promise<{ newReview: NewReview; month: number; year: number }> {
    let result: NewReview = {};

    // const updatedAt = moment().utc().toDate();
    const listHotels = await this.prismaService.tbHotel.findMany({
      where: {
        disable: {
          not: true,
        },
      },
    });
    for (let i = 0; i < listHotels.length; i++) {
      // dev
      // if (listHotels[i].id !== '242c9b2a-ccf7-4efa-b7d9-feec03af2a47') continue;
      // dev
      const hotel: tbHotel = listHotels[i];
      const temp: NewReview = await this.crawlHotel(
        hotel,
        currentMonth,
        currentYear,
      );
      result = {
        ...result,
        ...temp,
      };
      console.log(
        hotel.name,
        result[hotel.id].TRIP.length,
        result[hotel.id].BOOKING.length,
        result[hotel.id].GOOGLE.length,
        result[hotel.id].AGODA.length,
        'Done hotel',
      );
    }
    console.log('Done crawl all hotel');

    // const temp: NewReview = await this.crawlHotel(listHotels[0]);

    await this.prismaService.tbLastUpdateReview.create({
      data: {
        updatedAt: moment().toDate(),
      },
    });
    return {
      newReview: result,
      month: currentMonth,
      year: currentYear,
    };
  }

  async crawlHotel(
    hotel: tbHotel,
    currentMonth: number,
    currentYear: number,
  ): Promise<NewReview> {
    console.log('Start firefox');
    const newReviewHotel: NewReview = {
      [hotel.id]: {
        TRIP: [],
        BOOKING: [],
        GOOGLE: [],
        AGODA: [],
      },
    };
    const screen = {
      width: 1000,
      height: 600,
    };
    let driver;
    try {
      const timezone = 'Asia/Ho_Chi_Minh'; // Change this to the desired timezone
      const capabilities = Capabilities.firefox();
      capabilities.set('tz', timezone);
      capabilities.set('moz:firefoxOptions', {
        args: ['--headless'],
      });
      // capabilities.set('browserName', 'firefox');

      driver = await new Builder()
        .usingServer(seleniumUrl)
        .forBrowser('firefox')
        .withCapabilities(capabilities)
        .build();

      try {
        console.log('Start review TRIP');
        // crawl review trip
        await driver.get(hotel.links[PLATFORM.TRIP]);
        console.log(hotel.links[PLATFORM.TRIP], 'Trip');
        const reviewsTrip: ReviewTrip[] = await extractReviewTrip(
          driver,
          hotel.links[PLATFORM.TRIP],
        );
        newReviewHotel[hotel.id].TRIP = reviewsTrip;
        await this.prismaService.tbReview.deleteMany({
          where: {
            tbHotelId: hotel.id,
            platform: PLATFORM.TRIP,
            monthCreated: currentMonth,
            yearCreated: currentYear,
          },
        });
        await this.prismaService.tbReview.createMany({
          data: newReviewHotel[hotel.id].TRIP.map((item) => ({
            ...item,
            extra: {
              link: item.extra.link,
              stars: item.extra.stars,
              reviewId: item.extra.reviewId,
            },
            platform: PLATFORM.TRIP,
            tbHotelId: hotel.id,
          })),
        });
      } catch (e) {
        console.log('Lỗi crawl review trip', e);
      }

      try {
        console.log('Start review BOOKING', hotel.links[PLATFORM.BOOKING]);
        // crawl review booking
        // convert url hotel booking to review hotel booking
        let urlBooking: string = hotel.links[PLATFORM.BOOKING];
        urlBooking = urlBooking.split('https://www.booking.com/hotel/vn/')?.[1];
        const pagename = urlBooking.split('.')?.[0];
        console.log(hotel.links[PLATFORM.BOOKING], 'Booking');
        const reviewsBooking: ReviewBooking[] = await extractReviewBooking(
          driver,
          pagename,
        );
        newReviewHotel[hotel.id].BOOKING = reviewsBooking;
        await this.prismaService.tbReview.deleteMany({
          where: {
            tbHotelId: hotel.id,
            platform: PLATFORM.BOOKING,
            monthCreated: currentMonth,
            yearCreated: currentYear,
          },
        });
        await this.prismaService.tbReview.createMany({
          data: newReviewHotel[hotel.id].BOOKING.map((item) => ({
            ...item,
            extra: {
              score: item.extra.score,
              reviewId: item.extra.reviewId,
              link: item.extra.link,
            },
            platform: PLATFORM.BOOKING,
            tbHotelId: hotel.id,
          })),
        });
      } catch (e) {
        console.log('Lỗi crawl review booking');
      }

      try {
        console.log('Start review GOOGLE');
        await driver.get(hotel.links[PLATFORM.GOOGLE]);

        console.log(hotel.links[PLATFORM.GOOGLE], 'Google');
        const reviewsGoogle: ReviewGoogle[] = await extractReviewGoogle(
          driver,
          this.httpService,
          hotel.links[PLATFORM.GOOGLE],
        );
        newReviewHotel[hotel.id].GOOGLE = reviewsGoogle;
        // console.log(reviewsGoogle.length, 'reviewsGoogle');
        await this.prismaService.tbReview.deleteMany({
          where: {
            tbHotelId: hotel.id,
            platform: PLATFORM.GOOGLE,
            monthCreated: currentMonth,
            yearCreated: currentYear,
          },
        });
        await this.prismaService.tbReview.createMany({
          data: newReviewHotel[hotel.id].GOOGLE.map((item) => ({
            ...item,
            extra: {
              score: item.extra.score,
              reviewId: item.extra.reviewId,
              link: item.extra.link,
            },
            platform: PLATFORM.GOOGLE,
            tbHotelId: hotel.id,
          })),
        });
      } catch (e) {
        console.log('Lỗi crawl review google', e);
      }

      try {
        console.log('Start review AGODA');

        console.log(hotel.links[PLATFORM.AGODA], 'Agoda');
        const reviewsAgoda: ReviewAgoda[] = await extractReviewAgoda(
          this.prismaService,
          this.httpService,
          hotel.id,
        );
        newReviewHotel[hotel.id].AGODA = reviewsAgoda;
        await this.prismaService.tbReview.deleteMany({
          where: {
            tbHotelId: hotel.id,
            platform: PLATFORM.AGODA,
            monthCreated: currentMonth,
            yearCreated: currentYear,
          },
        });
        await this.prismaService.tbReview.createMany({
          data: newReviewHotel[hotel.id].AGODA.map((item) => ({
            ...item,
            extra: {
              score: item.extra.score,
              reviewId: item.extra.reviewId,
              link: item.extra.link,
            },
            platform: PLATFORM.AGODA,
            tbHotelId: hotel.id,
          })),
        });
      } catch (e) {
        console.log('Lỗi crawl review google', e);
      }
    } catch (e) {
      console.log(e, 'error');
    }
    await driver.quit();
    return newReviewHotel;
  }
}
