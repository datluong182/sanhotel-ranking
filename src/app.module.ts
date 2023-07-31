import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectModule } from './object/object.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, ObjectModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
