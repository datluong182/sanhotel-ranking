import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ObjectController } from './object.controller';
import { ObjectService } from './object.service';
import { PrismaModule } from '../prisma/prisma.module';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [ObjectController],
  providers: [ObjectService],
  exports: [ObjectService],
})
export class ObjectModule {}
