import { Injectable } from '@nestjs/common';
import { PLATFORM, Prisma, tbObjectLog } from '@prisma/client';
import { DataList, Paging } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetObjectLogByTime } from './objectLog.dto';
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
    let data: tbObjectLog[];
    data = await this.prismaService.tbObjectLog.findMany({
      where: {
        updatedAt: {
          gt: moment(new Date(query.start))
            .set({
              hour: 23,
              minute: 59,
              second: 59,
            })
            .toDate(),
          lt: moment(new Date(query.end))
            .set({
              hour: 0,
              minute: 0,
              second: 0,
            })
            .toDate(),
        },
        isManual: true,
        ...(query.url && {
          url: query.url,
        }),
        ...(query.platform && {
          platform: query.platform,
        }),
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });
    data = data.filter(
      (item) => moment(new Date(item.updatedAt)).get('hour') === 23,
    );
    return {
      count: data.length,
      data,
    };
  }
}
