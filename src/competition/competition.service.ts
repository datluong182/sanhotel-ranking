/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  PLATFORM,
  PLATFORM_RESPONSE,
  Prisma,
  TYPE_HOTEL,
  tbCompetition,
  tbHotel,
  tbObject,
  tbReview,
} from '@prisma/client';
import { DataList, PagingDefault } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  QueryAllCompetition,
  QueryCompetition,
  UpdateExtraCompetition,
} from './competition.dto';
import _, { forInRight } from 'lodash';
import * as moment from 'moment-timezone';
import { NewReview, Review, ReviewGoogle } from 'src/review/review.entity';
import { ReviewService } from 'src/review/review.service';
import { ObjectService } from 'src/object/object.service';
import { Cron } from '@nestjs/schedule';
import { NewObjectLog } from 'src/object/object.entity';
import {
  formatReview,
  getNumberReviewHighAll,
  getSummaryReviewInMonth,
} from './utils';
import { getTopHotelForTrip } from './utils/competition';
import { HttpService } from '@nestjs/axios';
import extractReviewGoogle from 'src/review/utils/google';
import { platform } from 'os';
import extractReviewAgoda from 'src/review/utils/agoda';
import extractDataExpedia from 'src/object/utils/expedia';
import extractDataTraveloka from 'src/object/utils/traveloka';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const cronjobCrawlReviewEnv = process.env.CRONJOB_CRAWL_REVIEW;

@Injectable()
export class CompetitionService {
  constructor(
    private prismaService: PrismaService,
    private reviewService: ReviewService,
    private objectService: ObjectService,
    private readonly httpService: HttpService,
  ) {
    console.log('init competition service');
  }

