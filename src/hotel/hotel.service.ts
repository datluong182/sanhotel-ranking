import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  PLATFORM,
  PLATFORM_RESPONSE,
  TYPE_HOTEL,
  tbHotel,
  tbObjectLog,
} from '@prisma/client';
import { DataList, PagingDefault } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHotel, QueryFiveStars, UpdateHotel } from './hotel.dto';
import _ from 'lodash';
import { ObjectLogService } from 'src/object-log/objectLog.service';
import * as moment from 'moment-timezone';
import { HotelDetail } from './hotel.entity';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

@Injectable()
export class HotelService {
  constructor(
    private prismaService: PrismaService,
    private objectLogService: ObjectLogService
  ) {
    console.log('init object service');
  }

  async createHotel(data: CreateHotel): Promise<tbHotel | undefined> {
    return await this.prismaService.tbHotel.create({
      data: {
        ...data,
        disable: false,
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

  async getOneHotel(id: string): Promise<HotelDetail | undefined> {
    const objectsByHotel = await this.prismaService.tbObject.findMany({
      where: {
        tbHotelId: id,
      },
    });
    const hotel = await this.prismaService.tbHotel.findFirst({
      where: {
        id,
      },
    });
    if (!hotel) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Can not find hotel',
        },
        HttpStatus.BAD_REQUEST
      );
    }
    return {
      name: hotel.name,
      type: hotel.type,
      links: hotel.links,
      id: hotel.id,
      gm: hotel.gm,
      disable: hotel.disable,
      avatar: hotel.avatar,
      address: hotel.address,
      objects: objectsByHotel,
    };
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
    query: QueryFiveStars
  ): Promise<{ dataDate: string[]; data: { name: string; data: number[] }[] }> {
    const listHotels = await this.prismaService.tbHotel.findMany({
      where: {
        type: query.type,
      },
    });
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
        moment(start, 'YYYY-MM-DD').add(count, 'day').format('YYYY-MM-DD')
      );
      count++;
    }
    const data: { name: string; data: number[] }[] = [];
    const listReviews = await this.prismaService.tbReview.findMany({
      where: {
        // tbHotelId: hotel.id,
        tbHotel: {
          ...(query.type && {
            type: query.type,
          }),
          disable: {
            not: true,
          },
        },
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
        const tempListReview = listReviews.filter((review) => {
          return (
            review.platform === query.platform &&
            review.tbHotelId === hotel.id &&
            moment(review.createdAt)
              .set({ h: 0, m: 0, s: 0 })
              .isSame(
                moment(date, 'YYYY-MM-DD').set({ h: 0, m: 0, s: 0 }),
                'day'
              )
          );
        });

        if (query.platform === PLATFORM.TRIP) {
          const listTrip = tempListReview.filter(
            (item) => item.extra['stars'] === 5
          );
          item.data.push(listTrip.length);
        }

        if (query.platform === PLATFORM.BOOKING) {
          const listBooking = tempListReview.filter(
            (item) => item.extra['score'] >= 9.0
          );
          item.data.push(listBooking.length);
        }

        if (query.platform === PLATFORM.GOOGLE) {
          const listGoogle = tempListReview.filter(
            (item) => item.extra['score'] === 5
          );
          item.data.push(listGoogle.length);
        }

        if (query.platform === PLATFORM.AGODA) {
          const listAgoda = tempListReview.filter(
            (item) => item.extra['score'] >= 9.0
          );
          item.data.push(listAgoda.length);
        }

        if (query.platform === PLATFORM.EXPEDIA) {
          const listExpedia = tempListReview.filter(
            (item) => item.extra['score'] >= 9.0
          );
          item.data.push(listExpedia.length);
        }

        if (query.platform === PLATFORM.TRAVELOKA) {
          const listTraveloka = tempListReview.filter(
            (item) => item.extra['score'] >= 9.0
          );
          item.data.push(listTraveloka.length);
        }
        if (query.platform === PLATFORM.TRIPCOM) {
          const listTripcom = tempListReview.filter(
            (item) => item.extra['score'] >= 9.0
          );
          item.data.push(listTripcom.length);
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
