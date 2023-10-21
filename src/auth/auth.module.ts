import { Global, Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersRepository } from "src/users/users.repository";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./auth.guard";
import { StaffRepository } from "../staff/staff.repository";

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    StaffRepository,
  ],
  exports: [StaffRepository],
})
export class AuthModule {}
