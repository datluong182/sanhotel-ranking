import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { tbObjectTrips } from '@prisma/client';
import { Paging } from '../app.dto';
import { ObjectTripsService } from './objectTrips.service';
import { CreateObjectTrip } from './objectTrips.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('object-trips')
@Controller('object-trips')
export class ObjectTripsController {
  constructor(private readonly objectTripsService: ObjectTripsService) {}

  @Get()
  async getAllObjectTrips(@Query() query: Paging): Promise<tbObjectTrips[]> {
    return await this.objectTripsService.getAllObjectTrips(query);
  }

  @Post()
  async createObjectTrip(
    @Body() data: CreateObjectTrip,
  ): Promise<tbObjectTrips | undefined> {
    console.log('Start');
    return await this.objectTripsService.createObjectTrip(data);
  }
}
