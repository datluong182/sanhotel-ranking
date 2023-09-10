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
  ReviewBooking,
  ReviewGoogle,
  ReviewTrip,
} from './review.entity';
import extractReviewTrip from './utils/trip';
import extractReviewBooking from './utils/booking';
import * as moment from 'moment-timezone';
import extractReviewGoogle from './utils/google';
import { Proxy } from 'browsermob-proxy-client';
import { HttpService } from '@nestjs/axios';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

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

  @Cron(cronjobCrawlReviewEnv)
  async crawlSchedule(isManual = true): Promise<void> {
    let result: NewReview = {};
    // const updatedAt = moment().utc().toDate();
    const listHotels = await this.prismaService.tbHotel.findMany();
    for (let i = 0; i < listHotels.length; i++) {
      const hotel: tbHotel = listHotels[i];
      const temp: NewReview = await this.crawlHotel(hotel);
      result = {
        ...result,
        ...temp,
      };
      console.log(
        hotel.name,
        result[hotel.id].TRIP.length,
        result[hotel.id].BOOKING.length,
        'Done hotel',
        hotel.name,
      );
    }
    console.log('Done crawl all hotel');

    // const temp: NewReview = await this.crawlHotel(listHotels[0]);

    await this.prismaService.tbLastUpdateReview.create({
      data: {
        updatedAt: moment().toDate(),
      },
    });

    // const listReviewTrip= await this.prismaService.tbReview.findMany({
    //   where: {
    //     platform: 'TRIP',
    //     tbHotelId: listHotels[0].id
    //   }
    // });
    // const listReviewBooking = await this.prismaService.tbReview.findMany({
    //   where: {
    //     platform: 'BOOKING',
    //     tbHotelId: listHotels[0].id
    //   }
    // });
    // const result: NewReview = {
    //   [listHotels[0].id]: {
    //     TRIP: listReviewTrip.map(item => ({
    //       ...item,
    //       extra: {
    //         link: item.extra["link"],
    //         stars: item.extra["stars"],
    //         reviewId: item.extra["reviewId"],
    //       }
    //     })),
    //     BOOKING: listReviewBooking.map(item => ({
    //       ...item,
    //       extra: {
    //         score: item.extra["score"],
    //         reviewId: item.extra["reviewId"],
    //       }
    //     })),
    //   }
    // }
    // console.log(result[listHotels[0].id].BOOKING.length, result[listHotels[0].id].BOOKING[0], 'length review booking')

    // // create tbStaffLastUpdate
    // const lastUpdated = await this.prismaService.tbStaffLastUpdate.create({
    //   data: {
    //     updatedAt: moment(new Date(moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'))).toDate(),
    //   }
    // })

    // // number fiveStarsReview
    // let listStaffs = await this.prismaService.tbStaff.findMany({
    //   where: {
    //     tbHotelId: listHotels[0].id,
    //   }
    // });
    // for(let i=0; i<listStaffs.length; i++) {
    //   let staff = listStaffs[i];

    //   staff.fiveStarsReview[PLATFORM.TRIP] = 0;
    //   staff.fiveStarsReview[PLATFORM.BOOKING] = 0;

    //   const listReviewTrip = result[listHotels[0].id].TRIP;
    //   const listReviewBooking = result[listHotels[0].id].BOOKING;
    //   console.log(staff,listReviewTrip.length, listReviewBooking.length, 'check each staff')
    //   let count = 0;
    //   listReviewTrip.map(review => {
    //     review.content.map(text => {
    //       if (text.search(staff.name) !== -1) {
    //         count++;
    //       }
    //     })
    //   })
    //   staff.fiveStarsReview[PLATFORM.TRIP] = count;

    //   count = 0;
    //   listReviewBooking.map(review => {
    //     review.content.map(text => {
    //       if (text.search(staff.name) !== -1) {
    //         count++;
    //       }
    //     })
    //   })
    //   staff.fiveStarsReview[PLATFORM.BOOKING] = count;

    //   const staffId = staff.id;
    //   delete staff.id;

    //   await this.prismaService.tbStaffLog.create({
    //     data: {
    //       ...staff,
    //       tbHotelId: listHotels[0].id,
    //       tbStaffId: staffId,
    //       tbStaffLastUpdateId: lastUpdated.id,
    //       updatedAt: moment(new Date(moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'))).toDate(),
    //     }
    //   })
    // }
  }

  async crawlHotel(hotel: tbHotel): Promise<NewReview> {
    console.log('Start firefox');
    const newReviewHotel: NewReview = {
      [hotel.id]: {
        TRIP: [],
        BOOKING: [],
        GOOGLE: [],
      },
    };
    const screen = {
      width: 1000,
      height: 600,
    };
    let driver;
    let proxy;
    try {
      proxy = new Proxy({ host: 'browsermob-proxy', port: 3002 });
      await proxy.start();

      const seleniumProxy = proxy.seleniumWebDriverProxy();

      const timezone = 'Asia/Ho_Chi_Minh'; // Change this to the desired timezone
      const capabilities = Capabilities.firefox();
      capabilities.set('tz', timezone);
      capabilities.set('moz:firefoxOptions', {
        args: ['--headless'],
      });
      capabilities.set('browserName', 'firefox');
      capabilities.set(proxy, {
        httpProxy: seleniumProxy,
        sslProxy: seleniumProxy,
      });
      // const option = new Options().addArguments('--no-proxy-server');
      // .addArguments('--headless=new')
      driver = await new Builder()
        .usingServer(seleniumUrl)
        .forBrowser('firefox')
        .withCapabilities(capabilities)
        .build();

      await this.httpService.axiosRef.post(
        'http://browsermob-proxy:3002/proxy/3003/har',
        {
          captureContent: true,
          captureHeaders: true,
        },
      );

      console.log('Start GOOGLE');
      await driver.get(hotel.links[PLATFORM.GOOGLE]);

      // get network rq
      const harResponse = await this.httpService.axiosRef.get(
        'http://browsermob-proxy:3002/proxy/3003/har',
      );
      const har = harResponse.data;
      har.log.entries.forEach((entry) => {
        console.log('Request URL:', entry.request.url);
        console.log('Response Status:', entry.response.status);
        console.log('Response Body Size:', entry.response.bodySize);
      });

      console.log(hotel.links[PLATFORM.GOOGLE], 'Google');
      const reviewsGoogle: ReviewGoogle[] = await extractReviewGoogle(
        driver,
        hotel.links[PLATFORM.GOOGLE],
      );
      newReviewHotel[hotel.id].GOOGLE = reviewsGoogle;

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Debugger',
        },
        HttpStatus.BAD_REQUEST,
      );

      return;

      console.log('Start TRIP');
      // crawl review trip
      await driver.get(hotel.links[PLATFORM.TRIP]);
      console.log(hotel.links[PLATFORM.TRIP], 'Trip');
      const reviewsTrip: ReviewTrip[] = await extractReviewTrip(
        driver,
        hotel.links[PLATFORM.TRIP],
      );
      newReviewHotel[hotel.id].TRIP = reviewsTrip;

      console.log('Start BOOKING', hotel.links[PLATFORM.BOOKING]);
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

      // delete old data review
      const currentMonth = moment().get('month') + 1;
      // const currentMonth = 8;
      const currentYear = moment().get('year');
      await this.prismaService.tbReview.deleteMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
        },
      });

      // save new data
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
      console.log(e, 'error');
    }
    await driver.quit();
    await proxy.stop();
    return newReviewHotel;
  }
}