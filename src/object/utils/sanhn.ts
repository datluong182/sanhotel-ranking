import { HttpException, HttpStatus } from '@nestjs/common';
import { PLATFORM } from '@prisma/client';
import { By, WebDriver } from 'selenium-webdriver';
import { GetElement, GetElements } from 'src/utils';
import { Objects } from '../object.entity';
import extractDataBoooking from './booking';

const extractDataSanHN = async (
  driver: WebDriver,
  platform: PLATFORM,
  url: string,
): Promise<Objects | undefined> => {
  const { name, score, extra, numberScoreReview, updatedAt } =
    await extractDataBoooking(driver, PLATFORM.BOOKING, url);

  return {
    name,
    url,
    score,
    platform,
    extra,
    numberScoreReview,
    updatedAt,
  };
};

export default extractDataSanHN;
