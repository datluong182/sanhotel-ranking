import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { StaffRepository } from "src/staff/staff.repository";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, StaffRepository],
})
export class UsersModule {}
