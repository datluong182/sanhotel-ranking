import { HttpException, HttpStatus } from '@nestjs/common';
import { PLATFORM } from '@prisma/client';
import { By, WebDriver } from 'selenium-webdriver';
import { GetElement, GetElements } from 'src/utils';
import { Objects } from '../object.entity';

const extractDataBoooking = async (
  driver: WebDriver,
  platform: PLATFORM,
  url: string,
): Promise<Objects | undefined> => {
  console.log('get name');

  const titleEle = await GetElement(
    driver,
    '//h2[contains(concat(" ", @class, " "), " pp-header__title ")]',
  );
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
    '//button[@data-testid="read-all-actionable"]/div/div/div[@aria-label]',
  );
  if (!scoreReviewEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy điểm review',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  let text = await scoreReviewEle.getText();
  text = text.replaceAll(',', '.');
  const score = parseFloat(text);

  console.log('get stars');
  const starsEle = await GetElements(
    driver,
    '//span[@data-testid="rating-stars"]/span',
  );
  if (!starsEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy số sao khách sạn',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  const stars = starsEle.length;

  console.log('get total reviews');
  const numberReviewsEle = await GetElement(
    driver,
    '//button[@data-testid="read-all-actionable"]',
  );
  if (!numberReviewsEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy tổng số reviews',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  await driver.executeScript(
    'arguments[0].scrollIntoView(true)',
    numberReviewsEle,
  );
  await numberReviewsEle.click();
  // await driver.executeScript(
  //   'arguments[0].click()',
  //   numberReviewsEle,
  // );
  await driver.sleep(2000);

  let liScore = [];
  await driver.executeScript(
    'arguments[0].scrollIntoView(true)',
    await GetElement(driver, '//div[@id="review_score_filter"]/button'),
  );
  const liScoreEles = await GetElements(
    driver,
    '//div[@id="review_score_filter"]/div/div/ul/li/button/span[@class="review-filter-item__counter"]',
  );
  if (!liScoreEles) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy tổng số reviews',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  for (let i = 0; i < liScoreEles.length; i++) {
    await driver.executeScript(
      'arguments[0].click()',
      await GetElement(driver, '//div[@id="review_score_filter"]/button'),
    );
    await driver.sleep(3000);
    const tempLiScoreEles = await GetElements(
      driver,
      '//div[@id="review_score_filter"]/div/div/ul/li/button/span[@class="review-filter-item__counter"]',
    );
    if (!tempLiScoreEles) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không tìm thấy tổng số reviews',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await driver.executeScript('arguments[0].click()', tempLiScoreEles[i]);
    await driver.sleep(3000);
    const selected = await GetElement(
      driver,
      '//div[@id="review_score_filter"]/button/span/span[@class="review-filter-item__counter"]',
    );
    if (!selected) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không tìm thấy tổng số reviews',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    liScore = liScore.concat(await selected.getText());
  }

  let numberScoreReview = [];
  for (let i = 0; i < liScore.length; i++) {
    console.log(liScore[i], 'liScore[i]');
    let text = liScore[i];
    text = text.split('(');
    text = text[1].split(')');
    numberScoreReview = numberScoreReview.concat(text[0]);
  }

  const subScoreWrapperEle = await GetElements(
    driver,
    '//div[@data-testid="PropertyReviewsRegionBlock"]/div[@class="bui-spacer--larger"]/div/div/div/div/div',
  );
  console.log(subScoreWrapperEle.length, 'get subscores');
  let subScore: { [key: string]: number } = {};
  for (let i = 0; i < subScoreWrapperEle.length - 1; i++) {
    if (i % 2 !== 0) continue;
    const subScoreEle = await subScoreWrapperEle[i].findElement(
      By.xpath('./div/div/div[contains(@id, "label")]'),
    );
    const keySubScoreEle = await subScoreWrapperEle[i].findElement(
      By.xpath('./div/div/div/span'),
    );

    subScore = {
      ...subScore,
      [await keySubScoreEle.getText()]: parseFloat(
        await subScoreEle?.getText(),
      ),
    };
  }

  return {
    name,
    url,
    score,
    platform,
    extra: {
      stars,
      subScore,
    },
    numberScoreReview: numberScoreReview.map((sc) => parseInt(sc)),
    updatedAt: new Date(),
  };
};

export default extractDataBoooking;
