import { Injectable } from "@nestjs/common";
import { tbStaff } from "@prisma/client";
import { Logger } from "nestjs-pino";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class StaffRepository {
    constructor(
        private readonly logger: Logger,
        private readonly prismaService: PrismaService,
    ) {

    }

    public async findAllStaffByIds(staffIds: string[]): Promise<tbStaff[]> {
        return this.prismaService.tbStaff.findMany({
            where: {
                staffId: {
                    in: staffIds
                }
            }
        })
    }
    
}