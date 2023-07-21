import { By, WebDriver, WebElement } from 'selenium-webdriver';

export const GetElement = async (
  driver: WebDriver | WebElement,
  xpath: string,
) => {
  try {
    return driver.findElement(By.xpath(xpath));
  } catch (e) {
    console.log('Cannot find element');
    return null;
  } finally {
    console.log('Cannot find element');
    return null;
  }
};

export const GetElements = async (
  driver: WebDriver | WebElement,
  xpath: string,
): Promise<WebElement[]> => {
  try {
    return driver.findElements(By.xpath(xpath));
  } catch (e) {
    console.log('Cannot find elements');
    return null;
  } finally {
    console.log('Cannot find elements');
    return null;
  }
};
