import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/prisma/prisma.service';
import { CONFIG_GLOBAL } from 'src/utils';
import { ConfigService } from 'src/config/config.service';

export const appendLogFile = async (
  configService: ConfigService,
  create: boolean,
  content = ''
) => {
  let fileLogName;
  if (create) {
    const numberCrawl =
      (await configService.getConfig(CONFIG_GLOBAL, 'numberCrawl')) ?? 0;
    const nameFile = moment().format('DD_MM_YYYY_HH-mm');
    const fileLog = `${numberCrawl}.${nameFile}.txt`;
    const filePath = path.join(process.cwd(), 'logs', fileLog);
    console.log(filePath, 'filePath');
    await configService.updateConfig(CONFIG_GLOBAL, {
      fileLog: filePath,
    });
    fileLogName = filePath;
  } else {
    fileLogName =
      (await configService.getConfig(CONFIG_GLOBAL, 'fileLog')) ?? undefined;
  }
  try {
    fs.appendFileSync(fileLogName, content);
  } catch (err) {
    console.error('Error update log file:', err);
  }
};

export const convertLog = (
  textInit: string | string[],
  func: string,
  type: 'STATUS' | 'ERROR' | 'LOG'
) => {
  let text = '';
  const time = `[${moment().format('DD-MM-YYYY HH:mm')}]`;
  if (typeof textInit === 'string')
    text = `${time} ${type} ${textInit} - Function: ${func}\n`;
  else {
    textInit.map((str) => {
      text += `${time} ${type} ${str} - Function: ${func}\n`;
    });
  }
  return text;
};
