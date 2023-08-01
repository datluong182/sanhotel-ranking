import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectModule } from './object/object.module';
import { PrismaModule } from './prisma/prisma.module';
import { ObjectLogModule } from './object-log/objectLog.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, ObjectModule, ObjectLogModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
