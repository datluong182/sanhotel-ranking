import { By, WebDriver } from 'selenium-webdriver';
import { PlaceGoogle, ReviewBooking, ReviewGoogle } from '../review.entity';
import { GetElement, GetElements } from 'src/utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import webdriverio from 'webdriverio';
import * as moment from 'moment-timezone';
import { HttpService } from '@nestjs/axios';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const actorId = process.env.ACTOR_ID_APIFY_GOOGLE_REVIEW;
const api_token = process.env.API_TOKEN_APIFY;

const extractReviewGoogle = async (
  httpService: HttpService,
  url: string
): Promise<ReviewGoogle[] | undefined> => {
  let result: ReviewGoogle[] = [];
  const currentMonth = moment().get('month') + 1;
  const currentYear = moment().get('year');

  const response = await httpService.axiosRef.post(
    `https://api.apify.com/v2/actor-tasks/${actorId}/run-sync-get-dataset-items?token=${api_token}`,
    {
      deeperCityScrape: false,
      includeWebResults: false,
      language: 'en',
      maxCrawledPlacesPerSearch: 1,
      maxImages: 0,
      maxReviews: 99999,
      oneReviewPerRow: false,
      onlyDataFromSearchPage: false,
      reviewsSort: 'newest',
      reviewsStartDate: `${currentYear}-${currentMonth
        .toString()
        .padStart(2, '0')}-01`,
      // reviewsStartDate: '1970-01-01',
      scrapeResponseFromOwnerText: true,
      scrapeReviewId: true,
      scrapeReviewUrl: true,
      scrapeReviewerId: true,
      scrapeReviewerName: true,
      scrapeReviewerUrl: true,
      skipClosedPlaces: false,
      startUrls: [
        {
          url,
        },
      ],
      reviewsFilterString: '',
      searchMatching: 'all',
      placeMinimumStars: '',
      allPlacesNoSearchAction: '',
    }
  );
  const place: PlaceGoogle = response.data?.[0];

  place.reviews.map((review) => {
    result = result.concat({
      username: review.name,
      title: '',
      content: [review?.text ?? ''],
      createdAt: moment(review.publishedAtDate).toDate(),
      monthCreated: moment(review.publishedAtDate).get('month') + 1,
      yearCreated: moment(review.publishedAtDate).get('year'),
      extra: {
        score: review.stars,
        reviewId: review.reviewId,
        link: review.reviewUrl,
      },
    });
  });

  return result;
};

export default extractReviewGoogle;
