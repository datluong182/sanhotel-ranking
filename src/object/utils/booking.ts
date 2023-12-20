import { HttpException, HttpStatus } from '@nestjs/common';
import { PLATFORM, Prisma } from '@prisma/client';
import { Builder, By, Capabilities, WebDriver } from 'selenium-webdriver';
import { GetElement, GetElements } from 'src/utils';
import { Objects, RoomsBooking, RoomsByDay } from '../object.entity';
import * as moment from 'moment-timezone';
moment.tz.setDefault('Asia/Ho_Chi_Minh');

const extractDataBoooking = async (
  driver: WebDriver,
  platform: PLATFORM,
  url: string,
  seleniumUrl: string,
  capabilities: Capabilities
): Promise<Objects | undefined> => {
  console.log('get name');

  const titleEle = await GetElement(
    driver,
    '//h2[contains(concat(" ", @class, " "), " pp-header__title ")]'
  );
  if (!titleEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy tiêu đề',
      },
      HttpStatus.BAD_REQUEST
    );
  }
  const name = await titleEle.getText();

  console.log('get score');
  const scoreReviewEle = await GetElement(
    driver,
    '//button[@data-testid="read-all-actionable"]/div/div/div[@aria-label]'
  );
  if (!scoreReviewEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy điểm review',
      },
      HttpStatus.BAD_REQUEST
    );
  }
  let text = await scoreReviewEle.getText();
  text = text.replaceAll(',', '.');
  const score = parseFloat(text);

  console.log('get stars');
  const starsEle = await GetElements(
    driver,
    '//span[@data-testid="rating-stars"]/span'
  );
  if (!starsEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy số sao khách sạn',
      },
      HttpStatus.BAD_REQUEST
    );
  }
  const stars = starsEle.length;

  console.log('get total reviews');
  const numberReviewsEle = await GetElement(
    driver,
    '//button[@data-testid="read-all-actionable"]'
  );
  if (!numberReviewsEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy tổng số reviews',
      },
      HttpStatus.BAD_REQUEST
    );
  }
  await driver.executeScript(
    'arguments[0].scrollIntoView(true)',
    numberReviewsEle
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
    await GetElement(driver, '//div[@id="review_score_filter"]/button')
  );
  const liScoreEles = await GetElements(
    driver,
    '//div[@id="review_score_filter"]/div/div/ul/li/button/span[@class="review-filter-item__counter"]'
  );
  if (!liScoreEles) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: 'Không tìm thấy tổng số reviews',
      },
      HttpStatus.BAD_REQUEST
    );
  }
  for (let i = 0; i < liScoreEles.length; i++) {
    await driver.executeScript(
      'arguments[0].click()',
      await GetElement(driver, '//div[@id="review_score_filter"]/button')
    );
    await driver.sleep(1500);
    const tempLiScoreEles = await GetElements(
      driver,
      '//div[@id="review_score_filter"]/div/div/ul/li/button/span[@class="review-filter-item__counter"]'
    );
    if (!tempLiScoreEles) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không tìm thấy tổng số reviews',
        },
        HttpStatus.BAD_REQUEST
      );
    }
    await driver.executeScript('arguments[0].click()', tempLiScoreEles[i]);
    await driver.sleep(1500);
    const selected = await GetElement(
      driver,
      `(//div[@id="review_score_filter"]/div/div/ul/li/button/span[@class="review-filter-item__counter"])[${
        i + 1
      }]`
      // '//div[@id="review_score_filter"]/button/span/span[@class="review-filter-item__counter"]'
    );
    if (!selected) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không tìm thấy tổng số reviews',
        },
        HttpStatus.BAD_REQUEST
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
    '//div[@data-testid="PropertyReviewsRegionBlock"]/div[@class="bui-spacer--larger"]/div/div/div/div/div'
  );
  console.log(subScoreWrapperEle.length, 'get subscores');
  let subScore: { [key: string]: number } = {};
  for (let i = 0; i < subScoreWrapperEle.length - 1; i++) {
    if (i % 2 !== 0) continue;
    const subScoreEle = await subScoreWrapperEle[i].findElement(
      By.xpath('./div/div/div[contains(@id, "label")]')
    );
    const keySubScoreEle = await subScoreWrapperEle[i].findElement(
      By.xpath('./div/div/div/span')
    );

    subScore = {
      ...subScore,
      [await keySubScoreEle.getText()]: parseFloat(
        await subScoreEle?.getText()
      ),
    };
  }
  await driver.quit();

  // Lấy số lượng phòng trong 7 ngày tiếp theo
  // const MAX_DAY = 7;
  // const roomsByDay: RoomsByDay[] & Prisma.JsonArray = [];
  // for (let day = 0; day < MAX_DAY; day++) {
  //   const checkInDate = moment().add(day, 'days').format('YYYY-MM-DD');
  //   const checkOutDate = moment()
  //     .add(day + 1, 'days')
  //     .format('YYYY-MM-DD');
  //   console.log('get day', checkInDate);
  //   driver = await new Builder()
  //     .usingServer(seleniumUrl)
  //     .forBrowser('firefox')
  //     .withCapabilities(capabilities)
  //     .build();

  //   await driver.get(
  //     url +
  //       `?  =en-us&checkin=${checkInDate}&checkout=${checkOutDate}&group_adults=2&no_rooms=1&group_children=0&selected_currency=USD#availability_target`
  //   );
  //   console.log(
  //     url +
  //       `?lang=en-us&checkin=${checkInDate}&checkout=${checkOutDate}&group_adults=2&no_rooms=1&group_children=0&selected_currency=USD#availability_target`
  //   );
  //   console.log('Check no more rooms');
  //   const noRoomsEle = await GetElement(
  //     driver,
  //     '//*[text()="Not available on our site for your dates"]'
  //   );
  //   console.log('Check no more rooms done');
  //   let rooms: Array<RoomsBooking> = [];
  //   if (!noRoomsEle) {
  //     console.log('Still have rooms');
  //     // Lấy tất cả các hàng trong bảng
  //     const rows = await GetElements(driver, '//tr[@data-block-id]');
  //     for (let i = 0; i < rows.length; i++) {
  //       console.log('get row', i);
  //       const row = (await GetElements(driver, '//tr[@data-block-id]'))[i];

  //       console.log(
  //         'Get data block id',
  //         await row.getAttribute('data-block-id')
  //       );

  //       let tdFirstEle = undefined;
  //       console.log('Check first td');
  //       try {
  //         tdFirstEle = await GetElement(
  //           row,
  //           './td[contains(@class, " -first ")]'
  //         );
  //       } catch (e) {}
  //       console.log('Check first td done');
  //       console.log('Get occupancy');
  //       const occupancyEle = await GetElements(
  //         row,
  //         './td[contains(@class, "hprt-table-cell-occupancy")]/div/div/span/i'
  //       );

  //       console.log('Get occupancy', occupancyEle.length);

  //       console.log('Get price');
  //       const priceEle = await GetElement(
  //         row,
  //         './td/div/div/div/div/div/span[@class="prco-valign-middle-helper"]'
  //       );
  //       console.log('Get price', await priceEle.getText());

  //       // Nếu là hàng đầu của phòng
  //       if (tdFirstEle) {
  //         console.log('First td');
  //         console.log('Get name');
  //         const nameEle = await GetElement(row, './td/div/div/a/span');
  //         console.log('Get name', await nameEle.getText());

  //         console.log('Get numberRooms');
  //         const numberRoomsEle = await GetElements(
  //           (
  //             await GetElements(
  //               driver,
  //               '//select[@class="hprt-nos-select js-hprt-nos-select"]'
  //             )
  //           )[i],
  //           './option'
  //         );
  //         console.log('Get numberRooms', numberRoomsEle.length - 1);

  //         rooms = rooms.concat({
  //           name: await nameEle.getText(),
  //           typeRooms: [
  //             {
  //               id: await row.getAttribute('data-block-id'),
  //               price: await priceEle.getText(),
  //               occupancy: occupancyEle.length,
  //             },
  //           ],
  //           numberRooms: numberRoomsEle.length - 1,
  //         });
  //       } else {
  //         rooms[rooms.length - 1] = {
  //           ...rooms[rooms.length - 1],
  //           typeRooms: rooms[rooms.length - 1].typeRooms.concat({
  //             id: await row.getAttribute('data-block-id'),
  //             price: await priceEle.getText(),
  //             occupancy: occupancyEle.length,
  //           }),
  //         };
  //       }
  //     }
  //   }
  //   console.log(rooms.length, 'get rooms');
  //   roomsByDay.push({
  //     checkInDate,
  //     checkOutDate,
  //     rooms,
  //   });
  //   await driver.quit();
  // }
  // Lấy số lượng phòng trong 7 ngày tiếp theo

  return {
    name,
    url,
    score,
    platform,
    extra: {
      stars,
      subScore,
      // roomsByDay,
    },
    numberScoreReview: numberScoreReview.map((sc) => parseInt(sc)),
    updatedAt: new Date(),
  };
};

export default extractDataBoooking;
