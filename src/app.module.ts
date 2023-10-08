import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ObjectModule } from "./object/object.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ObjectLogModule } from "./object-log/objectLog.module";
import { ResponseModule } from "./response/response.module";
import { HotelModule } from "./hotel/hotel.module";
import { ReviewModule } from "./review/review.module";
import { StaffModule } from "./staff/staff.module";
import { StaffLogModule } from "./staff-log/staff-log.module";
import { CompetitionModule } from "./competition/competition.module";
import { LoggerModule } from "nestjs-pino";
import { StaffPointModule } from "./staff-points/staff-point.module";
import { UsersModule } from "./users/users.modules";
import { AuthModule } from "./auth/auth.module";
import { AuthMiddleware } from "./auth/auth.middleware";
import { StaffPointController } from "./staff-points/staff-points.controller";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(),
    PrismaModule,
    ObjectModule,
    ObjectLogModule,
    ResponseModule,
    HotelModule,
    ReviewModule,
    StaffModule,
    StaffLogModule,
    CompetitionModule,
    StaffPointModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(StaffPointController);
  }
}
