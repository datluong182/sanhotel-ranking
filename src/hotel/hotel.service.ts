import { Injectable } from '@nestjs/common';
import {
  PLATFORM,
  PLATFORM_RESPONSE,
  tbHotel,
  tbObjectLog,
} from '@prisma/client';
import { DataList, PagingDefault } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHotel, QueryFiveStars, UpdateHotel } from './hotel.dto';
import _ from 'lodash';
import { ObjectLogService } from 'src/object-log/objectLog.service';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

@Injectable()
export class HotelService {
  constructor(
    private prismaService: PrismaService,
    private objectLogService: ObjectLogService,
  ) {
    console.log('init object service');
  }

  async createHotel(data: CreateHotel): Promise<tbHotel | undefined> {
    return await this.prismaService.tbHotel.create({
      data: {
        ...data,
      },
    });
  }

  async updateHotel(data: UpdateHotel): Promise<tbHotel | undefined> {
    return await this.prismaService.tbHotel.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
      },
    });
  }

  async deleteHotel(id: string): Promise<tbHotel> {
    return await this.prismaService.tbHotel.delete({
      where: {
        id,
      },
    });
  }

  async getOneHotel(id: string): Promise<tbHotel | undefined> {
    return await this.prismaService.tbHotel.findFirst({
      where: {
        id,
      },
    });
  }

  async getAllHotel(query: PagingDefault): Promise<DataList<tbHotel>> {
    const count = await this.prismaService.tbHotel.count({
      where: {
        ...query.cond,
      },
    });
    const data = await this.prismaService.tbHotel.findMany({
      where: {
        ...query.cond,
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

  // async getChartFiveStars (query: QueryFiveStars): Promise<{ dataDate: tbObjectLog[]; data: {name: string; data: number[]}[]}> {
  //   const listHotels = await this.prismaService.tbHotel.findMany();
  //   let results: { name: string; data: number[] }[] = [];
  //   let dataDate:tbObjectLog[] = []
  //   for (let i = 0; i < listHotels.length; i++) {
  //     const hotel = listHotels[i];
  //     const objectLogs = await this.objectLogService.getAllObjectLog({
  //       platform: query.platform,
  //       url: hotel.links[query.platform],
  //       start: query.start,
  //       end: query.end,
  //     })
  //     dataDate = objectLogs.data;
  //     dataDate = dataDate.filter(d => moment(d.updatedAt).format("YYYY-MM-DD") !== query.end);
  //     let dataResult = objectLogs.data.filter(d => moment(d.updatedAt).format("YYYY-MM-DD") !== query.end).map(objectLog => objectLog.numberScoreReview[0]?? 0)
  //     results = results.concat({
  //       name: hotel.name,
  //       data: dataResult
  //     })
  //   }
  //   return {
  //     dataDate,
  //     data: results
  //   }
  // }

  async getChartFiveStars(
    query: QueryFiveStars,
  ): Promise<{ dataDate: string[]; data: { name: string; data: number[] }[] }> {
    const listHotels = await this.prismaService.tbHotel.findMany();
    const dataDate = [];
    let count = 0;
    const start = query.start;
    const end = query.end;
    while (true) {
      if (
        moment(start, 'YYYY-MM-DD')
          .add(count, 'day')
          .isAfter(moment(end, 'YYYY-MM-DD'), 'day')
      ) {
        break;
      }
      dataDate.push(
        moment(start, 'YYYY-MM-DD').add(count, 'day').format('YYYY-MM-DD'),
      );
      count++;
    }
    const data: { name: string; data: number[] }[] = [];
    const listReviews = await this.prismaService.tbReview.findMany({
      where: {
        // tbHotelId: hotel.id,
        platform: query.platform,
        //   AND: [
        //   {
        //     createdAt: {
        //       gt: moment(date).subtract(1, 'day').toDate(),
        //     }
        //   },
        //   {
        //     createdAt: {
        //       lte: moment(date).toDate(),
        //     }
        //   }
        // ]
      },
    });
    console.log(listReviews.length, 'length all rv');
    for (let i = 0; i < listHotels.length; i++) {
      const hotel = listHotels[i];
      const item = {
        name: hotel.name,
        data: [],
      };
      for (let j = 0; j < dataDate.length; j++) {
        const date = dataDate[j];
        const tempListReview = listReviews.filter(
          (review) =>
            review.platform === query.platform &&
            review.tbHotelId === hotel.id &&
            moment(review.createdAt)
              .set({ h: 0, m: 0, s: 0 })
              .isSame(moment(date, 'YYYY-MM-DD').set({ h: 0, m: 0, s: 0 })),
        );

        if (query.platform === PLATFORM.TRIP) {
          const listTrip = tempListReview.filter(
            (item) => item.extra['stars'] === 5,
          );
          item.data.push(listTrip.length);
        }

        if (query.platform === PLATFORM.BOOKING) {
          const listBooking = tempListReview.filter(
            (item) => item.extra['score'] >= 9.0,
          );
          item.data.push(listBooking.length);
        }
      }
      data.push(item);
    }
    return {
      dataDate: dataDate,
      data,
    };
  }
}
