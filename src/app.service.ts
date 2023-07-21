import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Paging } from './app.dto';
import { tbObjectTrips } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {
    console.log('init app service');
  }
}
