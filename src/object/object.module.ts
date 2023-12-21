import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ObjectController } from './object.controller';
import { ObjectService } from './object.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from 'src/config/config.module';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), HttpModule, ConfigModule],
  controllers: [ObjectController],
  providers: [ObjectService],
  exports: [ObjectService],
})
export class ObjectModule {}
