import { PLATFORM, tbObject, tbReview } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as moment from 'moment-timezone';
moment.tz.setDefault('Asia/Ho_Chi_Minh');
import { isNumber } from 'lodash';

export const getReviewsOtaInMonth = async (
  prismaService: PrismaService,
  objectOTA: tbObject,
  highReview = false,
  month: number,
  year: number,
) => {
  const currentMonth = month;
  // const currentMonth = 8;
  const currentYear = year;
  let reviews = await prismaService.tbReview.findMany({
    where: {
      tbHotelId: objectOTA.tbHotelId,
      monthCreated: currentMonth,
      yearCreated: currentYear,
      platform: objectOTA.platform,
    },
  });

  if (objectOTA.platform === PLATFORM.TRIP && highReview) {
    reviews = reviews.filter((review) => review.extra['stars'] === 5);
  }

  if (objectOTA.platform === PLATFORM.GOOGLE) {
    reviews = reviews.filter((review) => review.extra['score'] === 5);
  }

  if (
    (objectOTA.platform === PLATFORM.BOOKING ||
      objectOTA.platform === PLATFORM.AGODA ||
      objectOTA.platform === PLATFORM.EXPEDIA ||
      objectOTA.platform === PLATFORM.TRAVELOKA ||
      objectOTA.platform === PLATFORM.TRIPCOM ||
      objectOTA.platform === PLATFORM.SANHN) &&
    highReview
  ) {
    reviews = reviews.filter((review) => review.extra['score'] >= 9.0);
  }

  return reviews;
};

export const getScoreByReviewsOtaInMonth = (
  reviews: tbReview[],
  platform: PLATFORM,
) => {
  let score = 0;
  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    if (platform === PLATFORM.TRIP) {
      score += review?.extra?.['stars'] === 5 ? 1 : -8;
    }
    if (platform === PLATFORM.GOOGLE) {
      score += review?.extra?.['score'] === 5 ? 1 : -8;
    }
    if (
      platform === PLATFORM.BOOKING ||
      platform === PLATFORM.AGODA ||
      platform === PLATFORM.EXPEDIA ||
      platform === PLATFORM.TRIPCOM ||
      platform === PLATFORM.TRAVELOKA ||
      platform === PLATFORM.SANHN
    ) {
      score += review?.extra?.['score'];
    }
  }

  return score;
};