  async updateExtra(data: UpdateExtraCompetition) {
    const competition = await this.prismaService.tbCompetition.findFirst({
      where: {
        month: data.month,
        year: data.year,
        platform: data.platform,
        tbHotelId: data.tbHotelId,
      },
    });
    if (!competition) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không cập nhật thành công',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (data.platform === PLATFORM.BOOKING) {
      const object = await this.prismaService.tbObject.findFirst({
        where: {
          tbHotelId: data.tbHotelId,
          platform: data.platform,
        },
      });
      const updated = await this.prismaService.tbObject.update({
        where: {
          id: object.id,
        },
        data: {
          extra: {
            ...(object.extra as object),
            checkoutInMonth: data.checkoutInMonth,
            ratioInMonth:
              data.checkoutInMonth && data.checkoutInMonth !== 0
                ? competition.numberReviewHigh / data.checkoutInMonth
                : -1,
          },
        },
      });
      console.log(updated, 'updated');
      await this.prismaService.tbCompetition.update({
        where: {
          month_year_tbHotelId_platform: {
            month: data.month,
            year: data.year,
            platform: data.platform,
            tbHotelId: data.tbHotelId,
          },
        },
        data: {
          ...competition,
          extra: {
            //@ts-ignore
            ...competition.extra,
            checkoutInMonth: data.checkoutInMonth,
            ratioInMonth:
              data.checkoutInMonth && data.checkoutInMonth !== 0
                ? competition.numberReviewHigh / data.checkoutInMonth
                : -1,
          },
        },
      });
    }
  }

  async getCompetition(
    query: QueryCompetition,
  ): Promise<tbCompetition | undefined> {
    return this.prismaService.tbCompetition.findFirst({
      where: {
        month: parseInt(query.month),
        year: parseInt(query.year),
        platform: query.platform,
        tbHotelId: query.tbHotelId,
      },
      include: {
        tbHotel: true,
      },
    });
  }

  async getAllCompetition(
    query: QueryAllCompetition,
  ): Promise<tbCompetition[]> {
    let result = await this.prismaService.tbCompetition.findMany({
      where: {
        tbHotel: {
          disable: {
            not: true,
          },
        },
        platform: query.platform,
        month: parseInt(query.month),
        year: parseInt(query.year),
      },
      include: {
        tbHotel: true,
      },
    });
    if (query.platform === PLATFORM.TRIP) {
      result = result.sort((a, b) => a.extra['rank'] - b.extra['rank']);
    }
    if (query.platform === PLATFORM.BOOKING) {
      result = result.sort((a, b) => b.score - a.score);
    }
    return result;
  }

  // @Cron(cronjobCrawlReviewEnv)
  async updateCompetition(): Promise<any> {
    const currentMonth = moment().get('month') + 1;
    // const currentMonth = 8;
    const currentYear = moment().get('year');

    const startCrawl = moment();
    console.log('Start crawl');

    // return await extractDataTraveloka(
    //   PLATFORM.EXPEDIA,
    //   this.httpService,
    //   'https://www.traveloka.com/en-en/hotel/vietnam/san-grand-hotel--spa-9000000987418',
    // );

    // const newObjectLogsTmp: NewObjectLog[] =
    //   await this.objectService.crawlSchedule();

    // const { newReview: tmp } = await this.reviewService.crawlSchedule(
    //   true,
    //   currentMonth,
    //   currentYear,
    // );

    // return {
    //   newObjectLogsTmp,
    //   tmp,
    //   length: tmp['242c9b2a-ccf7-4efa-b7d9-feec03af2a47'].AGODA.length,
    // };

    // ONLY FOR COMPETITION BOOKING
    // const hotelBEnemyBooking = await this.prismaService.tbHotel.findMany({
    //   where: {
    //     type: TYPE_HOTEL.ENEMY,
    //   },
    // });
    // for (let i = 0; i < hotelBEnemyBooking.length; i++) {
    //   try {
    //     await this.objectService.createObject({
    //       url: hotelBEnemyBooking[i].links[PLATFORM.BOOKING],
    //       platform: PLATFORM.BOOKING,
    //       tbHotelId: hotelBEnemyBooking[i].id,
    //     });
    //     console.log(
    //       hotelBEnemyBooking[i].name,
    //       hotelBEnemyBooking[i].id,
    //       'Add new enemy object',
    //     );
    //   } catch (e) {
    //     console.log(hotelBEnemyBooking[i].name, 'Add new enemy object fail');
    //   }
    // }
    // console.log('Done', hotelBEnemyBooking.length);
    // return;
    // ONLY FOR COMPETITION BOOKING

    // ONLY FOR COMPETITION TRIP
    const { url: urlTopHotel, rank: rankTopHotel } = await getTopHotelForTrip(
      this.prismaService,
      this.objectService,
    );
    console.log(urlTopHotel.length, 'rank trip');
    // ONLY FOR COMPETITION TRIP

    // Get thông tin
    console.log('Get thông tin chung');
    const newObjectLogs: NewObjectLog[] =
      await this.objectService.crawlSchedule();

    // Cập nhật message cho objectLog
    let count = 0;
    console.log('Update rank trip');
    for (let i = 0; i < newObjectLogs.length; i++) {
      const objectLog = newObjectLogs[i];

      // console.log('Calc reivew high all');
      // const numberReviewHighAll = await getNumberReviewHighAll(
      //   this.prismaService,
      //   objectLog.platform,
      //   objectLog.tbHotelId,
      // );

      if (objectLog.platform === PLATFORM.TRIP) {
        console.log('Update rank trip', objectLog.url);
        for (let j = 0; j < urlTopHotel.length; j++) {
          if (objectLog.url === urlTopHotel[j]) {
            console.log('Found url', objectLog.name);
            newObjectLogs[i] = {
              ...newObjectLogs[i],
              extra: {
                rank: rankTopHotel[j],
              },
            };
            await this.prismaService.tbObjectLog.update({
              where: {
                id: objectLog.id,
              },
              data: {
                extra: {
                  rank: rankTopHotel[j],
                },
              },
            });
            await this.prismaService.tbObject.update({
              where: {
                id: objectLog.tbObjectId,
              },
              data: {
                extra: {
                  rank: rankTopHotel[j],
                },
              },
            });
            count++;
          }
        }
      }
    }
    console.log('Updated rank for', count, 'hotels');

    console.log('Get review trên CSDL');
    const listHotels = await this.prismaService.tbHotel.findMany();
    let oldReview: NewReview = {};
    for (let i = 0; i < listHotels.length; i++) {
      const hotel = listHotels[i];
      // Review Trip cũ
      const listRvTrip = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.TRIP,
        },
      });
      // Review booking cũ
      const listRvBooking = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.BOOKING,
        },
      });
      // Review google cũ
      const listRvGoogle = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.GOOGLE,
        },
      });
      // Review agoda cũ
      const listRvAgoda = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.AGODA,
        },
      });
      // Review expedia cũ
      const listRvExpedia = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.EXPEDIA,
        },
      });

      // Review traveloka cũ
      const listRvTraveloka = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.TRAVELOKA,
        },
      });

      //@ts-ignore
      oldReview = {
        ...oldReview,
        [hotel.id]: {
          TRIP: listRvTrip,
          BOOKING: listRvBooking,
          GOOGLE: listRvGoogle,
          AGODA: listRvAgoda,
          EXPEDIA: listRvExpedia,
          TRAVELOKA: listRvTraveloka,
        },
      };
    }

    console.log('Crawl review');
    const { newReview } = await this.reviewService.crawlSchedule(
      true,
      currentMonth,
      currentYear,
    );

    console.log('Update message and send noti. Only for hotel ally');
    // dev check thay đổi review
    // const newObjectLogs = await this.prismaService.tbObject.findMany({
    //   where: {
    //     tbHotelId: 'ad85e6a3-f97d-4926-9e34-65add1617475',
    //   },
    // });
    // let res: any = {};
    // dev
    for (let i = 0; i < newObjectLogs.length; i++) {
      let objectLog = newObjectLogs[i];
      const hotelByObjectLog = await this.prismaService.tbHotel.findFirst({
        where: {
          id: objectLog.tbHotelId,
        },
      });
      // Nếu không phải ally thì bỏ qua
      if (hotelByObjectLog.type !== TYPE_HOTEL.ALLY) continue;
      //@ts-ignore
      const listOld: tbReview[] =
        oldReview?.[objectLog.tbHotelId]?.[objectLog.platform] ?? [];
      //@ts-ignore
      const listNew: tbReview[] =
        newReview?.[objectLog.tbHotelId]?.[objectLog.platform] ?? [];

      if (listNew.length === 0 || listOld.length === 0) continue;
      // dev check thay đổi review
      // if (
      //   hotelByObjectLog.id === 'ad85e6a3-f97d-4926-9e34-65add1617475' &&
      //   objectLog.platform === PLATFORM.TRIP
      // ) {
      //   res = {
      //     newReview,
      //     listOld,
      //     listNew,
      //   };
      // }
      // dev
      console.log('Cập nhật message thay đổi review');
      // Kiểm tra xem có review nào bị xoá không
      console.log(
        'Kiểm tra xem có rv bị xoá',
        hotelByObjectLog.name,
        objectLog.platform,
      );
      for (let i = 0; i < listOld.length; i++) {
        let flag = false;
        for (let j = 0; j < listNew.length; j++) {
          if (listNew[j].extra['reviewId'] === listOld[i].extra['reviewId']) {
            flag = true;
          }
        }
        if (!flag) {
          const messageReview = formatReview(listOld[i], 'remove');
          if (messageReview !== '') {
            console.log(messageReview, 'messageReview remove');
            objectLog = {
              ...objectLog,
              messages: objectLog.messages.concat(messageReview),
            };
          }
        }
      }
      console.log(
        'Kiểm tra xem có rv thêm mới',
        hotelByObjectLog.name,
        objectLog.platform,
      );
      for (let i = 0; i < listNew.length; i++) {
        let flag = false;
        for (let j = 0; j < listOld.length; j++) {
          if (listNew[i].extra['reviewId'] === listOld[j].extra['reviewId']) {
            flag = true;
          }
        }
        if (!flag) {
          const messageReview = formatReview(listNew[i], 'add');
          if (messageReview !== '') {
            console.log(messageReview, 'messageReview add');
            objectLog = {
              ...objectLog,
              messages: objectLog.messages.concat(messageReview),
            };
          }
        }
      }

      console.log('Update message objectlog');
      await this.prismaService.tbObjectLog.update({
        where: {
          id: objectLog.id,
        },
        data: {
          messages: objectLog.messages,
        },
      });

      console.log('Send noti');
      if (objectLog.messages.length > 0) {
        let title = '';
        if (objectLog.platform === PLATFORM.TRIP) {
          title = 'Kênh OTA: Tripadvisor\nKhách sạn ' + objectLog.name + '\n';
        }
        if (objectLog.platform === PLATFORM.BOOKING) {
          title = 'Kênh OTA: Booking\nKhách sạn ' + objectLog.name + '\n';
        }
        if (objectLog.platform === PLATFORM.GOOGLE) {
          title =
            'Kênh OTA: Google Reviews\nKhách sạn ' + objectLog.name + '\n';
        }
        if (objectLog.platform === PLATFORM.AGODA) {
          title = 'Kênh OTA: AGODA\nKhách sạn ' + objectLog.name + '\n';
        }
        if (objectLog.platform === PLATFORM.EXPEDIA) {
          title = 'Kênh OTA: Expedia\nKhách sạn ' + objectLog.name + '\n';
        }
        if (objectLog.platform === PLATFORM.TRAVELOKA) {
          title = 'Kênh OTA: Traveloka\nKhách sạn ' + objectLog.name + '\n';
        }

        this.objectService.sendNoti(
          objectLog.messages,
          title,
          objectLog.tbHotelId,
          objectLog.platform,
          objectLog,
        );
      }
    }

    console.log('Calc reivew in month');
    for (let i = 0; i < newObjectLogs.length; i++) {
      const objectLog = newObjectLogs[i];
      if (
        objectLog.platform !== PLATFORM.TRIP &&
        objectLog.platform !== PLATFORM.BOOKING
      ) {
        continue;
      }
      const {
        numberReviewBad,
        reviewBadInMonth,
        numberReviewHigh,
        reviewHighInMonth,
      } = await getSummaryReviewInMonth(
        this.prismaService,
        objectLog.platform,
        objectLog.tbHotelId,
        currentMonth,
        currentYear,
      );

      const currentDayInMont = moment().get('date');
      let reviewHigh = [],
        reviewBad = [];
      console.log('Calc reivew high in month');
      for (let i = 1; i <= currentDayInMont; i++) {
        let sum = 0;
        reviewHighInMonth.map((review) => {
          if (moment(review.createdAt).get('date') === i) {
            sum += 1;
          }
        });
        reviewHigh = reviewHigh.concat(sum);
      }
      console.log('Calc reivew bad in month');
      for (let i = 1; i <= currentDayInMont; i++) {
        let sum = 0;
        reviewBadInMonth.map((review) => {
          if (moment(review.createdAt).get('date') === i) {
            sum += 1;
          }
        });
        reviewBad = reviewBad.concat(sum);
      }

      // Cập nhật thông tin so sánh khách sạn
      console.log('Update competition hotel');
      const originCompetition =
        await this.prismaService.tbCompetition.findFirst({
          where: {
            month: currentMonth,
            year: currentYear,
            tbHotelId: objectLog.tbHotelId,
            platform: objectLog.platform,
          },
        });
      await this.prismaService.tbCompetition.upsert({
        where: {
          month_year_tbHotelId_platform: {
            month: currentMonth,
            year: currentYear,
            tbHotelId: objectLog.tbHotelId,
            platform: objectLog.platform,
          },
        },
        create: {
          month: currentMonth,
          year: currentYear,
          extra: {
            ...(originCompetition &&
              originCompetition.extra && {
                ...(originCompetition.extra as Prisma.JsonObject),
              }),
            ...(objectLog.platform === PLATFORM.TRIP && {
              rank: objectLog.extra['rank'],
              totalHotel: objectLog.extra['totalHotel'],
            }),
            ...(objectLog.platform === PLATFORM.BOOKING && {
              subScore: objectLog.extra['subScore'],
              stars: objectLog.extra['stars'],
            }),
          },
          numberReviewHighAll: objectLog.numberScoreReview[0],
          numberReviewHigh,
          reviewHigh,
          numberReviewBad,
          reviewBad,
          score: objectLog.score,
          tbHotelId: objectLog.tbHotelId,
          updatedAt: new Date(),
          platform: objectLog.platform,
        },
        update: {
          month: currentMonth,
          year: currentYear,
          extra: {
            ...(originCompetition &&
              originCompetition.extra && {
                ...(originCompetition.extra as Prisma.JsonObject),
              }),
            ...(objectLog.platform === PLATFORM.TRIP && {
              rank: objectLog.extra['rank'],
              totalHotel: objectLog.extra['totalHotel'],
            }),
            ...(objectLog.platform === PLATFORM.BOOKING && {
              subScore: objectLog.extra['subScore'],
              stars: objectLog.extra['stars'],
            }),
          },
          numberReviewHighAll: objectLog.numberScoreReview[0],
          numberReviewHigh,
          reviewHigh,
          numberReviewBad,
          reviewBad,
          score: objectLog.score,
          tbHotelId: objectLog.tbHotelId,
          updatedAt: new Date(),
          platform: objectLog.platform,
        },
      });
    }

    console.log('Crawl hotel, review done!!', startCrawl.fromNow());
    return {};
  }
}
