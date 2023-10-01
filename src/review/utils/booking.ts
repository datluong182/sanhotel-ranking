import { By, WebDriver } from 'selenium-webdriver';
import { ReviewBooking } from '../review.entity';
import { GetElement, GetElements } from 'src/utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');

const extractReviewBooking = async (
  driver: WebDriver,
  pagename: string,
): Promise<ReviewBooking[] | undefined> => {
  const result: ReviewBooking[] = [];
  let page = 0;
  let count = 1;
  console.log('Start crawl booking');
  while (true) {
    // if (count > 5) break;
    const url = `https://www.booking.com/reviewlist.html?dist=1&pagename=${pagename}&type=total&offset=${page}&rows=10&cc1=vn&sort=f_recent_desc`;
    await driver.get(url);
    await driver.sleep(500);

    const reviewItems = await GetElements(
      driver,
      '//li[@class="review_list_new_item_block"]',
    );
    console.log('get number review', reviewItems.length);
    const usernameEles = await GetElements(
      driver,
      '//*[@class="bui-avatar-block__title"]',
    );
    console.log('get all username');
    const titleEles = await GetElements(driver, '//h3');
    console.log('get all title');
    const contentEles = await GetElements(driver, '//*[@class="c-review"]');
    console.log('get all content');
    const createdAtEles = await GetElements(
      driver,
      '//*[@class="c-review-block__row"]/span[@class="c-review-block__date"]',
    );
    console.log('get all createdAt');
    const scoreEles = await GetElements(
      driver,
      '//*[@class="bui-review-score__badge"]',
    );
    console.log('get all score');
    const reviewIdEles = await GetElements(driver, '//li[@data-review-url]');
    console.log('get all review id');

    // Biến kiểm tra xem có review khác tháng hiện tại chưa?
    let cancel = false;

    if (
      !usernameEles ||
      !titleEles ||
      !contentEles ||
      !createdAtEles ||
      !scoreEles
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Không tìm thấy',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    for (let i = 0; i < reviewItems.length; i++) {
      const content = [];

      const divContent = await contentEles[i].findElements(
        By.className('c-review__body'),
      );
      if (divContent.length === 2) {
        content.push(await divContent[0].getText());
        content.push(await divContent[1].getText());
      }
      if (divContent.length === 1) {
        content.push(await divContent[0].getText());
      }

      const createdAtString = (await createdAtEles[i].getText())
        .split('Reviewed: ')?.[1]
        .trim();
      // console.log(moment(createdAtString, "MMMM D YYYY").format("DD/MM/YYYY"), "booking created at")

      // Kiểm tra xem có phải review Reviewer's choice không. Nếu có, trường hợp review thuộc tháng trong qkhu thì bỏ qua không check dừng
      // const reviewerChoiceEle = await GetElement(
      //   driver,
      //   '//span[@class="c-review-block__badge"]',
      // );
      // if (!reviewerChoiceEle || (reviewerChoiceEle && i !== 0)) {
      //   // Điều kiện dừng: Chỉ crawl và cập nhật trong tháng hiện tại. Data tháng trước giữ nguyên. Khi gặp review thuộc tháng trước tháng hiện tại thì dừng vòng lặp
      //   // '2023/08/01', 'YYYY/MM/DD'

      // }

      if (
        moment(createdAtString, 'MMMM D YYYY')
          .set({ h: 0, m: 0, s: 0 })
          .isBefore(moment().startOf('month').set({ h: 0, m: 0, s: 0 }))
      ) {
        console.log(
          'last review of month',
          moment(createdAtString, 'MMMM D YYYY').format('DD/MM/YYYY'),
        );
        cancel = true;
        break;
      }

      // if (reviewerChoiceEle && i === 0) {
      // } else {

      // }
      result.push({
        username: await usernameEles[i].getText(),
        title: await titleEles[i].getText(),
        createdAt: moment(createdAtString, 'MMMM D YYYY')
          .set({ h: 0, m: 0, s: 0 })
          .toDate(),
        monthCreated: moment(createdAtString, 'MMMM D YYYY').get('month') + 1,
        yearCreated: moment(createdAtString, 'MMMM D YYYY').get('year'),
        extra: {
          score: parseFloat(
            (await scoreEles[i].getText()).replaceAll(',', '.').trim(),
          ),
          reviewId: await reviewIdEles[i].getAttribute('data-review-url'),
          link: url,
        },
        content,
      });
    }

    if (cancel) {
      // Dừng crawl khi có review thuộc tháng trước
      break;
    }

    console.log('booking page', count);
    // const textEmpty = await GetElement(driver, '//*[@class="bui-empty-state"]');
    // if (textEmpty) {
    //   break;
    // } else {
    //   count++;
    //   page += 10;
    // }

    count++;
    page += 10;
    if (count > 20) {
      break;
    }
    // break;
  }
  console.log(result.length, result[0], 'result booking');
  return result;
};

export default extractReviewBooking;
