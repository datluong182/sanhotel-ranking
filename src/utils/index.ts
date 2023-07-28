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

export const seleniumUrl = process.env.SELENIUM_URL
