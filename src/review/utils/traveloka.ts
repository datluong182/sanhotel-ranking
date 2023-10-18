import { HttpService } from '@nestjs/axios';
import { ReviewAgoda, ReviewTripcom } from '../review.entity';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/prisma/prisma.service';
import { PLATFORM } from '@prisma/client';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const api_token = process.env.API_TOKEN_APIFY;

const extractReviewTraveloka = async (
  prismaService: PrismaService,
  httpService: HttpService,
  hotelId: string,
): Promise<ReviewAgoda[] | undefined> => {
  const currentMonth = moment().get('month') + 1;
  const currentYear = moment().get('year');
  const object = await prismaService.tbObject.findFirst({
    where: {
      tbHotelId: hotelId,
      platform: PLATFORM.TRAVELOKA,
    },
  });
  console.log('Get datasetId traveloka', object.extra['datasetId']);
  const response = await httpService.axiosRef.get(
    `https://api.apify.com/v2/datasets/${object.extra?.['datasetId']}/items?token=${api_token}`,
  );

  const results = response?.data?.[0]?.reviews ?? [];
  console.log(results?.length, 'num reviews traveloka');
  let reviews: ReviewTripcom[] = [];
  results.map((result) => {
    const createdAt = moment(result?.createdAt, 'YYYY-MM-DD');
    if (
      createdAt.isSameOrAfter(moment().startOf('month'), 'date') &&
      createdAt.isSameOrBefore(moment().endOf('month'), 'date')
    ) {
      reviews = reviews.concat({
        title: result?.title,
        username: result?.username,
        content: result?.content ?? [],
        extra: result?.extra,
        createdAt: moment(result?.createdAt).toDate(),
        monthCreated: currentMonth,
        yearCreated: currentYear,
      });
    }
  });
  return reviews;
};

export default extractReviewTraveloka;
