import { Injectable } from "@nestjs/common";
import { PLATFORM, Prisma, tbObjectLog } from "@prisma/client";
import { DataList, Paging } from "src/app.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { GetObjectLogByTime } from "./objectLog.dto";

@Injectable()
export class ObjectLogService {
  constructor(private prismaService: PrismaService) {
    console.log('init object log service');
  }

  async getAllObjectLog(query: GetObjectLogByTime): Promise<{ count: number, data: tbObjectLog[] }> {
    let data: tbObjectLog[]
    if (query.platform === PLATFORM.TRIP) {
      data = await this.prismaService.$queryRaw(Prisma.sql`SELECT * FROM "tbObjectLog" WHERE "url" = ${query.url} AND EXTRACT(HOUR FROM "updatedAt") >= 23 AND "isManual" = true AND "platform" = 'TRIP' ORDER BY "updatedAt" ASC`);
    }
    if (query.platform === PLATFORM.BOOKING) {
      data = await this.prismaService.$queryRaw(Prisma.sql`SELECT * FROM "tbObjectLog" WHERE "url" = ${query.url} AND EXTRACT(HOUR FROM "updatedAt") >= 23 AND "isManual" = true AND "platform" = 'BOOKING' ORDER BY "updatedAt" ASC`);
    }
    return {
      count: data.length,
      data,
    }
  }

}