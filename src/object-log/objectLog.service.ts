import { Injectable } from '@nestjs/common';
import { PLATFORM, Prisma, tbObjectLog } from '@prisma/client';
import { DataList, Paging } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetNewsfeedByTime, GetObjectLogByTime } from './objectLog.dto';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

@Injectable()
export class ObjectLogService {
  constructor(private prismaService: PrismaService) {
    console.log('init object log service');
  }

  async getAllObjectLog(
    query: GetObjectLogByTime,
  ): Promise<{ count: number; data: tbObjectLog[] }> {
    let result: tbObjectLog[];
    if (query.platform === PLATFORM.TRIP) {
      result = await this.prismaService.$queryRaw`
        SELECT DISTINCT ON (DATE("updatedAt"), "url")
              *
        FROM "tbObjectLog"
        WHERE url = ${
          query.url
        } and platform = 'TRIP' and "updatedAt"::date > ${new Date(
        query.start,
      )} and "updatedAt"::date < ${new Date(query.end)}
        ORDER BY DATE("updatedAt"), "url", "updatedAt" DESC;
      `;
    }
    if (query.platform === PLATFORM.BOOKING) {
      result = await this.prismaService.$queryRaw`
        SELECT DISTINCT ON (DATE("updatedAt"), "url")
              *
        FROM "tbObjectLog"
        WHERE url = ${
          query.url
        } and platform = 'BOOKING' and "updatedAt"::date > ${new Date(
        query.start,
      )} and "updatedAt"::date < ${new Date(query.end)}
        ORDER BY DATE("updatedAt"), "url", "updatedAt" DESC;
      `;
    }

    if (query.platform === PLATFORM.GOOGLE) {
      result = await this.prismaService.$queryRaw`
        SELECT DISTINCT ON (DATE("updatedAt"), "url")
              *
        FROM "tbObjectLog"
        WHERE url = ${
          query.url
        } and platform = 'GOOGLE' and "updatedAt"::date > ${new Date(
        query.start,
      )} and "updatedAt"::date < ${new Date(query.end)}
        ORDER BY DATE("updatedAt"), "url", "updatedAt" DESC;
      `;
    }

    if (query.platform === PLATFORM.AGODA) {
      result = await this.prismaService.$queryRaw`
        SELECT DISTINCT ON (DATE("updatedAt"), "url")
              *
        FROM "tbObjectLog"
        WHERE url = ${
          query.url
        } and platform = 'AGODA' and "updatedAt"::date > ${new Date(
        query.start,
      )} and "updatedAt"::date < ${new Date(query.end)}
        ORDER BY DATE("updatedAt"), "url", "updatedAt" DESC;
      `;
    }

    return {
      count: result.length,
      data: result,
    };
  }

  async getAllNewsfeed(
    query: GetNewsfeedByTime,
  ): Promise<DataList<tbObjectLog>> {
    const count = await this.prismaService.tbObjectLog.count({
      where: {
        messages: {
          isEmpty: false,
        },
        ...((query.start || query.end) && {
          updatedAt: {
            ...(query.start && {
              gt: moment(new Date(query.start))
                .set({
                  hour: 23,
                  minute: 59,
                  second: 59,
                })
                .toDate(),
            }),
            ...(query.end && {
              lt: moment(new Date(query.end))
                .set({
                  hour: 0,
                  minute: 0,
                  second: 0,
                })
                .toDate(),
            }),
          },
        }),
        ...(query.url && {
          url: query.url,
        }),
        ...(query.platform && {
          platform: query.platform,
        }),
        isManual: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    const data = await this.prismaService.tbObjectLog.findMany({
      where: {
        messages: {
          isEmpty: false,
        },
        ...((query.start || query.end) && {
          updatedAt: {
            ...(query.start && {
              gt: moment(new Date(query.start))
                .set({
                  hour: 23,
                  minute: 59,
                  second: 59,
                })
                .toDate(),
            }),
            ...(query.end && {
              lt: moment(new Date(query.end))
                .set({
                  hour: 0,
                  minute: 0,
                  second: 0,
                })
                .toDate(),
            }),
          },
        }),
        ...(query.url && {
          url: query.url,
        }),
        ...(query.platform && {
          platform: query.platform,
        }),
        isManual: true,
      },
      skip: parseInt(query.page) * parseInt(query.limit),
      take: parseInt(query.limit),
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return {
      count,
      page: query.page,
      limit: query.limit,
      data,
    };
  }
}
