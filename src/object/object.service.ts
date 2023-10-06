import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PLATFORM, TYPE_HOTEL, tbObject, tbObjectLog } from '@prisma/client';
import * as moment from 'moment-timezone';
import { Options } from 'selenium-webdriver/chrome';
import { Builder, Capabilities } from 'selenium-webdriver';
import { seleniumUrl } from 'src/utils';
import { DataList, Paging } from '../app.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObject, GetLastUpdate, UpdateObjectByUrl } from './object.dto';
import { NewObjectLog, Objects } from './object.entity';
import extractDataBoooking from './utils/booking';
import extractDataTrip from './utils/trip';
import { HttpService } from '@nestjs/axios';
import extractDataGoogle from './utils/google';
import extractDataAgoda from './utils/agoda';
import extractDataExpedia from './utils/expedia';
import extractDataTraveloka from './utils/traveloka';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const token = process.env.TOKEN_HUBSPOT;

const cronjobCrawlObjectEnv = process.env.CRONJOB_CRAWL_OBJECT;

async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

@Injectable()
export class ObjectService {
  constructor(
    private prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {
    console.log('init object service');
  }

  async getLastUpdate(query: GetLastUpdate): Promise<{ updatedAt: Date }> {
    console.log(query, 'query');
    const setting = await this.prismaService.tbLastUpdate.findFirst({
      where: {
        isManual: true,
        platform: query.platform,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    console.log(setting, 'setting');
    return {
      updatedAt: setting.updatedAt,
    };
  }

  async createLastUpdate(
    date: string,
    platform: PLATFORM,
    isManual = true,
  ): Promise<void> {
    await this.prismaService.tbLastUpdate.create({
      data: {
        isManual,
        platform,
        updatedAt: moment(new Date(date)).toDate(),
      },
    });
  }

  async getOneObject(id: string): Promise<{ data: tbObject | undefined }> {
    console.log('get one');
    return {
      data: await this.prismaService.tbObject.findFirst({
        where: {
          id,
        },
      }),
    };
  }

  async getAllObject(query: Paging): Promise<DataList<tbObject>> {
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
    const count = await this.prismaService.tbObject.count({
      where: {
        ...query.cond,
        platform: query.platform as PLATFORM,
        tbHotel: {
          disable: {
            not: true,
          },
        },
      },
    });
    let data: tbObject[];
    console.log(query.cond, 'cond get object');
    if (query.platform === 'TRIP') {
      if (query?.cond?.['tbHotel']?.type === TYPE_HOTEL.ALLY) {
        data = await this.prismaService
          .$queryRaw`SELECT * FROM "tbObject", "tbHotel" WHERE "tbHotel"."type"='ALLY' and "tbHotel"."disable"!=true and "tbHotel"."id"="tbObject"."tbHotelId" and  "platform" = 'TRIP' ORDER BY ("extra"->'rank') asc OFFSET ${
          parseInt(query.page) * parseInt(query.limit)
        } LIMIT ${parseInt(query.limit)}`;
      } else if (query?.cond?.['tbHotel']?.type === TYPE_HOTEL.ENEMY) {
        data = await this.prismaService
          .$queryRaw`SELECT * FROM "tbObject", "tbHotel" WHERE "tbHotel"."type"='ENEMY' and "tbHotel"."disable"!=true and "tbHotel"."id"="tbObject"."tbHotelId" and  "platform" = 'TRIP' ORDER BY ("extra"->'rank') asc OFFSET ${
          parseInt(query.page) * parseInt(query.limit)
        } LIMIT ${parseInt(query.limit)}`;
      } else {
        data = await this.prismaService
          .$queryRaw`SELECT * FROM "tbObject", "tbHotel" WHERE "tbHotel"."disable"!=true and "tbHotel"."id"="tbObject"."tbHotelId" and "platform" = 'TRIP' ORDER BY ("extra"->'rank') asc OFFSET ${
          parseInt(query.page) * parseInt(query.limit)
        } LIMIT ${parseInt(query.limit)}`;
      }
    }
    if (query.platform === 'BOOKING') {
      if (query?.cond?.['tbHotel']?.type === TYPE_HOTEL.ALLY) {
        data = await this.prismaService
          .$queryRaw`SELECT * FROM "tbObject", "tbHotel" WHERE "tbHotel"."type"='ALLY' and "tbHotel"."disable"!=true and "tbHotel"."id"="tbObject"."tbHotelId" and "platform" = 'BOOKING' ORDER BY score desc OFFSET ${
          parseInt(query.page) * parseInt(query.limit)
        } LIMIT ${parseInt(query.limit)}`;
      } else if (query?.cond?.['tbHotel']?.type === TYPE_HOTEL.ENEMY) {
        data = await this.prismaService
          .$queryRaw`SELECT * FROM "tbObject", "tbHotel" WHERE "tbHotel"."type"='ENEMY' and "tbHotel"."disable"!=true and "tbHotel"."id"="tbObject"."tbHotelId" and "platform" = 'BOOKING' ORDER BY score desc OFFSET ${
          parseInt(query.page) * parseInt(query.limit)
        } LIMIT ${parseInt(query.limit)}`;
      } else {
        data = await this.prismaService
          .$queryRaw`SELECT * FROM "tbObject", "tbHotel" WHERE "tbHotel"."disable"!=true and "tbHotel"."id"="tbObject"."tbHotelId" and "platform" = 'BOOKING' ORDER BY score desc OFFSET ${
          parseInt(query.page) * parseInt(query.limit)
        } LIMIT ${parseInt(query.limit)}`;
      }
    }
    if (query.platform === 'GOOGLE') {
      data = await this.prismaService
        .$queryRaw`SELECT * FROM "tbObject" WHERE "platform" = 'GOOGLE' ORDER BY score desc OFFSET ${parseInt(
        query.page,
      )} LIMIT ${parseInt(query.limit)}`;
    }
    if (query.platform === 'AGODA') {
      data = await this.prismaService
        .$queryRaw`SELECT * FROM "tbObject" WHERE "platform" = 'AGODA' ORDER BY score desc OFFSET ${parseInt(
        query.page,
      )} LIMIT ${parseInt(query.limit)}`;
    }
    if (query.platform === 'EXPEDIA') {
      data = await this.prismaService
        .$queryRaw`SELECT * FROM "tbObject" WHERE "platform" = 'EXPEDIA' ORDER BY score desc OFFSET ${parseInt(
        query.page,
      )} LIMIT ${parseInt(query.limit)}`;
    }
    if (query.platform === 'TRAVELOKA') {
      data = await this.prismaService
        .$queryRaw`SELECT * FROM "tbObject" WHERE "platform" = 'TRAVELOKA' ORDER BY score desc OFFSET ${parseInt(
        query.page,
      )} LIMIT ${parseInt(query.limit)}`;
    }

    return {
      count,
      page: query.page,
      limit: query.limit,
      data,
    };
  }

  async createObject(data: CreateObject): Promise<tbObject | undefined> {
    console.log(data, 'data create object');
    const hotel = await this.prismaService.tbHotel.findFirst({
      where: {
        id: data.tbHotelId,
      },
    });
    const objectTrip = await this.crawlObject(data.url, data.platform);
    console.log(objectTrip, 'crawl object done');
    if (!objectTrip) return undefined;
    const newObjectTrip = await this.prismaService.tbObject.create({
      data: {
        ...objectTrip,
        name: hotel.name,
        extra: objectTrip.extra,
        tbHotelId: data.tbHotelId,
        platform: data.platform,
        updatedAt: new Date(),
      },
    });
    return newObjectTrip;
  }

  compareChange(origin: tbObject, newData: any): string[] {
    let messsages = [];

    if (
      newData?.extra?.rank &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      origin?.extra?.rank &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      origin?.extra?.rank !== newData?.extra?.rank
    ) {
      messsages = messsages.concat(
        `${
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          origin.extra?.rank > newData.extra.rank ? 'U.' : 'D.'
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
        }Xếp hạng thay đổi từ #${origin.extra?.rank} đến #${
          newData.extra.rank
        }`,
      );
    }
    if (
      newData.score &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      origin.score &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      origin.score !== newData.score
    ) {
      messsages = messsages.concat(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        `${
          origin.score > newData.score ? 'D.' : 'U.'
        }Điểm đánh giá thay đổi từ ${origin.score} đến ${newData.score}`,
      );
    }
    for (let i = 0; i < origin.numberScoreReview.length; i++) {
      if (
        origin.numberScoreReview[i] &&
        newData.numberScoreReview[i] &&
        origin.numberScoreReview[i] !== newData.numberScoreReview[i]
      ) {
        // G: Good, B: Bad
        if (origin.platform === PLATFORM.TRIP) {
          messsages = messsages.concat(
            `${5 - i === 5 ? 'G' : 'B'}.Số lượng đánh giá ${
              5 - i
            } sao thay đổi từ ${origin.numberScoreReview[i]} đánh giá thành ${
              newData.numberScoreReview[i]
            } đánh giá`,
          );
        }
        if (origin.platform === PLATFORM.BOOKING) {
          messsages = messsages.concat(
            `${i === 0 ? 'G' : 'B'}.Số lượng đánh giá ${
              i === 0
                ? '9+'
                : i === 1
                ? '7-9'
                : i === 2
                ? '5-7'
                : i === 3
                ? '3-5'
                : '1-3'
            }đ thay đổi từ ${origin.numberScoreReview[i]} đánh giá thành ${
              newData.numberScoreReview[i]
            } đánh giá`,
          );
        }
        if (origin.platform === PLATFORM.GOOGLE) {
          messsages = messsages.concat(
            `${5 - i === 5 ? 'G' : 'B'}.Số lượng đánh giá ${
              5 - i
            }đ thay đổi từ ${origin.numberScoreReview[i]} đánh giá thành ${
              newData.numberScoreReview[i]
            } đánh giá`,
          );
        }
        if (origin.platform === PLATFORM.AGODA) {
          messsages = messsages.concat(
            `${i === 0 ? 'G' : 'B'}.Số lượng đánh giá ${
              i === 0
                ? '9+'
                : i === 1
                ? '8-9'
                : i === 2
                ? '7-8'
                : i === 3
                ? '6-7'
                : '1-6'
            }đ thay đổi từ ${origin.numberScoreReview[i]} đánh giá thành ${
              newData.numberScoreReview[i]
            } đánh giá`,
          );
        }

        if (origin.platform === PLATFORM.EXPEDIA) {
          messsages = messsages.concat(
            `${i === 0 ? 'G' : 'B'}.Số lượng đánh giá ${
              i === 0
                ? '9+'
                : i === 1
                ? '7-9'
                : i === 2
                ? '5-7'
                : i === 3
                ? '3-5'
                : '1-3'
            }đ thay đổi từ ${origin.numberScoreReview[i]} đánh giá thành ${
              newData.numberScoreReview[i]
            } đánh giá`,
          );
        }
      }
    }
    return messsages;
  }

  formatMessage(message: string) {
    //Nếu message là thông báo thay đổi số lượng review hoặc thay đổi điểm/xếp hạng (Có G.||B.||U.||D.)
    let res = '';
    if (
      message.search('G.') !== -1 ||
      message.search('B.') !== -1 ||
      message.search('U.') !== -1 ||
      message.search('D.') !== -1
    ) {
      res = message.split('.')[1];
      return res;
    }
    // Nếu message là thông báo có bình luận được thêm mới hoặc bị xoá - Chỉ thông báo các bình luận xấu
    if (message.search('|') !== -1) {
      // Nếu là thông báo có bình luận mới
      res = message.split('|')[0];
      return res;
    }
    // Nếu là thông báo bình luận bị xoá
    res = message;
    return res;
  }

  async sendNoti(
    messages: string[],
    title = '',
    tbHotelId: string,
    platform: PLATFORM,
    object: tbObject,
  ): Promise<void> {
    // const objLog = await this.prismaService.tbObjectLog.findFirst({
    //   where: {
    //     id: "15f7f217-ecfe-426f-a737-58fcb01ae600",
    //   }
    // })
    // const obj = await this.prismaService.tbObject.findFirst({})
    // const str = "Tripadvisor - Khách sạn " + obj.name + `(<a href="http://ranking.sanhotelseries.com/manage/hotel/${obj.tbHotelId}">Ranking ${obj.name}</a> - <a href="${obj.url}">Tripadvisor</a>)` + "\n";
    const namePlatform = {
      TRIP: 'Tripadvisor',
      BOOKING: 'Booking',
      GOOGLE: 'Google Reviews',
      AGODA: 'Agoda',
      EXPEDIA: 'Expedia',
      TRAVELOKA: 'Traveloka',
    };
    let notification_text = title + 'Đã có những thay đổi:\n';
    messages.map((message) => {
      notification_text += '- ' + this.formatMessage(message) + '\n';
    });
    notification_text += 'Kiểm tra tại:\n';
    notification_text += `- <a href="http://ranking.sanhotelseries.com/manage/hotel/detail/${tbHotelId}">Ranking ${object.name}</a>\n`;
    notification_text += `- <a href="${object.url}">${namePlatform[platform]}</a>`;
    const url = `https://api.telegram.org/bot${
      process.env.API_KEY_TELE
    }/sendMessage?chat_id=${process.env.CHAT_ID_TELE}&text=${encodeURIComponent(
      notification_text,
    )}&parse_mode=html&disable_web_page_preview=true`;
    console.log(url, object, 'url');
    this.httpService.axiosRef.get(url);
  }

  async updateObject(
    data: tbObject,
    updatedAt: Date | undefined = undefined,
  ): Promise<{ updated: tbObject; messages: string[] }> {
    const hotel = await this.prismaService.tbHotel.findFirst({
      where: {
        id: data.tbHotelId,
      },
    });
    const object = await this.crawlObject(data.url, data.platform);
    if (!object) return undefined;
    const origin = await this.prismaService.tbObject.findFirst({
      where: {
        id: data.id,
      },
      include: {
        tbHotel: true,
      },
    });
    const messages =
      origin.tbHotel?.type === TYPE_HOTEL.ALLY
        ? this.compareChange(origin, object)
        : [];
    const updatedObjectTrips = await this.prismaService.tbObject.update({
      where: {
        id: data.id,
      },
      data: {
        // ...origin,
        ...object,
        extra: {
          ...(origin.extra as object),
          ...(object.extra as object),
        },
        name: hotel.name,
        platform: data.platform,
        updatedAt: updatedAt ? updatedAt : new Date(),
      },
    });
    // if (messages.length > 0) {
    //   let title = '';
    //   if (origin.platform === PLATFORM.TRIP) {
    //     title = 'Kênh OTA: Tripadvisor\nKhách sạn ' + object.name + '\n';
    //   }
    //   if (origin.platform === PLATFORM.BOOKING) {
    //     title = 'Kênh OTA: Booking\nKhách sạn ' + object.name + '\n';
    //   }
    //   if (origin.platform === PLATFORM.GOOGLE) {
    //     title = 'Kênh OTA: Google Reviews\nKhách sạn ' + object.name + '\n';
    //   }
    //   this.sendNoti(messages, title, origin.tbHotelId, origin.platform, origin);
    // }
    return { updated: updatedObjectTrips, messages };
  }

  async deleteObject(id: string): Promise<tbObject> {
    return await this.prismaService.tbObject.delete({
      where: {
        id,
      },
    });
  }

  // @Cron(cronjobCrawlObjectEnv)
  async crawlSchedule(isManual = true): Promise<NewObjectLog[]> {
    let result: NewObjectLog[] = [];
    const listObjects = await this.prismaService.tbObject.findMany({
      where: {
        tbHotel: {
          disable: {
            not: true,
          },
        },
        // dev
        tbHotelId: '242c9b2a-ccf7-4efa-b7d9-feec03af2a47',
        platform: 'TRAVELOKA',
        // dev
      },
      include: {
        tbHotel: true,
      },
    });
    const updatedAt = moment().utc().toDate();
    for (let i = 0; i < listObjects.length; i++) {
      const resultCrawl = await this.updateObject(listObjects[i], updatedAt);
      // {
      //   updated, messages;
      // }
      const updated = resultCrawl?.updated ?? undefined;
      const messages = resultCrawl?.messages ?? [];
      if (!updated) {
        console.log('Get info', listObjects[i].name, 'FAIL');
        continue;
      }
      const temp = {
        ...updated,
        // extra: {
        //   rank: updated.extra["rank"] + getRndInteger(-2, 2),
        //   totalHotel: updated.extra["totalHotel"],
        // },
        // numberScoreReview: updated.numberScoreReview.map((item, index) => {
        //   if (index <= 2) {
        //     return item + getRndInteger(0, 2);
        //   }
        //   return item;
        // }),
      };
      const id = updated.id;
      const tbHotelId = temp.tbHotelId;
      delete temp.id;
      delete temp.tbHotelId;
      const newObjectLog = await this.prismaService.tbObjectLog.create({
        data: {
          ...temp,
          messages,
          isManual,
          tbObjectId: id,
          updatedAt: moment(
            new Date(moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')),
          ).toDate(),
        },
      });
      result = result.concat({
        ...newObjectLog,
        tbHotelId,
      });
    }
    await this.createLastUpdate(
      moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      PLATFORM.TRIP,
      isManual,
    );
    await this.createLastUpdate(
      moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      PLATFORM.BOOKING,
      isManual,
    );
    await this.createLastUpdate(
      moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      PLATFORM.GOOGLE,
      isManual,
    );
    await this.createLastUpdate(
      moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      PLATFORM.AGODA,
      isManual,
    );
    await this.createLastUpdate(
      moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      PLATFORM.EXPEDIA,
      isManual,
    );
    await this.createLastUpdate(
      moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      PLATFORM.TRAVELOKA,
      isManual,
    );

    return result;
  }

  async crawlObject(
    url: string,
    platform: PLATFORM,
  ): Promise<Objects | undefined> {
    let driver;
    try {
      console.log('Start firefox', platform, seleniumUrl);
      const timezone = 'Asia/Ho_Chi_Minh'; // Change this to the desired timezone
      const capabilities = Capabilities.firefox();
      capabilities.set('tz', timezone);
      capabilities.set('moz:firefoxOptions', {
        args: ['--headless'],
      });
      // const option = new Options().addArguments('--no-proxy-server');
      // .addArguments('--headless=new')
      driver = await new Builder()
        .usingServer(seleniumUrl)
        .forBrowser('firefox')
        .withCapabilities(capabilities)
        .build();

      console.log(url);
      await driver.get(url);
      console.log('start extract');

      let object: Objects;

      if (platform === PLATFORM.TRIP) {
        object = await extractDataTrip(this.httpService, platform, url);
      }
      if (platform === PLATFORM.BOOKING) {
        object = await extractDataBoooking(driver, platform, url);
      }

      if (platform === PLATFORM.GOOGLE) {
        object = await extractDataGoogle(driver, platform, url);
      }

      if (platform === PLATFORM.AGODA) {
        object = await extractDataAgoda(platform, this.httpService, url);
      }

      if (platform === PLATFORM.EXPEDIA) {
        object = await extractDataExpedia(platform, this.httpService, url);
      }

      if (platform === PLATFORM.TRAVELOKA) {
        object = await extractDataTraveloka(platform, this.httpService, url);
      }

      // switch (platform) {
      //   case PLATFORM.TRIP:
      //     console.log('extract trip');
      //     object = await extractDataTrip(driver, platform, url);
      //     break;
      //   case PLATFORM.BOOKING:
      //     object = await extractDataBoooking(driver, platform, url);
      //     break;
      //   default:
      //     break;
      // }

      await driver.quit();
      console.log('crawl done', object);
      // return undefined;
      // if (platform === PLATFORM.TRIP) {
      // const sleep = new Promise((resole, reject) => {
      //   setTimeout(() => {
      //     resole('Sleep 3s');
      //   }, 3000);
      // });
      // console.log(await sleep);
      // }

      return object;
    } catch (e) {
      console.log(e, 'error');
    }

    await driver.quit();
    return undefined;
  }
}
