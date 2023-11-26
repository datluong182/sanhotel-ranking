import { HttpService } from '@nestjs/axios';
import { ReviewTrip } from '../review.entity';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const taskName = process.env.ACTOR_ID_APIFY_REVIEW_TRIP;
const token = process.env.API_TOKEN_APIFY;

export interface APIFY_RES {
  id: string;
  url: string;
  title: string;
  rating: number;
  text: string;
  user: {
    name: string;
  };
  photos: Array<{
    image: string;
  }>;
  publishedDate: string;
}

const extractReviewTrip = async (
  httpService: HttpService,
  url: string,
  month: number,
  year: number
) => {
  const response = await httpService.axiosRef.post(
    `https://api.apify.com/v2/actor-tasks/${taskName}/run-sync-get-dataset-items?token=${token}`,
    {
      lastReviewDate: `${year}-${month}-01`,
      reviewsLanguages: ['ALL_REVIEW_LANGUAGES'],
      scrapeReviewerInfo: true,
      startUrls: [
        {
          url,
        },
      ],
      reviewRatings: ['ALL_REVIEW_RATINGS'],
    }
  );
  const apifyRes: APIFY_RES[] = response.data;
  // console.log(apifyRes[0]);
  let reviews: ReviewTrip[] = [];
  apifyRes.map((res) => {
    reviews = reviews.concat({
      username: res?.user?.name ?? '',
      createdAt: moment(
        `${res.publishedDate} 00:00:00`,
        'YYYY-MM-DD HH:mm:ss'
      ).toDate(),
      monthCreated: month,
      yearCreated: year,
      title: res.title,
      content: [res.text],
      extra: {
        stars: res.rating,
        link: res.url,
        reviewId: res.id,
      },
    });
  });

  return reviews;
};

export default extractReviewTrip;
