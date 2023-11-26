import { PLATFORM, Prisma, TYPE_HOTEL, tbObject } from '@prisma/client';
import { Builder, By, Capabilities } from 'selenium-webdriver';
import { CreateHotel } from 'src/hotel/hotel.dto';
import { ObjectService } from 'src/object/object.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetElement, GetElements, seleniumUrl } from 'src/utils';
import {
  getReviewsOtaInMonth,
  getScoreByReviewsOtaInMonth,
} from './reviewsOtaInMonth';
import { getSummaryReviewInMonth } from '.';
import { NewObjectLog } from 'src/object/object.entity';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

export const urlRankHotel =
  'https://www.tripadvisor.com/Hotels-g293924-zfd9261,21371-a_ufe.true-a_sort.POPULARITY-Hanoi-Hotels.html';

export const compareUrlHotel = (urlA: string, urlB: string): boolean => {
  const hotelIdA = urlA.split('-')?.[2]?.split('d')?.[1];
  const hotelIdB = urlB.split('-')?.[2]?.split('d')?.[1];
  return hotelIdA === hotelIdB;
};

export const getTopHotelForTrip = async (
  prismaService: PrismaService,
  objectService: ObjectService
): Promise<{
  url: string[];
  name: string[];
  rank: number[];
}> => {
  let driver;
  let listUrlHotelEnemy = [];
  let titleHotelEnemy = [];
  let rankHotelEnemy = [];
  try {
    let lastAllyHotel: tbObject = undefined;
    const objectTrips = await prismaService.tbObject.findMany({
      where: {
        platform: PLATFORM.TRIP,
        tbHotel: {
          type: TYPE_HOTEL.ALLY,
          // Không tính San Dinning
          id: {
            not: 'b50f91fe-d8e0-4e61-9322-e9a9011d6597',
          },
        },
      },
    });
    objectTrips.map((object) => {
      if (
        !lastAllyHotel ||
        object.extra['rank'] > lastAllyHotel.extra['rank']
      ) {
        lastAllyHotel = object;
      }
    });
    console.log(
      lastAllyHotel.name,
      lastAllyHotel.extra?.['rank'],
      'lastRankAllyHotel'
    );

    // let lastRankAllyHotel = 0;
    // objectTrips.map((obj) => {
    // if (obj.extra['rank'] > lastRankAllyHotel) {
    //   lastRankAllyHotel = obj.extra['rank'];
    // }
    // });
    // console.log(lastRankAllyHotel, 'lastRankAllyHotel');

    console.log('Start get top hotel');
    const timezone = 'Asia/Ho_Chi_Minh'; // Change this to the desired timezone
    const capabilities = Capabilities.firefox();
    capabilities.set('tz', timezone);
    capabilities.set('moz:firefoxOptions', {
      args: ['--headless'],
    });
    // const option = new Options().addArguments('--no-proxy-server');
    // .addArguments('--headless=new')
    driver = await new Builder()
      .usingServer(seleniumUrl)
      .forBrowser('firefox')
      .withCapabilities(capabilities)
      .build();

    await driver.get(urlRankHotel);

    while (true) {
      await driver.sleep(5000);

      const nextPageEle = await GetElement(
        driver,
        '//a[@data-smoke-attr="pagination-next-arrow"]'
      );
      await driver.executeScript(
        'arguments[0].scrollIntoView(true)',
        nextPageEle
      );

      console.log('Get list hotel one page');
      const listHotelOnePageEle = await GetElements(
        driver,
        '//span[@class="listItem"]'
      );
      console.log(listHotelOnePageEle.length, 'all list hotel one page');

      const titleEle = await GetElements(
        driver,
        `//div[@data-automation="hotel-card-title"]/a/*`
      );
      console.log(titleEle.length, 'all title');

      const aEle = await GetElements(
        driver,
        `//div[@data-automation="hotel-card-title"]/a`
      );
      console.log(aEle.length, 'all a link');

      let done = false;

      for (let i = 0; i < listHotelOnePageEle.length; i++) {
        let sponsoredEle = undefined;
        try {
          sponsoredEle = await listHotelOnePageEle[i].findElement(
            By.xpath('(./span/div/div/div/div)[2]/header/div/div/div/div/span')
          );
        } catch (e) {}
        if (sponsoredEle) {
          continue;
        }
        // console.log('not sponsoredEle');

        const rank = (await titleEle[i].getText())
          .split(' ')?.[0]
          ?.split('.')?.[0];
        const name = (await titleEle[i].getText()).split('.')?.[1]?.trim();

        const href = await aEle[i].getAttribute('href');

        listUrlHotelEnemy = listUrlHotelEnemy.concat(href);
        titleHotelEnemy = titleHotelEnemy.concat(name);
        rankHotelEnemy = rankHotelEnemy.concat(parseInt(rank));
        if (compareUrlHotel(href, lastAllyHotel.url)) {
          done = true;
          break;
        }
      }
      if (done) {
        break;
      }
      await driver.executeScript('arguments[0].click()', nextPageEle);
    }

    // await driver.sleep(200000);
  } catch (e) {
    console.log(e, 'error');
    const data: tbObject[] =
      await prismaService.$queryRaw`SELECT * FROM "tbObject", "tbHotel" WHERE "tbHotel"."disable"!=true and "tbHotel"."id"="tbObject"."tbHotelId" and "platform" = 'TRIP' ORDER BY ("extra"->'rank') asc`;
    await driver.quit();
    return {
      url: data.map((obj) => obj.url),
      name: data.map((obj) => obj.name),
      rank: data.map((obj) => obj.extra['rank']),
    };
  }
  await driver.quit();
  console.log('Get top hotel done', listUrlHotelEnemy.length);
  console.log(
    listUrlHotelEnemy.length,
    listUrlHotelEnemy[0],
    titleHotelEnemy[0]
  );

  // listUrlHotelEnemy = [listUrlHotelEnemy[0]];
  // titleHotelEnemy = [titleHotelEnemy[0]];
  // rankHotelEnemy = [rankHotelEnemy[0]];

  // Kiểm tra xem ksan đã tồn tại chưa
  console.log('Check hotel out top and exist');
  const hotels = await prismaService.tbHotel.findMany({});
  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    let flag = false;
    listUrlHotelEnemy.map((url) => {
      if (compareUrlHotel(url, hotel.links[PLATFORM.TRIP])) {
        flag = true;
      }
    });
    if (!flag) {
      await prismaService.tbHotel.update({
        where: {
          id: hotel.id,
        },
        data: {
          disable: true,
        },
      });
      console.log('Hotel', hotel.name, 'out top');
    }
  }

  let data: CreateHotel[] = [];
  for (let i = 0; i < listUrlHotelEnemy.length; i++) {
    const url = listUrlHotelEnemy[i];
    let flag = true;
    for (let j = 0; j < hotels.length; j++) {
      const hotel = hotels[j];
      if (compareUrlHotel(url, hotel.links[PLATFORM.TRIP])) {
        flag = false;
        if (hotel.disable) {
          await prismaService.tbHotel.update({
            where: {
              id: hotel.id,
            },
            data: {
              disable: false,
            },
          });
          const objectHotel = await prismaService.tbObject.findFirst();
          console.log('Enable hotel', hotel.name, 'again');
        }
      }
    }
    if (flag) {
      data = data.concat({
        name: titleHotelEnemy[i],
        address: '',
        gm: '',
        avatar: '',
        links: {
          [PLATFORM.TRIP]: url,
        },
        type: TYPE_HOTEL.ENEMY,
        disable: false,
      });
    }
  }
  for (let i = 0; i < data.length; i++) {
    const newEnemyHotel = await prismaService.tbHotel.create({
      data: data[i],
    });

    try {
      await objectService.createObject({
        url: newEnemyHotel.links[PLATFORM.TRIP],
        platform: PLATFORM.TRIP,
        tbHotelId: newEnemyHotel.id,
      });
      console.log(newEnemyHotel.id, 'Add new enemy object');
    } catch (e) {
      console.log(newEnemyHotel.name, 'Add new enemy object fail');
    }
  }
  console.log(data.length, 'Add new enemy hotels');
  console.log('Done get top hotel');
  return {
    url: listUrlHotelEnemy,
    name: titleHotelEnemy,
    rank: rankHotelEnemy,
  };
};

