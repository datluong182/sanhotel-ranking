import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectModule } from './object/object.module';
import { PrismaModule } from './prisma/prisma.module';
import { ObjectLogModule } from './object-log/objectLog.module';
import { ResponseModule } from './response/response.module';
import { HotelModule } from './hotel/hotel.module';
import { ReviewModule } from './review/review.module';
import { StaffModule } from './staff/staff.module';
import { StaffLogModule } from './staff-log/staff-log.module';
import { CompetitionModule } from './competition/competition.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    ObjectModule,
    ObjectLogModule,
    ResponseModule,
    HotelModule,
    ReviewModule,
    StaffModule,
    StaffLogModule,
    CompetitionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
