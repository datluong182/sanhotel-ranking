import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { tbObjectTrips } from '@prisma/client';
import { Paging } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
