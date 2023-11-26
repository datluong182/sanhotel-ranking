import { By, WebDriver } from 'selenium-webdriver';
import { ReviewTrip } from '../review.entity';
import { ClickElement, GetElement, GetElements } from 'src/utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const month = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const monthNum = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
];

const extractReviewTrip = async (
  driver: WebDriver,
  url: string
): Promise<ReviewTrip[] | undefined> => {
  let result: ReviewTrip[] = [];
  let count = 1;
  console.log('Start crawl trip');
  await driver.get(url);
  while (true) {
    // if (count > 5) {
    //   break;
    // }
    let reviewAreaEle,
      countFind = 0;
    while (true) {
      if (countFind > 10) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            detail: 'Không tìm thấy',
          },
          HttpStatus.BAD_REQUEST
        );
      }
      reviewAreaEle = await GetElement(driver, '//div[@id="hrReviewFilters"]');
      if (reviewAreaEle) {
        break;
      }
      await driver.sleep(1000);
      countFind += 1;
    }
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      reviewAreaEle
    );
    await driver.sleep(500);
    console.log('go to review');

    const languageFilterEle = await GetElement(
      driver,
      '//label[@for="LanguageFilter_0"]'
    );
    // await languageFilterEle.click();
    await driver.executeScript('arguments[0].click()', languageFilterEle);
    console.log('get all review');
    await driver.sleep(500);

    const reviewItems = await GetElements(
      driver,
      '//div[@data-test-target="HR_CC_CARD"]'
    );
    console.log('get number review', reviewItems.length);
    const usernameEles = await GetElements(
      driver,
      '//div[@data-test-target="HR_CC_CARD"]/div/div/div/span/a'
    );
    console.log('get all username review', usernameEles.length);
    const createdAtEles = await GetElements(
      driver,
      '//div[@data-test-target="HR_CC_CARD"]/div/div/div/span[contains(text(), "wrote")]'
    );
    console.log('get all createdAt review', createdAtEles.length);
    const titleEles = await GetElements(
      driver,
      '//div[@data-test-target="review-title"]/a/span/span'
    );
    console.log('get all title review', titleEles.length);
    const readMoreEle = await GetElement(
      driver,
      '//div[@data-test-target="expand-review"]'
    );
    // Nếu có review cần mở rộng thì mở rộng
    if (readMoreEle) {
      await driver.executeScript(
        'arguments[0].scrollIntoView(true);',
        readMoreEle
      );
      await driver.executeScript('arguments[0].click()', readMoreEle);
      await driver.sleep(500);
    }
    const contentEles = await driver.findElements(
      By.xpath(
        `//div[@data-reviewId]/div/div/div[@style="max-height: none; line-break: normal; cursor: auto;"]/span/span`
      )
    );
    console.log('get all content review', contentEles.length);
    const linkEles = await GetElements(driver, '//div[@data-reviewid]');
    console.log('get all share review', linkEles.length);

    if (
      !contentEles ||
      !usernameEles ||
      !createdAtEles ||
      !titleEles ||
      !linkEles
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không tìm thấy',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    // Biến kiểm tra xem có review khác tháng hiện tại chưa?
    let cancel = false;

    for (let i = 0; i < reviewItems.length; i++) {
      await driver.executeScript(
        'arguments[0].scrollIntoView(true)',
        reviewItems[i]
      );
      await driver.sleep(1000);
      // console.log(i, 'i');
      //stars
      const script = `return  window.getComputedStyle(document.querySelectorAll('div[data-test-target="review-rating"]')[${i}].querySelector("span"), '::after').getPropertyValue('content')`;
      const contentValue: string = await driver.executeScript(script);
      let sum = 0;
      for (let i = 0; i < contentValue.length; i++) {
        if (contentValue.charCodeAt(i).toString(16) === 'e00b') sum += 1;
      }

      // link
      const reviewId = await linkEles[i].getAttribute('data-reviewid');
      let link = url.replaceAll('Hotel_Review', 'ShowUserReviews');
      link = link.replaceAll('-Reviews-', `-r${reviewId}-`);

      const content = [await contentEles[i].getText()];
      const currentMonthName = moment().format('MMMM').substring(0, 3);
      // console.log(await createdAtEles[i].getText(), 'createAtEle');
      const createdAtString: string = ((await createdAtEles[i].getText()) ?? '')
        .split('wrote a review')?.[1]
        ?.trim();

      let day = '',
        monthStr = '',
        year = '';
      if (
        createdAtString.search('Yesterday') === -1 &&
        createdAtString.search('Today') === -1
      ) {
        const arr = createdAtString.split(' ');

        if (
          createdAtString.search(currentMonthName) !== -1 &&
          arr[1].length <= 2
        ) {
          // Tháng hiện tại
          day = arr[1].padStart(2, '0');
          monthStr =
            monthNum[
              month.findIndex((item) => arr[0].trim().search(item) !== -1)
            ];
          year = moment().get('year').toString();
        } else {
          // Các tháng trước
          day = '01';
          monthStr =
            monthNum[
              month.findIndex((item) => arr[0].trim().search(item) !== -1)
            ];
          year = arr[1].trim();
        }
      } else {
        const subtractDay = createdAtString.search('Yesterday') !== -1 ? 1 : 0;
        day = moment()
          .set({ hour: 12, minute: 0, second: 0 })
          .subtract(subtractDay, 'day')
          .get('date')
          .toString()
          .padStart(2, '0');
        monthStr = (
          moment()
            .set({ hour: 12, minute: 0, second: 0 })
            .subtract(1, 'day')
            .get('month') + 1
        )
          .toString()
          .padStart(2, '0');
        year = moment()
          .set({ hour: 12, minute: 0, second: 0 })
          .subtract(1, 'day')
          .get('year')
          .toString();
      }

      const createdAt = moment(
        `${day}/${monthStr}/${year} 00:00:00`,
        'DD/MM/YYYY HH:mm:ss'
      ).toDate();
      // console.log(`${day}/${monthStr}/${year}`, moment(`${day}/${monthStr}/${year} 12:00:00`, "DD/MM/YYYY HH:mm:ss").toISOString(), "trip createdAt")

      // Điều kiện dừng: Chỉ crawl và cập nhật trong tháng hiện tại. Data tháng trước giữ nguyên. Khi gặp review thuộc tháng trước tháng hiện tại thì dừng vòng lặp
      // '2023/08/01', 'YYYY/MM/DD'
      if (
        moment(
          `${day}/${monthStr}/${year} 00:00:00`,
          'DD/MM/YYYY HH:mm:ss'
        ).isBefore(moment().startOf('month').set({ h: 0, m: 0, s: 0 }))
      ) {
        console.log('Check is fav review or not?');
        const favReviewEle = await GetElement(
          reviewItems[i],
          `./div/div[text()="Hotel's Favorite"]`
        );
        if (favReviewEle) {
          console.log('Fav review. Continue...');
          continue;
        }

        console.log(
          'last review of month',
          moment(
            `${day}/${monthStr}/${year} 00:00:00`,
            'DD/MM/YYYY HH:mm:ss'
          ).format('DD/MM/YYYY'),
          result[result.length - 1]
        );
        cancel = true;
        break;
      }
      await driver.sleep(200);

      result = result.concat({
        username: await usernameEles[i].getText(),
        createdAt,
        monthCreated:
          moment(
            `${day}/${monthStr}/${year} 00:00:00`,
            'DD/MM/YYYY HH:mm:ss'
          ).get('month') + 1,
        yearCreated: moment(
          `${day}/${monthStr}/${year} 00:00:00`,
          'DD/MM/YYYY HH:mm:ss'
        ).get('year'),
        title: await titleEles[i].getText(),
        content,
        extra: {
          stars: sum,
          link,
          reviewId,
        },
      });
    }

    if (cancel) {
      // Dừng crawl khi có review thuộc tháng trước
      break;
    }

    const nextBtnEle = await GetElement(driver, '//*[text() = "Next"]');
    if (!nextBtnEle) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không tìm thấy',
        },
        HttpStatus.BAD_REQUEST
      );
    }
    const classNextBtn = await nextBtnEle.getAttribute('class');
    console.log('trip page', count);
    if (classNextBtn.search('disabled') !== -1) {
      break;
    } else {
      count++;
      await driver.executeScript('arguments[0].click()', nextBtnEle);
      await driver.sleep(1000);
    }
  }
  console.log(result.length, result[0], 'result trip');

  return result;
};

export default extractReviewTrip;
