import { Injectable } from "@nestjs/common";
import { StaffRepository } from "src/staff/staff.repository";
import { AddPointForStaffDto } from "./staff-points.dto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class StaffPointService {
     
    constructor(
        private readonly staffRepository: StaffRepository,
        private readonly prismaService: PrismaService,
    ) {
        
    }

    public async addPointForStaff(
        infos: AddPointForStaffDto[],
        userId: string,
    ) {
        const pointHistories: Prisma.tbPointHistoryCreateInput[] = [];
        const staffIds = infos.map((info) => info.staffId);
        const staffs = await this.staffRepository.findAllStaffByIds(staffIds);
        await Promise.all(staffs.map(async (staff) => {
            for (const info of infos) {
                if (staff.staffId === info.staffId) {
                    await this.prismaService.tbStaff.update({
                        where: {
                            id: staff.id,
                        },
                        data: {
                            point: staff.point + info.point
                        }
                    })
                    staff.point += info.point;
                    pointHistories.push({
                        staffId: staff.staffId,
                        point: info.point,
                        createdAt: new Date(),
                        updatedBy: userId,
                        updatedAt: new Date(),
                    })
                }
            }
        }))
        for (const staff of staffs) {
            
        }
        await this.prismaService.tbPointHistory.createMany({
            data: pointHistories,
            skipDuplicates: true,
        })
    }
}