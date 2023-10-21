import { Injectable } from "@nestjs/common";
import { PLATFORM, Prisma, tbStaffLog } from "@prisma/client";
import { DataList, Paging } from "src/app.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { GetStaffLogByTime } from "./staff-log.dto";
import * as moment from "moment-timezone";

moment.tz.setDefault("Asia/Ho_Chi_Minh");

@Injectable()
export class StaffLogService {
  constructor(private prismaService: PrismaService) {
    console.log("init staff log service");
  }

  async getAllStaffLog(
    query: GetStaffLogByTime,
  ): Promise<{ count: number; data: tbStaffLog[] }> {
    // result = await this.prismaService.$queryRaw`
    //   SELECT DISTINCT ON (DATE("updatedAt"))
    //         *
    //   FROM "tbStaffLog"
    //   WHERE "tbHotelId" = ${query.tbHotelId} and "updatedAt"::date > ${new Date(query.start)} and "updatedAt"::date < ${new Date(query.end)}
    //   ORDER BY DATE("updatedAt"), "updatedAt" DESC, ("fiveStarsReview"->'TRIP') DESC;
    // `;

    const lastUpdated = await this.prismaService.tbStaffLastUpdate.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    const listRanking = await this.prismaService.tbStaffLog.groupBy({
      by: ["id"],
      _max: {
        updatedAt: true,
      },
      where: {
        tbHotelId: query.tbHotelId,
        tbStaffLastUpdateId: lastUpdated.id,
      },
    });

    const result = await this.prismaService.tbStaffLog.findMany({
      where: {
        id: {
          in: listRanking.map((item) => item.id),
        },
        updatedAt: {
          gte: new Date(query.start),
          lte: new Date(query.end),
        },
      },
    });

    console.log(listRanking, "result");
    return {
      count: result.length,
      data: result,
    };
  }
}
