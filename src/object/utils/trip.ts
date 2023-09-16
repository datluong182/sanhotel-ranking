import { WebDriver } from 'selenium-webdriver';
import { GetElement, GetElements } from 'src/utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Objects } from '../object.entity';
import { PLATFORM } from '@prisma/client';

const extractDataTrip = async (
  driver: WebDriver,
  platform: PLATFORM,
  url: string,
): Promise<Objects | undefined> => {
  await driver.sleep(2000);
  console.log('get name');
  const titleEle = await GetElement(driver, '//h1[@id="HEADING"]');
  if (!titleEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy tiêu đề',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  const name = await titleEle.getText();

  console.log('get score');
  const scoreReviewEle = await GetElement(
    driver,
    '//div[@class="ui_column  "]/div/span',
  );
  await driver.executeScript(
    'arguments[0].scrollIntoView(true);',
    scoreReviewEle,
  );

  console.log(await scoreReviewEle.getAttribute('innerHTML'), 'html');
  if (!scoreReviewEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy điểm review',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  let textScore = await scoreReviewEle.getText();
  console.log(textScore, 'textScore');
  textScore = textScore.replaceAll(',', '.');
  const score = parseFloat(textScore);

  console.log('get total reviews');
  const tabReviewEle = await GetElement(
    driver,
    '//div[@data-tab="TABS_REVIEWS"]',
  );
  await driver.executeScript(
    'arguments[0].scrollIntoView(true);',
    tabReviewEle,
  );
  await driver.sleep(5000);
  const numberScoreReviewEle = await GetElements(
    driver,
    '//div[@id="hrReviewFilters"]/div/div/ul/li/span[text()]',
  );

  if (!numberScoreReviewEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy tổng số reviews',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  let numberScoreReview = [];
  console.log('ele total reviews');
  for (let i = 0; i < numberScoreReviewEle.length; i++) {
    numberScoreReview = numberScoreReview.concat(
      parseInt((await numberScoreReviewEle[i].getText()).replaceAll(',', '')),
    );
  }

  console.log('get ranking');
  const rankingEle = await GetElement(
    driver,
    '//div[@class="ui_column  "]/span[contains(text(), "#")]',
  );
  if (!rankingEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy rank reviews',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  let textRank = await rankingEle.getText();
  textRank = textRank.split(' ')?.[0].split('#')?.[1];
  const rank = parseInt(textRank);

  console.log('get total hotel');
  const totalHotelEle = await GetElement(
    driver,
    '//div[@class="ui_column  "]/span[contains(text(), "#")]',
  );
  if (!rankingEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy rank reviews',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  const totalHotelText = await totalHotelEle.getText();
  let totalHotel = 0;
  if (totalHotelText.search('of') !== -1) {
    const arr = totalHotelText.split(' ');
    totalHotel = parseInt(arr[2].replaceAll(',', '').replaceAll('.', ''));
  } else {
    const arr = totalHotelText.split(' ');
    totalHotel = parseInt(arr[3].replaceAll(',', '').replaceAll('.', ''));
  }

  console.log(name, score, rank, numberScoreReview);
  return {
    name,
    score,
    numberScoreReview,
    extra: {
      rank: rank,
      totalHotel: totalHotel,
    },
    platform,
    updatedAt: new Date(),
    url,
  };
};

export default extractDataTrip;
