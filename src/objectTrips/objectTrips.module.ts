import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ObjectTripsController } from './objectTrips.controller';
import { ObjectTripsService } from './objectTrips.service';
import { PrismaModule } from '../prisma/prisma.module';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule],
  controllers: [ObjectTripsController],
  providers: [ObjectTripsService],
  exports: [ObjectTripsService],
})
export class ObjectTripsModule {}
