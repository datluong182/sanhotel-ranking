import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { StaffPointController } from "./staff-points.controller";
import { StaffPointService } from "./staff-point.service";
import { StaffRepository } from "src/staff/staff.repository";

@Module({
    imports: [PrismaModule],
    controllers: [StaffPointController],
    providers: [StaffPointService, StaffRepository],
})
export class StaffPointModule {}