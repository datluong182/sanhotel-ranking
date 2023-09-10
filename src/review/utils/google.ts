import { By, WebDriver } from 'selenium-webdriver';
import { ReviewBooking, ReviewGoogle } from '../review.entity';
import { GetElement, GetElements } from 'src/utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import webdriverio from 'webdriverio';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const extractReviewGoogle = async (
  driver: WebDriver,
  pagename: string,
): Promise<ReviewGoogle[] | undefined> => {
  const tabReviewEle = await GetElement(
    driver,
    '//button[@role="tab" and contains(@aria-label, "Reviews for")]/div/div[contains(@class, "fontTitleSmall")]',
  );
  await driver.executeScript('arguments[0].click()', tabReviewEle);
  await driver.sleep(500);
  return undefined;
};

export default extractReviewGoogle;
