/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  PLATFORM,
  PLATFORM_RESPONSE,
  Prisma,
  TYPE_HOTEL,
  tbCompetition,
  tbCompetitionOTA,
  tbHotel,
  tbObject,
  tbReview,
} from '@prisma/client';
import { DataList, PagingDefault } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CalCompetition,
  CalCompetitionOTA,
  QueryAllCompetition,
  QueryCompetition,
  QueryCompetitionOTA,
  UpdateCompetitionOTA,
} from './competition.dto';
import _, { forInRight } from 'lodash';
import * as moment from 'moment-timezone';
import {
  NewReview,
  Review,
  ReviewGoogle,
  ReviewTrip,
} from 'src/review/review.entity';
import { ReviewService } from 'src/review/review.service';
import { ObjectService } from 'src/object/object.service';
import { Cron } from '@nestjs/schedule';
import { NewObjectLog } from 'src/object/object.entity';
import {
  MIN_RATIO_IN_MONTH,
  formatReview,
  getNumberReviewHighAll,
  getRatioInMonth,
  getScoreInMonth,
  getSummaryReviewInMonth,
} from './utils';
import {
  calcCompetitionBase,
  compareUrlHotel,
  getTopHotelForTrip,
  updateCompetitionOTABase,
} from './utils/competition';
import { HttpService } from '@nestjs/axios';
import extractReviewGoogle from 'src/review/utils/google';
import { platform } from 'os';
import extractReviewAgoda from 'src/review/utils/agoda';
import extractDataExpedia from 'src/object/utils/expedia';
import extractDataTraveloka from 'src/object/utils/traveloka';
import { CompetitionOTA, ObjectOTA } from './competition.entity';
import {
  getReviewsOtaInMonth,
  getScoreByReviewsOtaInMonth,
} from './utils/reviewsOtaInMonth';
import extractReviewTrip from 'src/review/utils/trip_old';
import { Builder, Capabilities } from 'selenium-webdriver';
import { CONFIG_GLOBAL, seleniumUrl } from 'src/utils';
import { ConfigService } from 'src/config/config.service';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const cronjobCrawlReviewEnv = process.env.CRONJOB_CRAWL_REVIEW;

@Injectable()
export class CompetitionService {
  constructor(
    private prismaService: PrismaService,
    private reviewService: ReviewService,
    private objectService: ObjectService,
    private configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    console.log('init competition service');
  }

