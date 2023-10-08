import { WebDriver } from "selenium-webdriver";
import { GetElement, GetElements } from "src/utils";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Objects } from "../object.entity";
import { PLATFORM } from "@prisma/client";

const extractDataGoogle = async (
  driver: WebDriver,
  platform: PLATFORM,
  url: string,
): Promise<Objects | undefined> => {
  const titleEle = await GetElement(driver, '//div[@role="main"]');
  if (!titleEle) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        detail: "Không tìm thấy tiêu đề",
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  const name = await titleEle.getAttribute("aria-label");
  console.log(name, "get name");

  const scoreEle = await GetElement(
    driver,
    '//div[@jsaction="pane.reviewChart.moreReviews"]/div/div[@class="fontDisplayLarge"]',
  );
  await driver.executeScript("arguments[0].scrollIntoView(true);", scoreEle);
  await driver.sleep(500);
  console.log(await scoreEle.getText(), "get text score");
  const score = parseFloat((await scoreEle.getText()).replaceAll(",", "."));
  console.log(score, "get score");

  const numberScoreReviewEles = await GetElements(
    driver,
    '//div[@jsaction="pane.reviewChart.moreReviews"]/div/table/tbody/tr',
  );
  const numberScoreReview = [];
  for (let i = 0; i < 5; i++) {
    const textnumberScoreReview = await numberScoreReviewEles[i].getAttribute(
      "aria-label",
    );
    console.log(textnumberScoreReview, "textnumberScoreReview");
    const numberScore = parseInt(
      textnumberScoreReview.split(",")[1].split(" ")[1],
    );
    numberScoreReview.push(numberScore);
  }
  console.log(numberScoreReview, "get number score review");
  console.log(name, score, numberScoreReview);
  return {
    name,
    score,
    numberScoreReview,
    extra: {},
    platform,
    updatedAt: new Date(),
    url,
  };
};

export default extractDataGoogle;
