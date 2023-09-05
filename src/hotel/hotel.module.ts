import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ObjectLogModule } from 'src/object-log/objectLog.module';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), ObjectLogModule],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
