import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), HttpModule, ConfigModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
