import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), HttpModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
