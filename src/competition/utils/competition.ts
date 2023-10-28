import { PLATFORM, TYPE_HOTEL, tbObject } from '@prisma/client';
import { Builder, By, Capabilities } from 'selenium-webdriver';
import { CreateHotel } from 'src/hotel/hotel.dto';
import { ObjectService } from 'src/object/object.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetElement, GetElements, seleniumUrl } from 'src/utils';

export const urlRankHotel =
  'https://www.tripadvisor.com/Hotels-g293924-zfd9261,21371-a_ufe.true-a_sort.POPULARITY-Hanoi-Hotels.html';

const compareUrlHotel = (urlA: string, urlB: string): boolean => {
  const hotelIdA = urlA.split('-')?.[2]?.split('d')?.[1];
  const hotelIdB = urlB.split('-')?.[2]?.split('d')?.[1];
  return hotelIdA === hotelIdB;
};

export const getTopHotelForTrip = async (
  prismaService: PrismaService,
  objectService: ObjectService,
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
      'lastRankAllyHotel',
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
        '//a[@data-smoke-attr="pagination-next-arrow"]',
      );
      await driver.executeScript(
        'arguments[0].scrollIntoView(true)',
        nextPageEle,
      );

      console.log('Get list hotel one page');
      const listHotelOnePageEle = await GetElements(
        driver,
        '//span[@class="listItem"]',
      );
      console.log(listHotelOnePageEle.length, 'all list hotel one page');

      const titleEle = await GetElements(
        driver,
        `//div[@data-automation="hotel-card-title"]/a/*`,
      );
      console.log(titleEle.length, 'all title');

      const aEle = await GetElements(
        driver,
        `//div[@data-automation="hotel-card-title"]/a`,
      );
      console.log(aEle.length, 'all a link');

      let done = false;

      for (let i = 0; i < listHotelOnePageEle.length; i++) {
        let sponsoredEle = undefined;
        try {
          sponsoredEle = await listHotelOnePageEle[i].findElement(
            By.xpath('(./span/div/div/div/div)[2]/header/div/div/div/div/span'),
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
    titleHotelEnemy[0],
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
