import { PLATFORM, tbReview } from '@prisma/client';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/prisma/prisma.service';
import { Review } from 'src/review/review.entity';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

export const formatReview = (review: tbReview, type: 'add' | 'remove') => {
  let message = '';
  if (review.platform === PLATFORM.TRIP) {
    if (type === 'remove' && review.extra['stars'] < 5) {
      message += `Đánh giá ${review.extra['stars']} sao được viết bởi ${review.username} đã bị xoá`;
    }
    if (type === 'add' && review.extra['stars'] < 5) {
      message += `${review.username} đã thêm một đánh giá ${review.extra['stars']} sao|${review.extra['link']}`;
    }
  }
  if (review.platform === PLATFORM.BOOKING) {
    if (type === 'remove' && review.extra['score'] < 9.0) {
      message += `Đánh giá ${review.extra['score']} điểm được viết bởi ${review.username} đã bị xoá`;
    }
    if (type === 'add' && review.extra['score'] < 9.0) {
      message += `${review.username} đã thêm một đánh giá ${review.extra['score']} điểm|${review.extra['link']}`;
    }
  }
  if (review.platform === PLATFORM.GOOGLE) {
    if (type === 'remove' && review.extra['score'] < 5.0) {
      message += `Đánh giá ${review.extra['score']} điểm được viết bởi ${review.username} đã bị xoá`;
    }
    if (type === 'add' && review.extra['score'] < 5.0) {
      message += `${review.username} đã thêm một đánh giá ${review.extra['score']} điểm||${review.extra['link']}`;
    }
  }

  return message;
};

export const getNumberReviewHighAll = async (
  prismaService: PrismaService,
  platform: PLATFORM,
  tbHotelId: string,
): Promise<number> => {
  let reviews = await prismaService.tbReview.findMany({
    where: {
      platform,
      tbHotelId,
    },
  });
  if (platform === PLATFORM.TRIP) {
    reviews = reviews.filter((review) => review.extra['stars'] === 5);
  }
  if (platform === PLATFORM.BOOKING) {
    reviews = reviews.filter((review) => review.extra['score'] >= 9.0);
  }
  if (platform === PLATFORM.GOOGLE) {
    reviews = reviews.filter((review) => review.extra['score'] === 5.0);
  }
  return reviews.length;
};

export const getSummaryReviewInMonth = async (
  prismaService: PrismaService,
  platform: PLATFORM,
  tbHotelId: string,
  month: number,
  year: number,
): Promise<{
  numberReviewHigh: number;
  reviewHighInMonth: tbReview[];
  numberReviewBad: number;
  reviewBadInMonth: tbReview[];
}> => {
  const reviews = await prismaService.tbReview.findMany({
    where: {
      monthCreated: month,
      yearCreated: year,
      platform,
      tbHotelId,
    },
  });

  let reviewHigh = [],
    reviewBad = [];

  // Filter review high in month
  if (platform === PLATFORM.TRIP) {
    reviewHigh = reviews.filter((review) => review.extra['stars'] === 5);
  }

  if (platform === PLATFORM.BOOKING) {
    reviewHigh = reviews.filter((review) => review.extra['score'] >= 9.0);
  }

  // Filter review bad in month
  if (platform === PLATFORM.TRIP) {
    reviewBad = reviews.filter((review) => review.extra['stars'] < 5);
  }

  if (platform === PLATFORM.BOOKING) {
    reviewBad = reviews.filter((review) => review.extra['scores'] < 9.0);
  }

  return {
    numberReviewHigh: reviewHigh.length,
    reviewHighInMonth: reviewHigh,
    numberReviewBad: reviewBad.length,
    reviewBadInMonth: reviewBad,
  };
};
