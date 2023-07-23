import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ObjectTripsModule } from './objectTrips/objectTrips.module';
import { ObjectBookingsModule } from './objectBookings/objectBookings.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, ObjectTripsModule, ObjectBookingsModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
