import { PLATFORM, tbReview } from '@prisma/client';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/prisma/prisma.service';
import { Review } from 'src/review/review.entity';
import { CompetitionOTA } from '../competition.entity';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

export const MIN_RATIO_IN_MONTH = 0.2;

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

export const getRatioInMonth = (competitionOTA: CompetitionOTA) => {
  let numberReviews = 0;
  let numberBookingCO = 0;
  Object.keys(competitionOTA?.OTA ?? {}).map((platform) => {
    const object = competitionOTA.OTA[platform];
    numberReviews += object?.reviews?.length ?? 0;
    numberBookingCO += object?.extra?.checkoutInMonth ?? 0;
  });
  return {
    ratioInMonth:
      numberBookingCO === 0
        ? -1
        : parseFloat(numberReviews.toString()) / numberBookingCO,
    numberReviews,
    numberBookingCO,
  };
};

export const getScoreInMonth = (competitionOTA: CompetitionOTA) => {
  let totalScore = 0;
  let numberReviews = 0;
  const numberOTA = 0;
  let isOTA = false;
  Object.keys(competitionOTA.OTA).map((platform) => {
    const object = competitionOTA.OTA[platform];
    if (!object) return;
    if (platform === PLATFORM.TRIP || platform === PLATFORM.GOOGLE) {
      totalScore += object.score * parseFloat(object?.extra?.volume ?? '1');
    }
    if (
      platform === PLATFORM.BOOKING ||
      platform === PLATFORM.AGODA ||
      platform === PLATFORM.EXPEDIA ||
      platform === PLATFORM.TRAVELOKA ||
      platform === PLATFORM.TRIPCOM
    ) {
      isOTA = true;
      numberReviews += object?.reviews?.length ?? 0;
      totalScore += object.score * (platform === PLATFORM.TRIPCOM ? 2 : 1);
    }
  });
  if (isOTA) {
    return parseFloat(totalScore.toString()) / numberReviews;
  }
  return totalScore;
};