  async getCompetition(
    query: QueryCompetition
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
    query: QueryAllCompetition
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

  async sendNotiStartCrawl() {
    try {
      const urlStart = `https://api.telegram.org/bot${
        process.env.API_KEY_TELE
      }/sendMessage?chat_id=${
        process.env.CHAT_ID_TELE
      }&text=${encodeURIComponent(
        'Bắt đầu'
      )}&parse_mode=html&disable_web_page_preview=true`;
      await this.httpService.axiosRef.get(urlStart);
    } catch (error) {
      console.log('Send noti Telegram Start crawl ERROR: ', error);
    }
  }

  async sendNotiEndCrawl() {
    try {
      const urlEnd = `https://api.telegram.org/bot${
        process.env.API_KEY_TELE
      }/sendMessage?chat_id=${
        process.env.CHAT_ID_TELE
      }&text=${encodeURIComponent(
        'Kết thúc'
      )}&parse_mode=html&disable_web_page_preview=true`;
      await this.httpService.axiosRef.get(urlEnd);
    } catch (error) {
      console.log('Send noti Telegram End crawl ERROR: ', error);
    }
  }

  async sendNotiCrawlError(message: string) {
    try {
      const urlEnd = `https://api.telegram.org/bot${
        process.env.API_KEY_TELE
      }/sendMessage?chat_id=${
        process.env.CHAT_ID_TELE
      }&text=${encodeURIComponent(
        'ERROR: ' + message
      )}&parse_mode=html&disable_web_page_preview=true`;
      await this.httpService.axiosRef.get(urlEnd);
    } catch (error) {
      console.log('Send noti Telegram End crawl ERROR: ', error);
    }
  }

  @Cron(cronjobCrawlReviewEnv)
  async crawlHotelAndReview(): Promise<void> {
    const isCrawling = await this.configService.getStatusCrawlService();
    if (isCrawling) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Crawl service is running',
        },
        HttpStatus.BAD_REQUEST
      );
    }
    await this.configService.updateStatusCrawlService(true);

    const startCrawl = moment();
    console.log('Start crawl');
    void this.sendNotiStartCrawl();

    try {
      await this.updateCompetition();
      console.log('Crawl hotel, review done!!', startCrawl.fromNow());
      void this.sendNotiEndCrawl();
    } catch (error) {
      console.log('Crawl hotel, review ERROR!!', error);
      void this.sendNotiCrawlError(error?.message || '');
    }

    await this.configService.updateStatusCrawlService(false);
  }

  async updateCompetition(): Promise<any> {
    // dev
    // return this.reviewService.crawlSchedule();
    // dev

    const currentMonth = moment().get('month') + 1;
    // const currentMonth = 8;
    const currentYear = moment().get('year');

    // return await extractDataTraveloka(
    //   PLATFORM.EXPEDIA,
    //   this.httpService,
    //   'https://www.traveloka.com/en-en/hotel/vietnam/san-grand-hotel--spa-9000000987418',
    // );

    // dev
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
    // dev

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
      this.objectService
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
          if (compareUrlHotel(objectLog.url, urlTopHotel[j])) {
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
      if (hotel.id === 'b50f91fe-d8e0-4e61-9322-e9a9011d6597') {
        // Hiện tại chỉ get thông tin TRIP và GOOGLE của San Dinning. Chưa làm gì khác. Không get review San Dinning
        continue;
      }
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

      // Review trip.com cũ
      const listRvTripcom = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.TRIPCOM,
        },
      });

      // Review san hn cũ
      const listRvSanHN = await this.prismaService.tbReview.findMany({
        where: {
          tbHotelId: hotel.id,
          monthCreated: currentMonth,
          yearCreated: currentYear,
          platform: PLATFORM.SANHN,
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
          TRIPCOM: listRvTripcom,
          SANHN: listRvSanHN,
        },
      };
    }

    console.log('Crawl review');
    const { newReview } = await this.reviewService.crawlSchedule(
      true,
      currentMonth,
      currentYear
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
        objectLog.platform
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
        objectLog.platform
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
        if (objectLog.platform === PLATFORM.TRIPCOM) {
          title = 'Kênh OTA: Trip.com\nKhách sạn ' + objectLog.name + '\n';
        }
        if (objectLog.platform === PLATFORM.SANHN) {
          title = 'Kênh OTA: San HN\nKhách sạn ' + objectLog.name + '\n';
        }

        this.objectService.sendNoti(
          objectLog.messages,
          title,
          objectLog.tbHotelId,
          objectLog.platform,
          //@ts-ignore
          objectLog
        );
      }
    }

    console.log('Calc reivew in month');
    await calcCompetitionBase(
      newObjectLogs,
      this.prismaService,
      currentMonth,
      currentYear
    );
    // for (let i = 0; i < newObjectLogs.length; i++) {
    //   const objectLog = newObjectLogs[i];
    //   if (
    //     objectLog.platform !== PLATFORM.TRIP
    //     // objectLog.platform !== PLATFORM.BOOKING
    //   ) {
    //     continue;
    //   }
    //   const {
    //     numberReviewBad,
    //     reviewBadInMonth,
    //     numberReviewHigh,
    //     reviewHighInMonth,
    //   } = await getSummaryReviewInMonth(
    //     this.prismaService,
    //     objectLog.platform,
    //     objectLog.tbHotelId,
    //     currentMonth,
    //     currentYear
    //   );

    //   const currentDayInMont = moment().get('date');
    //   let reviewHigh = [],
    //     reviewBad = [];
    //   console.log('Calc reivew high in month');
    //   for (let i = 1; i <= currentDayInMont; i++) {
    //     let sum = 0;
    //     reviewHighInMonth.map((review) => {
    //       if (moment(review.createdAt).get('date') === i) {
    //         sum += 1;
    //       }
    //     });
    //     reviewHigh = reviewHigh.concat(sum);
    //   }
    //   console.log('Calc reivew bad in month');
    //   for (let i = 1; i <= currentDayInMont; i++) {
    //     let sum = 0;
    //     reviewBadInMonth.map((review) => {
    //       if (moment(review.createdAt).get('date') === i) {
    //         sum += 1;
    //       }
    //     });
    //     reviewBad = reviewBad.concat(sum);
    //   }

    //   // Cập nhật thông tin so sánh khách sạn
    //   console.log('Update competition hotel');
    //   const originCompetition =
    //     await this.prismaService.tbCompetition.findFirst({
    //       where: {
    //         month: currentMonth,
    //         year: currentYear,
    //         tbHotelId: objectLog.tbHotelId,
    //         platform: objectLog.platform,
    //       },
    //     });
    //   await this.prismaService.tbCompetition.upsert({
    //     where: {
    //       month_year_tbHotelId_platform: {
    //         month: currentMonth,
    //         year: currentYear,
    //         tbHotelId: objectLog.tbHotelId,
    //         platform: objectLog.platform,
    //       },
    //     },
    //     create: {
    //       month: currentMonth,
    //       year: currentYear,
    //       extra: {
    //         ...(originCompetition &&
    //           originCompetition.extra && {
    //             ...(originCompetition.extra as Prisma.JsonObject),
    //           }),
    //         ...(objectLog.platform === PLATFORM.TRIP && {
    //           rank: objectLog.extra['rank'],
    //           totalHotel: objectLog.extra['totalHotel'],
    //         }),
    //       },
    //       numberReviewHighAll: objectLog.numberScoreReview[0],
    //       numberReviewHigh,
    //       reviewHigh,
    //       numberReviewBad,
    //       reviewBad,
    //       score: objectLog.score,
    //       tbHotelId: objectLog.tbHotelId,
    //       updatedAt: new Date(),
    //       platform: objectLog.platform,
    //     },
    //     update: {
    //       month: currentMonth,
    //       year: currentYear,
    //       extra: {
    //         ...(originCompetition &&
    //           originCompetition.extra && {
    //             ...(originCompetition.extra as Prisma.JsonObject),
    //           }),
    //         ...(objectLog.platform === PLATFORM.TRIP && {
    //           rank: objectLog.extra['rank'],
    //           totalHotel: objectLog.extra['totalHotel'],
    //         }),
    //       },
    //       numberReviewHighAll: objectLog.numberScoreReview[0],
    //       numberReviewHigh,
    //       reviewHigh,
    //       numberReviewBad,
    //       reviewBad,
    //       score: objectLog.score,
    //       tbHotelId: objectLog.tbHotelId,
    //       updatedAt: new Date(),
    //       platform: objectLog.platform,
    //     },
    //   });
    // }

    console.log('Update competition ota');
    await this.updateCompetitionReviewOta({});

    return {};
  }

  async calcCompetition(data: CalCompetition): Promise<void> {
    let currentMonth = moment().get('month') + 1;
    // const currentMonth = 8;
    let currentYear = moment().get('year');
    if (data.month && data.year) {
      currentMonth = parseInt(data.month);
      currentYear = parseInt(data.year);
    }

    const objectLogs = await this.prismaService.tbObject.findMany({
      where: {
        platform: PLATFORM.TRIP,
      },
    });

    await calcCompetitionBase(
      objectLogs,
      this.prismaService,
      currentMonth,
      currentYear
    );
  }

  async getCompetitionReviewOta(query: QueryCompetitionOTA): Promise<{
    objects: ObjectOTA[];
    competitions: CompetitionOTA[];
  }> {
    console.log(query);
    const hotels = await this.prismaService.tbHotel.findMany({
      where: {
        id: {
          in: query.tbHotelIds,
        },
      },
    });
    const results = await this.prismaService.tbCompetitionOTA.findMany({
      where: {
        tbObject: {
          tbHotelId: {
            in: query.tbHotelIds,
          },
          OR: query.platforms.map((platform) => ({
            platform,
          })),
        },
        month: parseInt(query.month),
        year: parseInt(query.year),
      },
      include: {
        tbObject: {
          include: {
            tbHotel: true,
          },
        },
        reviews: {
          select: {
            tbReview: true,
          },
        },
      },
    });
    const objectOTA: ObjectOTA[] = results.map((result) => ({
      id: result.id,
      tbObject: result.tbObject,
      tbObjectId: result.tbObjectId,
      score: result.score,
      month: result.month,
      year: result.year,
      extra: {
        volume: result.extra['volume']
          ? result.extra['volume'].toString()
          : '0',
        checkoutInMonth: result.extra['checkoutInMonth'],
      },
      reviews: result.reviews.map((review) => review.tbReview),
    }));

    const platforms = query.platforms;

    let competitionOTA: CompetitionOTA[] = [];
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      let temp: CompetitionOTA = {
        name: hotel.name,
        tbHotelId: hotel.id,
        score: 0,
        ratioInMonth: -1,
        numberBookingCO: 0,
        numberReviews: 0,
        totalScoreNoDevice: 0,
        OTA: {},
      };
      platforms.map((platform) => {
        const object = objectOTA.filter(
          (obj) =>
            obj.tbObject.platform === platform &&
            obj.tbObject.tbHotelId === hotel.id
        )?.[0];
        temp = {
          ...temp,
          OTA: {
            ...temp.OTA,
            [platform]: object,
          },
        };
      });
      competitionOTA = competitionOTA.concat(temp);
    }

    competitionOTA = competitionOTA.map((item) => {
      const { ratioInMonth, numberBookingCO, numberReviews } =
        getRatioInMonth(item);
      const {
        totalScore: score,
        totalScoreNoDevice,
        scoreMinus,
        scorePlus,
      } = getScoreInMonth(item);
      console.log(item.name, scoreMinus, scorePlus, score);
      // if (ratioInMonth >= MIN_RATIO_IN_MONTH) {
      //   score = getScoreInMonth(item);
      // }
      return {
        ...item,
        score,
        ratioInMonth,
        numberReviews,
        totalScoreNoDevice,
        numberBookingCO,
        extra: {
          scoreMinus,
          scorePlus,
        },
      };
    });

    if (
      platforms.length !== 1 ||
      (platforms.length === 1 &&
        platforms[0] !== PLATFORM.TRIP &&
        platforms[0] !== PLATFORM.GOOGLE)
    ) {
      competitionOTA = competitionOTA.sort((a, b) => {
        // Nếu ptu a chưa đủ tỉ lệ chuyển đổi, ptu b đủ tỉ lệ chuyển đổi. Xếp b lên trước a
        if (
          a.ratioInMonth < MIN_RATIO_IN_MONTH &&
          b.ratioInMonth >= MIN_RATIO_IN_MONTH
        ) {
          return 1;
        }

        // Nếu ptu a đủ tỉ lệ chuyển đổi, ptu b chưa đủ tỉ lệ chuyển đổi. Xếp a lên trước b
        if (
          a.ratioInMonth >= MIN_RATIO_IN_MONTH &&
          b.ratioInMonth < MIN_RATIO_IN_MONTH
        ) {
          return -1;
        }

        // Nếu a và b cùng đủ tỉ lệ chuyển đổi
        if (a.score != b.score) {
          return b.score > a.score ? 1 : -1;
        }
        return b.ratioInMonth > a.ratioInMonth ? 1 : -1;
      });
    } else {
      competitionOTA = competitionOTA.sort((a, b) => b.score - a.score);
    }

    return {
      objects: objectOTA,
      competitions: competitionOTA,
    };
  }

  async updateCompetitionReviewOta(data: CalCompetitionOTA) {
    let currentMonth = moment().get('month') + 1;
    // const currentMonth = 8;
    let currentYear = moment().get('year');
    if (data.month && data.year) {
      currentMonth = parseInt(data.month);
      currentYear = parseInt(data.year);
    }
    console.log('Get objects ally');
    const objectsAlly = await this.prismaService.tbObject.findMany({
      where: {
        tbHotel: {
          type: TYPE_HOTEL.ALLY,
          // dev
          // id: 'ad85e6a3-f97d-4926-9e34-65add1617475',
          // dev
        },
        // dev
        // platform: PLATFORM.AGODA,
        // dev
      },
    });
    console.log(objectsAlly.length, 'length ally');

    console.log('Update best enemy');
    console.log('Find best enemy tripadvisor');
    const objectTripEnemyBest = await this.prismaService.tbObject.findFirst({
      where: {
        tbHotel: {
          type: TYPE_HOTEL.ENEMY,
        },
        platform: PLATFORM.TRIP,
        extra: {
          path: ['rank'],
          equals: 1,
        },
      },
    });
    if (objectTripEnemyBest) {
      const hotelEnemyBest = await this.prismaService.tbHotel.findFirst({
        where: {
          id: objectTripEnemyBest.tbHotelId,
        },
      });
      const platforms = [
        PLATFORM.TRIP,
        PLATFORM.GOOGLE,
        PLATFORM.AGODA,
        PLATFORM.EXPEDIA,
        PLATFORM.TRAVELOKA,
        PLATFORM.TRIPCOM,
      ];
      for (let i = 0; i < platforms.length; i++) {
        console.log('Check object enemy', platforms[i]);
        const object = await this.prismaService.tbObject.findFirst({
          where: {
            tbHotelId: hotelEnemyBest.id,
            platform: platforms[i],
          },
        });
        if (!object && hotelEnemyBest.links[platforms[i]]) {
          console.log('Create object enemy', platforms[i]);
          await this.objectService.createObject({
            url: hotelEnemyBest.links[platforms[i]],
            tbHotelId: hotelEnemyBest.id,
            platform: platforms[i],
          });
        } else {
          if (!hotelEnemyBest.links[platforms[i]]) {
            console.log('Link object enemy is not exist', platforms[i]);
          } else {
            console.log('Object enemy existed', platforms[i]);
          }
        }
      }
    }

    console.log('Update competition OTA objects ally');
    for (let i = 0; i < objectsAlly.length; i++) {
      const objectAlly = objectsAlly[i];
      console.log(objectAlly.name, objectAlly.platform);
      await updateCompetitionOTABase(
        this.prismaService,
        objectAlly,
        currentMonth,
        currentYear
      );
    }

    if (objectTripEnemyBest) {
      console.log('Get objects enemy');
      const objectsEnemy = await this.prismaService.tbObject.findMany({
        where: {
          tbHotelId: objectTripEnemyBest.tbHotelId,
        },
      });
      console.log('Update competition OTA objects enemy');
      for (let i = 0; i < objectsEnemy.length; i++) {
        const objectEnemy = objectsEnemy[i];
        console.log(objectEnemy.name, objectEnemy.platform);
        await updateCompetitionOTABase(
          this.prismaService,
          objectEnemy,
          currentMonth,
          currentYear
        );
      }
      console.log('Delete old competition OTA enemy');
      await this.prismaService.tbCompetitionOTA.deleteMany({
        where: {
          tbObject: {
            tbHotelId: {
              not: objectTripEnemyBest.tbHotelId,
            },
          },
          type: TYPE_HOTEL.ENEMY,
        },
      });
    }
  }

  async updatePropertyCompetitionOTA(data: UpdateCompetitionOTA) {
    const origin = await this.prismaService.tbCompetitionOTA.findFirst({
      where: {
        id: data.id,
      },
    });
    console.log(origin, data.id, data, 'origin');
    await this.prismaService.tbCompetitionOTA.update({
      where: {
        id: origin.id,
      },
      data: {
        ...origin,
        ...data.data,
        extra: {
          ...(origin.extra as object),
          ...data.data?.extra,
        },
      },
    });
  }

  async updatePropertyManyCompetitionOTA(data: UpdateCompetitionOTA[]) {
    for (let i = 0; i < data.length; i++) {
      await this.updatePropertyCompetitionOTA(data[i]);
    }
  }
}
