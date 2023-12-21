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
  ReviewExpedia,
  ReviewGoogle,
  ReviewSanHN,
  ReviewTraveloka,
  ReviewTrip,
  ReviewTripcom,
} from './review.entity';
import extractReviewTrip from './utils/trip';
import extractReviewBooking from './utils/booking';
import extractReviewGoogle from './utils/google';
import * as moment from 'moment-timezone';
import { HttpService } from '@nestjs/axios';
import extractReviewAgoda from './utils/agoda';
import extractReviewExpedia from './utils/expedia';
import extractReviewTraveloka from './utils/traveloka';
import extractReviewTripcom from './utils/tripcom';
import { ConfigService } from 'src/config/config.service';
import { appendLogFile, convertLog } from 'src/competition/utils/logs';

const cronjobCrawlReviewEnv = process.env.CRONJOB_CRAWL_REVIEW;

async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

@Injectable()
export class ReviewService {
  constructor(
    private prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
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
    currentYear = moment().get('year')
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
      await appendLogFile(
        this.configService,
        false,
        convertLog(
          'Crawl review hotel: ' + hotel.name,
          'tbReview.crawlSchedule',
          'LOG'
        )
      );
      const temp: NewReview = await this.crawlHotel(
        hotel,
        currentMonth,
        currentYear
      );
      result = {
        ...result,
        ...temp,
      };
      await appendLogFile(
        this.configService,
        false,
        convertLog(
          [
            'Crawl review hotel: ' + hotel.name + ' DONE',
            `TRIP: ${result[hotel.id].TRIP.length}`,
            `BOOKING: ${result[hotel.id].TRIP.length}`,
            `GOOGLE: ${result[hotel.id].TRIP.length}`,
            `AGODA: ${result[hotel.id].TRIP.length}`,
            `EXPEDIA: ${result[hotel.id].TRIP.length}`,
            `TRAVELOKA: ${result[hotel.id].TRIP.length}`,
            `TRIPCOM: ${result[hotel.id].TRIP.length}`,
            `SANHN: ${result[hotel.id].TRIP.length}`,
            'Done crawl all hotel',
          ],
          'tbReview.crawlSchedule',
          'STATUS'
        )
      );
    }

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
    currentYear: number
  ): Promise<NewReview> {
    console.log('Start firefox');
    const newReviewHotel: NewReview = {
      [hotel.id]: {
        TRIP: [],
        BOOKING: [],
        GOOGLE: [],
        AGODA: [],
        EXPEDIA: [],
        TRAVELOKA: [],
        TRIPCOM: [],
        SANHN: [],
      },
    };
    const screen = {
      width: 1000,
      height: 600,
    };
    let driver = undefined;
    try {
      const timezone = 'Asia/Ho_Chi_Minh'; // Change this to the desired timezone
      const capabilities = Capabilities.firefox();
      capabilities.set('tz', timezone);
      // capabilities.set('moz:firefoxOptions', {
      //   args: ['--headless'],
      // });
      // capabilities.set('browserName', 'firefox');

      // driver = await new Builder()
      //   .usingServer(seleniumUrl)
      //   .forBrowser('firefox')
      //   .withCapabilities(capabilities)
      //   .build();

      if (hotel.links[PLATFORM.TRIP]) {
        try {
          console.log('Start review TRIP');
          // crawl review trip
          // await driver.get(hotel.links[PLATFORM.TRIP]);
          console.log(hotel.links[PLATFORM.TRIP], 'Trip');

          const reviewsTrip: ReviewTrip[] = await extractReviewTrip(
            this.httpService,
            hotel.links[PLATFORM.TRIP],
            currentMonth,
            currentYear
          );
          console.log(hotel, 'hotel');
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
          console.log(e, 'Lỗi crawl review trip');
        } finally {
        }
      }

      if (hotel.links[PLATFORM.BOOKING]) {
        try {
          driver = await new Builder()
            .usingServer(seleniumUrl)
            .forBrowser('firefox')
            .withCapabilities(capabilities)
            .build();

          console.log('Start review BOOKING', hotel.links[PLATFORM.BOOKING]);
          // crawl review booking
          // convert url hotel booking to review hotel booking
          let urlBooking: string = hotel.links[PLATFORM.BOOKING];
          urlBooking = urlBooking.split(
            'https://www.booking.com/hotel/vn/'
          )?.[1];
          const pagename = urlBooking.split('.')?.[0];
          console.log(hotel.links[PLATFORM.BOOKING], 'Booking');
          const reviewsBooking: ReviewBooking[] = await extractReviewBooking(
            driver,
            pagename
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
          console.log(e, 'Lỗi crawl review booking');
        } finally {
          await driver.quit();
          await sleep(1000);
        }
      }

      if (hotel.links[PLATFORM.GOOGLE]) {
        try {
          console.log(hotel.links[PLATFORM.GOOGLE], 'Google');
          const reviewsGoogle: ReviewGoogle[] = await extractReviewGoogle(
            this.httpService,
            hotel.links[PLATFORM.GOOGLE]
          );
          newReviewHotel[hotel.id].GOOGLE = reviewsGoogle;
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
          console.log(e, 'Lỗi crawl review google');
        } finally {
        }
      }

      if (hotel.links[PLATFORM.AGODA]) {
        try {
          console.log('Start review AGODA');

          console.log(hotel.links[PLATFORM.AGODA], 'Agoda');
          const reviewsAgoda: ReviewAgoda[] = await extractReviewAgoda(
            this.prismaService,
            this.httpService,
            hotel.id
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
          console.log(e, 'Lỗi crawl review agoda');
        }
      }

      if (hotel.links[PLATFORM.EXPEDIA]) {
        try {
          console.log('Start review EXPEDIA');

          console.log(hotel.links[PLATFORM.EXPEDIA], 'Expedia');
          const reviewsExpedia: ReviewExpedia[] = await extractReviewExpedia(
            this.prismaService,
            this.httpService,
            hotel.id
          );
          newReviewHotel[hotel.id].EXPEDIA = reviewsExpedia;
          await this.prismaService.tbReview.deleteMany({
            where: {
              tbHotelId: hotel.id,
              platform: PLATFORM.EXPEDIA,
              monthCreated: currentMonth,
              yearCreated: currentYear,
            },
          });
          await this.prismaService.tbReview.createMany({
            data: newReviewHotel[hotel.id].EXPEDIA.map((item) => ({
              ...item,
              extra: {
                score: item.extra.score,
                reviewId: item.extra.reviewId,
                link: item.extra.link,
              },
              platform: PLATFORM.EXPEDIA,
              tbHotelId: hotel.id,
            })),
          });
        } catch (e) {
          console.log(e, 'Lỗi crawl review expedia');
        }
      }

      if (hotel.links[PLATFORM.TRAVELOKA]) {
        try {
          console.log('Start review TRAVELOKA');

          console.log(hotel.links[PLATFORM.TRAVELOKA], 'Traveloka');
          const reviewsTraveloka: ReviewTraveloka[] =
            await extractReviewTraveloka(
              this.prismaService,
              this.httpService,
              hotel.id
            );
          newReviewHotel[hotel.id].TRAVELOKA = reviewsTraveloka;
          await this.prismaService.tbReview.deleteMany({
            where: {
              tbHotelId: hotel.id,
              platform: PLATFORM.TRAVELOKA,
              monthCreated: currentMonth,
              yearCreated: currentYear,
            },
          });
          await this.prismaService.tbReview.createMany({
            data: newReviewHotel[hotel.id].TRAVELOKA.map((item) => ({
              ...item,
              extra: {
                score: item.extra.score,
                reviewId: item.extra.reviewId,
                link: item.extra.link,
              },
              platform: PLATFORM.TRAVELOKA,
              tbHotelId: hotel.id,
            })),
          });
        } catch (e) {
          console.log(e, 'Lỗi crawl review traveloka');
        }
      }

      if (hotel.links[PLATFORM.TRIPCOM]) {
        try {
          console.log('Start review TRIPCOM');

          console.log(hotel.links[PLATFORM.TRIPCOM], 'Trip.com');
          const reviewsTripcom: ReviewTripcom[] = await extractReviewTripcom(
            this.prismaService,
            this.httpService,
            hotel.id
          );
          newReviewHotel[hotel.id].TRIPCOM = reviewsTripcom;
          await this.prismaService.tbReview.deleteMany({
            where: {
              tbHotelId: hotel.id,
              platform: PLATFORM.TRIPCOM,
              monthCreated: currentMonth,
              yearCreated: currentYear,
            },
          });
          await this.prismaService.tbReview.createMany({
            data: newReviewHotel[hotel.id].TRIPCOM.map((item) => ({
              ...item,
              extra: {
                score: item.extra.score,
                reviewId: item.extra.reviewId,
                link: item.extra.link,
              },
              platform: PLATFORM.TRIPCOM,
              tbHotelId: hotel.id,
            })),
          });
        } catch (e) {
          console.log(e, 'Lỗi crawl review trip.com');
        }
      }

      if (hotel.links[PLATFORM.SANHN]) {
        try {
          driver = await new Builder()
            .usingServer(seleniumUrl)
            .forBrowser('firefox')
            .withCapabilities(capabilities)
            .build();

          console.log('Start review SANHN', hotel.links[PLATFORM.SANHN]);
          // crawl review booking
          // convert url hotel booking to review hotel booking
          let urlSanHN: string = hotel.links[PLATFORM.SANHN];
          urlSanHN = urlSanHN.split('https://www.booking.com/hotel/vn/')?.[1];
          const pagename = urlSanHN.split('.')?.[0];
          console.log(hotel.links[PLATFORM.SANHN], 'SanHN');
          const reviewsSanHN: ReviewSanHN[] = await extractReviewBooking(
            driver,
            pagename
          );
          newReviewHotel[hotel.id].SANHN = reviewsSanHN;
          await this.prismaService.tbReview.deleteMany({
            where: {
              tbHotelId: hotel.id,
              platform: PLATFORM.SANHN,
              monthCreated: currentMonth,
              yearCreated: currentYear,
            },
          });
          await this.prismaService.tbReview.createMany({
            data: newReviewHotel[hotel.id].SANHN.map((item) => ({
              ...item,
              extra: {
                score: item.extra.score,
                reviewId: item.extra.reviewId,
                link: item.extra.link,
              },
              platform: PLATFORM.SANHN,
              tbHotelId: hotel.id,
            })),
          });
        } catch (e) {
          console.log(e, 'Lỗi crawl review SanHn');
        } finally {
          await driver.quit();
          await sleep(1000);
        }
      }
    } catch (e) {
      await appendLogFile(
        this.configService,
        false,
        convertLog(
          'Crawl review hotel: ' + hotel.name + ' error:' + e?.message,
          'tbReview.crawlHotel',
          'ERROR'
        )
      );
    }

    return newReviewHotel;
  }
}
