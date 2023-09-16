import { Injectable } from '@nestjs/common';
import {
  PLATFORM,
  PLATFORM_RESPONSE,
  TYPE_HOTEL,
  tbHotel,
  tbReview,
  tbStaff,
} from '@prisma/client';
import { DataList, PagingDefault } from 'src/app.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateStaff,
  QueryRankByDayStaff,
  QueryRankingStaff,
  RankingStaff,
  RankingStaffHotel,
  TYPE_RANKING,
  UpdateStaff,
} from './staff.dto';
import _, { result } from 'lodash';
import { nomalizeName } from 'src/utils';
import { reviewsByDayStaff } from './performance';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

export const checkExist = (subStr: string, str: string) => {
  const regex = new RegExp(`${nomalizeName(subStr)}(?![a-zA-Z])`);
  return regex.test(nomalizeName(str));
};

export const checkAnotherExist = (
  staffId: string,
  listStaffs: tbStaff[],
  text: string,
) => {
  let flag = false;
  listStaffs.map((staff) => {
    // Kiểm tra xem còn nhân viên nào khác nhân viên staffId xuất hiện không?
    if (staff.id !== staffId) {
      if (checkExist(staff.name, text)) {
        flag = true;
      }
      staff.otherNames.map((otherName) => {
        if (checkExist(otherName, text)) {
          flag = true;
        }
      });
    }
  });
  return flag;
};

export const checkExistMoreThanOne = (
  text: string,
  listStaffs: tbStaff[],
): tbStaff[] => {
  let results: tbStaff[] = [];
  listStaffs.map((staff) => {
    let checked = false;
    if (checkExist(staff.name, text)) {
      checked = true;
    }
    if (!checked) {
      staff.otherNames.map((otherName) => {
        if (checkExist(otherName, text)) {
          checked = true;
        }
      });
    }
    if (checked) {
      results = results.concat(staff);
    }
  });
  return results;
};

export const checkIfReviewGood = (
  platform: PLATFORM,
  valueReview: number,
  review: tbReview,
) => {
  if (platform === PLATFORM.TRIP) {
    if (review.extra['stars'] === 5) {
      return valueReview;
    }
  }
  if (platform === PLATFORM.BOOKING) {
    if (review.extra['score'] >= 9.0) {
      return valueReview;
    }
  }
  if (platform === PLATFORM.GOOGLE) {
    if (review.extra['score'] === 5) {
      return valueReview;
    }
  }
  return 0;
};

@Injectable()
export class StaffService {
  constructor(private prismaService: PrismaService) {
    console.log('init staff service');
  }