export const updateCompetitionOTABase = async (
  prismaService: PrismaService,
  object: tbObject,
  currentMonth: number,
  currentYear: number
) => {
  const reviews = await getReviewsOtaInMonth(
    prismaService,
    object,
    false,
    currentMonth,
    currentYear
  );

  const totalScore = getScoreByReviewsOtaInMonth(reviews, object.platform);

  const origin = await prismaService.tbCompetitionOTA.findFirst({
    where: {
      tbObjectId: object.id,
      month: currentMonth,
      year: currentYear,
    },
  });

  console.log(
    totalScore,
    reviews.length,
    object.name,
    object.platform,
    origin,
    object
  );

  if (origin && origin != null) {
    await prismaService.tbCompetitionOTA.update({
      where: {
        id: origin.id,
      },
      data: {
        tbObjectId: object.id,
        month: currentMonth,
        year: currentYear,
        score: totalScore,
      },
    });
    await prismaService.tbCompetitionOTA_Review.deleteMany({
      where: {
        tbCompetitionOTAId: origin.id,
      },
    });
    await prismaService.tbCompetitionOTA_Review.createMany({
      data: reviews.map((review) => ({
        tbCompetitionOTAId: origin.id,
        tbReviewId: review.id,
      })),
    });
  } else {
    const newCompetitionOTA = await prismaService.tbCompetitionOTA.create({
      data: {
        tbObjectId: object?.id,
        month: currentMonth,
        year: currentYear,
        score: totalScore,
        extra: {},
        type: TYPE_HOTEL.ALLY,
      },
    });
    await prismaService.tbCompetitionOTA_Review.createMany({
      data: reviews.map((review) => ({
        tbCompetitionOTAId: newCompetitionOTA.id,
        tbReviewId: review.id,
      })),
    });
  }
};

