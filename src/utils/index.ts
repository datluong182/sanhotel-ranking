import { By, WebDriver, WebElement } from 'selenium-webdriver';

export const nomalizeName = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace('đ', 'd')
    .toLowerCase()
    .trim();
};

export const GetElement = async (
  driver: WebDriver | WebElement,
  xpath: string
) => {
  try {
    let ele = undefined;
    let count = 1;
    while (true) {
      if (count > 3) {
        return null;
      }
      try {
        ele = await driver.findElement(By.xpath(xpath));
        return ele;
      } catch (e) {}
      const sleep = new Promise((resole, reject) => {
        setTimeout(() => {
          resole('Sleep 2s ' + xpath);
        }, 2000);
      });
      console.log(await sleep);

      count++;
    }
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
  xpath: string
): Promise<WebElement[]> => {
  try {
    let eles = undefined;
    let count = 1;
    while (true) {
      if (count > 3) {
        return null;
      }
      try {
        eles = await driver.findElements(By.xpath(xpath));
        return eles;
      } catch (e) {}
      const sleep = new Promise((resole, reject) => {
        setTimeout(() => {
          resole('Sleep 2s ' + xpath);
        }, 2000);
      });
      console.log(await sleep);

      count++;
    }
  } catch (e) {
    console.log('Cannot find elements', e);
    return null;
  }
};

export const ClickElement = async (
  driver: WebDriver,
  ele: WebElement
): Promise<boolean> => {
  try {
    await driver.executeScript('arguments[0].click()', ele);
    return true;
  } catch (e) {
    console.log('Cannot click elements');
    return false;
  }
};

export const seleniumUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.SELENIUM_URL
    : process.env.SELENIUM_URL_DEV;

export const CONFIG_GLOBAL = 'CONFIG_GLOBAL';
