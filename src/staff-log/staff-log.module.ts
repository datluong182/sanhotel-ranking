import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StaffLogController } from './staff-log.controller';
import { StaffLogService } from './staff-log.service';
import { PrismaModule } from '../prisma/prisma.module';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [StaffLogController],
  providers: [StaffLogService],
  exports: [StaffLogService],
})
export class StaffLogModule {}
