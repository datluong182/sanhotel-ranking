import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CompetitionController } from './competition.controller';
import { CompetitionService } from './competition.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewModule } from 'src/review/review.module';
import { ObjectModule } from 'src/object/object.module';
import { HttpModule } from '@nestjs/axios';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    ReviewModule,
    ObjectModule,
    HttpModule,
  ],
  controllers: [CompetitionController],
  providers: [CompetitionService],
  exports: [CompetitionService],
})
export class CompetitionModule {}
