import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ResponseController } from "./response.controller";
import { ResponseService } from "./response.service";
import { PrismaModule } from "../prisma/prisma.module";
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [ResponseController],
  providers: [ResponseService],
  exports: [ResponseService],
})
export class ResponseModule {}
