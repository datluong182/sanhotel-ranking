import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigService } from './config.service';
// import { ObjectReviewsModule } from './objectReviews/objectReviews.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
