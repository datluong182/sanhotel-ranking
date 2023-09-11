import { By, WebDriver } from 'selenium-webdriver';
import { PlaceGoogle, ReviewBooking, ReviewGoogle } from '../review.entity';
import { GetElement, GetElements } from 'src/utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import webdriverio from 'webdriverio';
import * as moment from 'moment-timezone';
import { HttpService } from '@nestjs/axios';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const actorId = process.env.ACTOR_ID_APIFY;
const api_token = process.env.API_TOKEN_APIFY;

const extractReviewGoogle = async (
  driver: WebDriver,
  httpService: HttpService,
  url: string,
): Promise<ReviewGoogle[] | undefined> => {
  let result: ReviewGoogle[] = [];
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
    },
  );
  console.log(response.data, 'debugger apify');
  const place: PlaceGoogle = response.data?.[0];

  place.reviews.map((review) => {
    result = result.concat({
      username: review.name,
      title: '',
      content: [review.text],
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
