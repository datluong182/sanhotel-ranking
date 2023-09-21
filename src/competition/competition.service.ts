/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import {
  PLATFORM,
  PLATFORM_RESPONSE,
  TYPE_HOTEL,
  tbCompetition,
  tbHotel,
  tbReview,
} from '@prisma/client';
import { DataList, PagingDefault } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCompetition } from './competition.dto';
import _, { forInRight } from 'lodash';
import * as moment from 'moment-timezone';
import { NewReview } from 'src/review/review.entity';
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

  async getAllCompetition(): Promise<tbCompetition[]> {
    let result = await this.prismaService.tbCompetition.findMany({
      where: {
        tbHotel: {
          disable: {
            not: true,
          },
        },
      },
      include: {
        tbHotel: true,
      },
    });
    result = result.sort((a, b) => a.extra['rank'] - b.extra['rank']);
    return result;
  }

  @Cron(cronjobCrawlReviewEnv)
  async updateCompetition(): Promise<{ url: string[]; rank: number[] }> {
    const startCrawl = moment();
    console.log('Start crawl');

    // const res: NewObjectLog[] = await this.objectService.crawlSchedule();
    // console.log(
    //   res.filter((e) => e.platform === PLATFORM.TRIP),
    //   'res',
    // );
    // return;

    // ONLY FOR COMPETITION BOOKING
    // const objectBooking = await this.prismaService.tbObject.findMany({
    //   where: {
    //     platform: PLATFORM.BOOKING,
    //   },
    // });
    // for (let i = 0; i < objectBooking.length; i++) {
    //   const res = await this.objectService.crawlObject(
    //     objectBooking[i].url,
    //     PLATFORM.BOOKING,
    //   );
    //   await this.prismaService.tbObject.update({
    //     where: {
    //       id: objectBooking[i].id,
    //     },
    //     data: {
    //       extra: {
    //         ...(objectBooking[i].extra as object),
    //         subScore: res.extra.subScore ?? {},
    //       },
    //     },
    //   });
    //   console.log(objectBooking[i].name, res);
    // }
    // return;
    // ONLY FOR COMPETITION BOOKING

    // ONLY FOR COMPETITION TRIP
    const { url: urlTopHotel, rank: rankTopHotel } = await getTopHotelForTrip(
      this.prismaService,
      this.objectService,
    );
    // ONLY FOR COMPETITION TRIP

    const currentMonth = moment().get('month') + 1;
    // const currentMonth = 8;
    const currentYear = moment().get('year');

    // Get thông tin
    console.log('Get thông tin chung');
    const newObjectLogs: NewObjectLog[] =
      await this.objectService.crawlSchedule();

    // Cập nhật message cho objectLog
    let count = 0;
    console.log('Update rank trip');
    for (let i = 0; i < newObjectLogs.length; i++) {
      const objectLog = newObjectLogs[i];
      // const listOld: tbReview[] =
      //   oldReview?.[objectLog.tbHotelId]?.[objectLog.platform] ?? [];
      // const listNew: tbReview[] =
      //   newReview?.[objectLog.tbHotelId]?.[objectLog.platform] ?? [];
      // console.log('Cập nhật message thay đổi review');
      // // Kiểm tra xem có review nào bị xoá không
      // console.log('Kiểm tra xem có rv bị xoá', i);
      // for (let i = 0; i < listOld.length; i++) {
      //   let flag = false;
      //   for (let j = 0; j < listNew.length; j++) {
      //     if (listNew[j].extra['reviewId'] === listOld[i].extra['reviewId']) {
      //       flag = true;
      //     }
      //   }
      //   if (!flag) {
      //     const messageReview = formatReview(listOld[i], 'remove');
      //     objectLog = {
      //       ...objectLog,
      //       messages: objectLog.messages.concat(messageReview),
      //     };
      //   }
      // }
      // console.log('Kiểm tra xem có rv thêm mới', i);
      // for (let i = 0; i < listNew.length; i++) {
      //   let flag = false;
      //   for (let j = 0; j < listOld.length; j++) {
      //     if (listNew[i].extra['reviewId'] === listOld[j].extra['reviewId']) {
      //       flag = true;
      //     }
      //   }
      //   if (!flag) {
      //     const messageReview = formatReview(listOld[i], 'add');
      //     objectLog = {
      //       ...objectLog,
      //       messages: objectLog.messages.concat(messageReview),
      //     };
      //   }
      // }

      // Gửi thông báo
      // console.log('Send noti');
      // if (objectLog.messages.length > 0) {
      //   let title = '';
      //   if (objectLog.platform === PLATFORM.TRIP) {
      //     title = 'Kênh OTA: Tripadvisor\nKhách sạn ' + objectLog.name + '\n';
      //   }
      //   if (objectLog.platform === PLATFORM.BOOKING) {
      //     title = 'Kênh OTA: Booking\nKhách sạn ' + objectLog.name + '\n';
      //   }
      //   if (objectLog.platform === PLATFORM.GOOGLE) {
      //     title =
      //       'Kênh OTA: Google Reviews\nKhách sạn ' + objectLog.name + '\n';
      //   }
      //   this.objectService.sendNoti(
      //     objectLog.messages,
      //     title,
      //     objectLog.tbHotelId,
      //     objectLog.platform,
      //     objectLog,
      //   );
      // }

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
      //@ts-ignore
      oldReview = {
        ...oldReview,
        [hotel.id]: {
          TRIP: listRvTrip,
          BOOKING: listRvBooking,
          GOOGLE: listRvGoogle,
        },
      };
    }

    console.log('Crawl review');
    const newReview = await this.reviewService.crawlSchedule(
      true,
      currentMonth,
      currentYear,
    );

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
            ...(objectLog.platform === PLATFORM.TRIP && {
              rank: objectLog.extra['rank'],
              totalHotel: objectLog.extra['totalHotel'],
            }),
            ...(objectLog.platform === PLATFORM.BOOKING && {
              subScore: objectLog.extra['subScore'],
              score: objectLog.extra['score'],
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
            ...(objectLog.platform === PLATFORM.TRIP && {
              rank: objectLog.extra['rank'],
              totalHotel: objectLog.extra['totalHotel'],
            }),
            ...(objectLog.platform === PLATFORM.BOOKING && {
              subScore: objectLog.extra['subScore'],
              score: objectLog.extra['score'],
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
    return {
      url: urlTopHotel,
      rank: rankTopHotel,
    };
  }
}