export const calcCompetitionBase = async (
  objectsLog: tbObject[] | NewObjectLog[],
  prismaService: PrismaService,
  currentMonth: number,
  currentYear: number
) => {
  for (let i = 0; i < objectsLog.length; i++) {
    const objectLog = objectsLog[i];
    if (
      objectLog.platform !== PLATFORM.TRIP
      // objectLog.platform !== PLATFORM.BOOKING
    ) {
      continue;
    }
    const {
      numberReviewBad,
      reviewBadInMonth,
      numberReviewHigh,
      reviewHighInMonth,
    } = await getSummaryReviewInMonth(
      prismaService,
      objectLog.platform,
      objectLog.tbHotelId,
      currentMonth,
      currentYear
    );

    const currentDayInMont = moment().get('date');
    let reviewHigh = [],
      reviewBad = [];
    console.log('Calc reivew high in month');
    for (let i = 1; i <= currentDayInMont; i++) {
      let sum = 0;
      reviewHighInMonth.map((review) => {
        if (moment(review.createdAt).get('date') === i) {
          sum += 1;
        }
      });
      reviewHigh = reviewHigh.concat(sum);
    }
    console.log('Calc reivew bad in month');
    for (let i = 1; i <= currentDayInMont; i++) {
      let sum = 0;
      reviewBadInMonth.map((review) => {
        if (moment(review.createdAt).get('date') === i) {
          sum += 1;
        }
      });
      reviewBad = reviewBad.concat(sum);
    }

    // Cập nhật thông tin so sánh khách sạn
    console.log('Update competition hotel');
    const originCompetition = await prismaService.tbCompetition.findFirst({
      where: {
        month: currentMonth,
        year: currentYear,
        tbHotelId: objectLog.tbHotelId,
        platform: objectLog.platform,
      },
    });
    await prismaService.tbCompetition.upsert({
      where: {
        month_year_tbHotelId_platform: {
          month: currentMonth,
          year: currentYear,
          tbHotelId: objectLog.tbHotelId,
          platform: objectLog.platform,
        },
      },
      create: {
        month: currentMonth,
        year: currentYear,
        extra: {
          ...(originCompetition &&
            originCompetition.extra && {
              ...(originCompetition.extra as Prisma.JsonObject),
            }),
          ...(objectLog.platform === PLATFORM.TRIP && {
            rank: objectLog.extra['rank'],
            totalHotel: objectLog.extra['totalHotel'],
          }),
        },
        numberReviewHighAll: objectLog.numberScoreReview[0],
        numberReviewHigh,
        reviewHigh,
        numberReviewBad,
        reviewBad,
        score: objectLog.score,
        tbHotelId: objectLog.tbHotelId,
        updatedAt: new Date(),
        platform: objectLog.platform,
      },
      update: {
        month: currentMonth,
        year: currentYear,
        extra: {
          ...(originCompetition &&
            originCompetition.extra && {
              ...(originCompetition.extra as Prisma.JsonObject),
            }),
          ...(objectLog.platform === PLATFORM.TRIP && {
            rank: objectLog.extra['rank'],
            totalHotel: objectLog.extra['totalHotel'],
          }),
        },
        numberReviewHighAll: objectLog.numberScoreReview[0],
        numberReviewHigh,
        reviewHigh,
        numberReviewBad,
        reviewBad,
        score: objectLog.score,
        tbHotelId: objectLog.tbHotelId,
        updatedAt: new Date(),
        platform: objectLog.platform,
      },
    });
  }
};
