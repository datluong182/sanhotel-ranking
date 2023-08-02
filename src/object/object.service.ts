import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataList, Paging } from '../app.dto';
import { PLATFORM, Prisma, tbObject } from '@prisma/client';
import { CreateObject, UpdateObjectByUrl, GetLastUpdate } from './object.dto';
import { Builder, WebDriver, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { GetElement, GetElements, seleniumUrl } from 'src/utils';
import axios from 'axios';
import { Objects } from './object.entity';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';
import extractDataTrip from './utils/trip';
import extractDataBoooking from './utils/booking';

const token = process.env.TOKEN_HUBSPOT;

const cronjobCrawlReviewEnv = process.env.CRONJOB_CRAWL_REVIEW;

async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

@Injectable()
export class ObjectService {
  constructor(private prismaService: PrismaService) {
    console.log('init object service');
  }

  async getLastUpdate(query: GetLastUpdate): Promise<{ updatedAt: Date }> {
    const setting = await this.prismaService.tbLastUpdate.findFirst({
      where: {
        isManual: true,
        platform: query.platform,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return {
      updatedAt: setting.updatedAt,
    };
  }

  async getOneObject(id: string): Promise<{ data: tbObject | undefined }> {
    return {
      data: await this.prismaService.tbObject.findFirst({
        where: {
          id,
        }
      })
    }
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
      },
    });
    let data: tbObject[];
    if (query.platform === 'TRIP') {
      data = await this.prismaService
        .$queryRaw`SELECT * FROM "tbObject" WHERE "platform" = 'TRIP' ORDER BY ("extra"->>'rank') asc OFFSET ${query.page} LIMIT ${query.limit}`;
    }
    if (query.platform === 'BOOKING') {
      data = await this.prismaService
        .$queryRaw`SELECT * FROM "tbObject" WHERE "platform" = 'BOOKING' ORDER BY score desc OFFSET ${query.page} LIMIT ${query.limit}`;
    }
    return {
      count,
      page: query.page,
      limit: query.limit,
      data,
    };
  }

  async createObject(data: CreateObject): Promise<tbObject | undefined> {
    const objectTrip = await this.crawlObject(data.url, data.platform);
    if (!objectTrip) return undefined;
    const newObjectTrip = await this.prismaService.tbObject.create({
      data: {
        ...objectTrip,
        platform: data.platform,
        updatedAt: new Date(),
      },
    });
    return newObjectTrip;
  }

  async updateObjectByUrl(data: UpdateObjectByUrl): Promise<void> {
    console.log('update by url', typeof data.score);
    const origin = await this.prismaService.tbObject.findFirst({
      where: {
        url: data.url,
      },
    });
    await this.prismaService.tbObject.update({
      where: {
        id: origin.id,
      },
      data: {
        ...data,
        updatedAt: new Date(data.updatedAt),
      },
    });
    await this.prismaService.tbObjectLog.create({
      data: {
        ...data,
        updatedAt: new Date(data.updatedAt),
        isManual: true,
        tbObjectId: origin.id,
      },
    });
  }

  async updateObject(
    data: tbObject,
    updatedAt: Date | undefined = undefined,
  ): Promise<tbObject> {
    const object = await this.crawlObject(data.url, data.platform);
    if (!object) return undefined;
    const updatedObjectTrips = await this.prismaService.tbObject.update({
      where: {
        id: data.id,
      },
      data: {
        ...object,
        platform: data.platform,
        updatedAt: updatedAt ? updatedAt : new Date(),
      },
    });
    return updatedObjectTrips;
  }

  async deleteObject(id: string): Promise<tbObject> {
    return await this.prismaService.tbObject.delete({
      where: {
        id,
      },
    });
  }

  // @Cron(cronjobCrawlReviewEnv)
  async crawlSchedule(isManual = true): Promise<void> {
    const listObjects = await this.prismaService.tbObject.findMany();
    const updatedAt = new Date();
    for (let i = 0; i < listObjects.length; i++) {
      const updated = await this.updateObject(listObjects[i], updatedAt);
      const id = updated.id;
      delete updated.id;
      await this.prismaService.tbObjectLog.create({
        data: {
          ...updated,
          isManual,
          tbObjectId: id,
          updatedAt,
        },
      });
      await sleep(5000);
    }
  }

  async crawlObject(
    url: string,
    platform: PLATFORM,
  ): Promise<Objects | undefined> {
    let driver;
    try {
      console.log('Start chrome', platform);
      const option = new Options().addArguments('--no-proxy-server');
      // .addArguments('headless');
      driver = await new Builder()
        .usingServer(seleniumUrl)
        .forBrowser('chrome')
        .setChromeOptions(option)
        .build();
      console.log(url);
      await driver.get(url);
      console.log('start extract');

      let object: Objects;

      if (platform === PLATFORM.TRIP) {
        object = await extractDataTrip(driver, platform, url);
      }
      if (platform === PLATFORM.BOOKING) {
        object = await extractDataBoooking(driver, platform, url);
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
      return object;
    } catch (e) {
      console.log(e, 'error');
    }

    await driver.quit();
    return undefined;
  }
}
