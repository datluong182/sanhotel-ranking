import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ObjectTripsModule } from './objectTrips/objectTrips.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, ObjectTripsModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
