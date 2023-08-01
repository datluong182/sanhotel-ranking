import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ObjectLogController } from './objectLog.controller';
import { ObjectLogService } from './objectLog.service';
import { PrismaModule } from '../prisma/prisma.module';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [ObjectLogController],
  providers: [ObjectLogService],
  exports: [ObjectLogService],
})
export class ObjectLogModule {}
