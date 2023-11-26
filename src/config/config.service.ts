import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CONFIG_GLOBAL } from 'src/utils';

@Injectable()
export class ConfigService {
  constructor(private prismaService: PrismaService) {
    console.log('init config service');
    this.updateStatusCrawlService(false);
  }

  async updateStatusCrawlService(status: boolean) {
    const configGlobal = await this.prismaService.tbConfig.findFirst({
      where: {
        key: CONFIG_GLOBAL,
      },
    });
    if (configGlobal) {
      await this.prismaService.tbConfig.update({
        where: {
          key: CONFIG_GLOBAL,
        },
        data: {
          value: {
            ...(configGlobal.value as object),
            isCrawling: status,
          },
        },
      });
    } else {
      await this.prismaService.tbConfig.create({
        data: {
          key: CONFIG_GLOBAL,
          value: {
            isCrawling: status,
          },
        },
      });
    }
  }
  async getStatusCrawlService() {
    const configGlobal = await this.prismaService.tbConfig.findFirst({
      where: {
        key: CONFIG_GLOBAL,
      },
    });
    return configGlobal?.value?.['isCrawling'] ?? false;
  }
}