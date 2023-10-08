import { Injectable } from "@nestjs/common";
import { tbStaff } from "@prisma/client";
import { Logger } from "nestjs-pino";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class StaffRepository {

  constructor(
    private readonly logger: Logger,
    private readonly prismaService: PrismaService,
  ) {}

  private getStaffQuery() {
    return this.prismaService.tbStaff;
  }

  public async findAllStaffByStaffIds(staffIds: string[]): Promise<tbStaff[]> {
    return this.getStaffQuery().findMany({
      where: {
        staffId: {
          in: staffIds,
        },
      },
    });
  }

  public async findFirstStaffByStaffId(staffId: string): Promise<tbStaff> {
    return this.getStaffQuery().findFirst({
      where: {
        staffId,
      },
    });
  }
}
