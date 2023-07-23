import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ObjectBookingsController } from './objectBookings.controller';
import { ObjectBookingsService } from './objectBookings.service';
import { PrismaModule } from '../prisma/prisma.module';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [ObjectBookingsController],
  providers: [ObjectBookingsService],
  exports: [ObjectBookingsService],
})
export class ObjectBookingsModule {}
