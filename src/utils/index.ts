import { By, WebDriver, WebElement } from 'selenium-webdriver';

export const GetElement = async (
  driver: WebDriver | WebElement,
  xpath: string,
) => {
  try {
    return await driver.findElement(By.xpath(xpath));
  } catch (e) {
    console.log('Cannot find element', e);
    return null;
  }
};

export function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export const GetElements = async (
  driver: WebDriver | WebElement,
  xpath: string,
): Promise<WebElement[]> => {
  try {
    return await driver.findElements(By.xpath(xpath));
  } catch (e) {
    console.log('Cannot find elements');
    return null;
  }
};

export const seleniumUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.SELENIUM_URL
    : process.env.SELENIUM_URL_DEV;