  async rankingByDay(
    query: QueryRankByDayStaff,
  ): Promise<{ day: string; value: number }[]> {
    const staff = await this.prismaService.tbStaff.findFirst({
      where: {
        id: query.tbStaffId,
      },
    });
    const listReviews = await this.prismaService.tbReview.findMany({
      where: {
        tbHotelId: staff.tbHotelId,
        platform: query.platform,
        AND: [
          {
            createdAt: {
              gt: new Date(query.start),
            },
          },
          {
            createdAt: {
              lte: new Date(query.end),
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tbHotel: true,
      },
    });

    const listStaffs = await this.prismaService.tbStaff.findMany({
      where: {
        tbHotelId: staff.tbHotelId,
      },
      include: {
        tbHotel: true,
      },
    });

    let rankingByDay: { day: string; value: number }[] = [];

    let count = 1;
    while (
      moment(query.start, 'YYYY-MM-DD')
        .clone()
        .add(count, 'day')
        .isSameOrBefore(moment(query.end, 'YYYY-MM-DD'), 'day')
    ) {
      const start = moment(query.start, 'YYYY-MM-DD')
        .clone()
        .add(1, 'day')
        .format('YYYY-MM-DD');
      const end = moment(query.start, 'YYYY-MM-DD')
        .clone()
        .add(count, 'day')
        .format('YYYY-MM-DD');

      const tempReviews = listReviews.filter(
        (review) =>
          moment(review.createdAt).isSameOrAfter(moment(start), 'day') &&
          moment(review.createdAt).isSameOrBefore(moment(end), 'day'),
      );

      const result = await this.getRankingBase(
        {
          start,
          end,
          platform: query.platform,
          tbHotelId: staff.tbHotelId,
          allReview: true,
        },
        tempReviews,
        listStaffs,
        true,
      );

      let rank = 0;
      let currentValue = 100000;
      result.data.map((item) => {
        if (currentValue > item.fiveStarsReview) {
          currentValue = item.fiveStarsReview;
          rank++;
        }
        if (item.tbStaffId === staff.id) {
          rankingByDay = rankingByDay.concat({
            day: moment(query.start, 'YYYY-MM-DD')
              .clone()
              .add(count, 'day')
              .format('DD/MM/YYYY'),
            value: rank,
          });
        }
      });
      count++;
    }
    return rankingByDay;
  }

  async reviewsByDayStaff(query: QueryRankByDayStaff): Promise<tbReview[]> {
    console.log('review by day');
    // return [];
    return await reviewsByDayStaff(this.prismaService, query);
  }

  async getRankingHotelBadReview(
    query: QueryRankingStaff,
  ): Promise<{ count: number; data: RankingStaffHotel[] }> {
    const listReviews = await this.prismaService.tbReview.findMany({
      where: {
        tbHotelId: query.tbHotelId,
        platform: query.platform,
        AND: [
          {
            createdAt: {
              gt: new Date(query.start),
            },
          },
          {
            createdAt: {
              lte: new Date(query.end),
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tbHotel: true,
      },
    });

    const listStaffs = await this.prismaService.tbStaff.findMany({
      where: {
        tbHotelId: query.tbHotelId,
        tbHotel: {
          type: TYPE_HOTEL.ALLY,
        },
      },
      include: {
        tbHotel: true,
      },
    });

    let results: RankingStaffHotel[] = [];

    const listHotels = await this.prismaService.tbHotel.findMany({
      where: {
        id: query.tbHotelId,
      },
    });

    listHotels.map((hotel) => {
      const tempReview = listReviews.filter(
        (review) => review.tbHotelId === hotel.id,
      );

      if (hotel.name === 'San Grand Hotel') {
        console.log(tempReview.length, 'total review san grand');
      }

      const tempStaff = listStaffs.filter(
        (staff) => staff.tbHotelId === hotel.id,
      );

      let tempHotel: RankingStaffHotel = {
        tbHotel: hotel,
        tbHotelId: hotel.id,
        reviews: [],
        fiveStarsReview: 0,
        badReview: [],
        platform: query.platform,
        staffs: tempStaff,
      };

      tempReview.map((review) => {
        if (query.platform === PLATFORM.TRIP) {
          if (review.extra['stars'] < 5) {
            tempHotel = {
              ...tempHotel,
              badReview: tempHotel?.badReview?.concat(review),
            };
          }
        }
        if (query.platform === PLATFORM.BOOKING) {
          if (review.extra['score'] < 9.0) {
            tempHotel = {
              ...tempHotel,
              badReview: tempHotel?.badReview?.concat(review),
            };
          }
        }
      });

      results = results.concat(tempHotel);
    });

    results = results.sort((a, b) => b.badReview.length - a.badReview.length);

    return {
      count: results.length,
      data: results,
    };
  }

  async getRankingHotel(
    query: QueryRankingStaff,
  ): Promise<{ count: number; data: RankingStaffHotel[] }> {
    const listReviews = await this.prismaService.tbReview.findMany({
      where: {
        tbHotelId: query.tbHotelId,
        platform: query.platform,
        AND: [
          {
            createdAt: {
              gt: new Date(query.start),
            },
          },
          {
            createdAt: {
              lte: new Date(query.end),
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tbHotel: true,
      },
    });
    const listStaffs = await this.prismaService.tbStaff.findMany({
      where: {
        tbHotelId: query.tbHotelId,
      },
      include: {
        tbHotel: true,
      },
    });

    const listHotels = await this.prismaService.tbHotel.findMany({
      where: {
        id: query.tbHotelId,
        type: TYPE_HOTEL.ALLY,
      },
    });

    let results: RankingStaffHotel[] = [];

    listHotels.map((hotel) => {
      let tempHotel: RankingStaffHotel = {
        tbHotel: hotel,
        tbHotelId: hotel.id,
        reviews: [],
        fiveStarsReview: 0,
        platform: query.platform,
      };
      const tempReview = listReviews.filter(
        (review) => review.tbHotelId === hotel.id,
      );

      const tempStaff = listStaffs.filter(
        (staff) => staff.tbHotelId === hotel.id,
      );

      for (let i = 0; i < tempReview.length; i++) {
        const review = tempReview[i];
        if (query.platform === PLATFORM.TRIP && review.extra['stars'] !== 5) {
          continue;
        }
        if (
          query.platform === PLATFORM.BOOKING &&
          review.extra['score'] < 9.0
        ) {
          continue;
        }

        if (query.platform === PLATFORM.GOOGLE && review.extra['score'] < 5) {
          continue;
        }

        for (let j = 0; j < review.content.length; j++) {
          const text = review.content[j];
          const staffs: tbStaff[] = checkExistMoreThanOne(text, tempStaff);
          if (staffs.length > 1) {
            tempHotel = {
              ...tempHotel,
              fiveStarsReview: tempHotel.fiveStarsReview + 1,
              reviews: tempHotel.reviews.concat({
                ...review,
                staffs,
              }),
            };
          }
        }
      }
      results.push(tempHotel);
    });

    results = results.sort(
      (result1, result2) => result2.fiveStarsReview - result1.fiveStarsReview,
    );

    return {
      count: results.length,
      data: results,
    };
  }

  async getRanking(
    query: QueryRankingStaff,
  ): Promise<{ count: number; data: RankingStaff[] }> {
    console.log(query, 'query');
    query.allReview = query.allReview === 'true' ? true : false;
    const listReviews = await this.prismaService.tbReview.findMany({
      where: {
        tbHotelId: query.tbHotelId,
        ...(!query.allReview && {
          platform: query.platform,
        }),
        AND: [
          {
            createdAt: {
              gt: new Date(query.start),
            },
          },
          {
            createdAt: {
              lte: new Date(query.end),
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tbHotel: true,
      },
    });

    const listStaffs = await this.prismaService.tbStaff.findMany({
      where: {
        tbHotelId: query.tbHotelId,
      },
      include: {
        tbHotel: true,
      },
    });

    return await this.getRankingBase(
      query,
      listReviews,
      listStaffs,
      query.allReview,
    );
  }

  async getRankingBase(
    query: QueryRankingStaff,
    listReviews: tbReview[],
    listStaffs: tbStaff[],
    allReview = true,
  ): Promise<{ count: number; data: RankingStaff[] }> {
    console.log(listReviews.length, query.start, query.end, 'listStaffs');

    let results: RankingStaff[] = [];
    listStaffs.map((staff) => {
      let tempStaff: RankingStaff = {
        tbStaff: staff,
        tbStaffId: staff.id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        tbHotel: staff?.tbHotel,
        tbHotelId: staff.tbHotelId,
        fiveStarsReview: 0,
        reviews: [],
        ...(!allReview && {
          platform: query.platform,
        }),
      };

      // lấy danh sách các review khách sạn của nhân viên hiện tại
      const tempReview = listReviews.filter(
        (review) => review.tbHotelId === staff.tbHotelId,
      );

      // Lấy danh sách những nhân viên cùng khách sạn với nhân viên hiện tại
      const tempStaffs = listStaffs.filter(
        (s) => s.tbHotelId === staff.tbHotelId,
      );

      let sum = 0;
      tempReview.map((review) => {
        review.content.map((text) => {
          const staffMentioned = checkExistMoreThanOne(text, tempStaffs);
          const currentStaffExist =
            staffMentioned.filter((s) => s.id === tempStaff.tbStaffId).length >
            0;
          if (currentStaffExist) {
            const scorePerReview = 1 / staffMentioned.length;

            // Nếu cần tính tổng tất cả các ota
            if (allReview) {
              sum += checkIfReviewGood(review.platform, scorePerReview, review);
            }

            // Nếu tính riêng từng ota một
            if (!allReview) {
              sum += checkIfReviewGood(query.platform, scorePerReview, review);
            }
            tempStaff.reviews.push(review);
          }
        });
      });

      // if (query.platform === PLATFORM.TRIP) {
      //   // Nếu là TRIP, sử dụng số sao stars
      //   tempReview.map((review) => {
      //     if (review.extra['stars'] === 5) {
      //       let checked = false;
      //       const substringToCheck = staff.name;
      //       review.content.map((text) => {
      //         if (checkExist(substringToCheck, text)) {
      //           checked = true;
      //         }
      //       });
      //       if (!checked) {
      //         review.content.map((text) => {
      //           staff.otherNames.map((otherName) => {
      //             if (checkExist(substringToCheck, text)) {
      //               checked = true;
      //             }
      //           });
      //         });
      //       }
      //       if (checked) {
      //         let flag = true;
      //         review.content.map((text) => {
      //           if (checkAnotherExist(staff.id, tempStaffs, text)) {
      //             flag = false;
      //           }
      //         });
      //         if (flag) {
      //           sum += 1;
      //           tempStaff.reviews.push(review);
      //         }
      //       }
      //     }
      //   });
      // }
      // if (query.platform === PLATFORM.BOOKING) {
      //   // Nếu là BOOKING, sử dụng score
      //   tempReview.map((review) => {
      //     if (review.extra['score'] >= 9.0) {
      //       let checked = false;
      //       const substringToCheck = staff.name;
      //       review.content.map((text) => {
      //         if (checkExist(substringToCheck, text)) {
      //           checked = true;
      //           // sum += 1;
      //           // tempStaff.reviews.push(review);
      //         }
      //       });
      //       if (!checked) {
      //         review.content.map((text) => {
      //           staff.otherNames.map((otherName) => {
      //             if (checkExist(otherName, text)) {
      //               checked = true;
      //             }
      //           });
      //         });
      //       }
      //       if (checked) {
      //         let flag = true;
      //         review.content.map((text) => {
      //           if (checkAnotherExist(staff.id, tempStaffs, text)) {
      //             flag = false;
      //           }
      //         });
      //         if (flag) {
      //           sum += 1;
      //           tempStaff.reviews.push(review);
      //         }
      //       }
      //     }
      //   });
      // }

      // // Đếm nhân viên Google Reviews
      // if (query.platform === PLATFORM.GOOGLE) {
      //   tempReview.map((review) => {
      //     if (review.extra['score'] === 5) {
      //       let checked = false;
      //       const substringToCheck = staff.name;
      //       review.content.map((text) => {
      //         if (checkExist(substringToCheck, text)) {
      //           checked = true;
      //           // sum += 1;
      //           // tempStaff.reviews.push(review);
      //         }
      //       });
      //       if (!checked) {
      //         review.content.map((text) => {
      //           staff.otherNames.map((otherName) => {
      //             if (checkExist(otherName, text)) {
      //               checked = true;
      //             }
      //           });
      //         });
      //       }
      //       if (checked) {
      //         let flag = true;
      //         review.content.map((text) => {
      //           if (checkAnotherExist(staff.id, tempStaffs, text)) {
      //             flag = false;
      //           }
      //         });
      //         if (flag) {
      //           sum += 1;
      //           tempStaff.reviews.push(review);
      //         }
      //       }
      //     }
      //   });
      // }

      tempStaff = {
        ...tempStaff,
        fiveStarsReview: sum,
      };

      results.push(tempStaff);
    });
    results = results.sort((a, b) => b.fiveStarsReview - a.fiveStarsReview);

    return {
      count: results.length,
      data: results,
    };
  }

  async createStaff(data: CreateStaff): Promise<tbStaff | undefined> {
    return await this.prismaService.tbStaff.create({
      data: {
        ...data,
      },
    });
  }

  async updateStaff(data: UpdateStaff): Promise<tbStaff | undefined> {
    return await this.prismaService.tbStaff.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
      },
    });
  }

  async deleteStaff(id: string): Promise<tbStaff> {
    return await this.prismaService.tbStaff.delete({
      where: {
        id,
      },
    });
  }

  async getOneStaff(id: string): Promise<tbStaff | undefined> {
    return await this.prismaService.tbStaff.findFirst({
      where: {
        id,
      },
    });
  }

  async getAllStaff(query: PagingDefault): Promise<DataList<tbStaff>> {
    const count = await this.prismaService.tbStaff.count({
      where: {
        ...query.cond,
      },
    });
    const data = await this.prismaService.tbStaff.findMany({
      where: {
        ...query.cond,
      },
      take: parseInt(query.limit),
      skip: parseInt(query.page) * parseInt(query.limit),
      include: {
        tbHotel: true,
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
