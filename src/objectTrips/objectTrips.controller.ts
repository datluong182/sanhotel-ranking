import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { tbObjectTrips } from '@prisma/client';
import { DataList, Paging } from '../app.dto';
import { ObjectTripsService } from './objectTrips.service';
import { CreateObjectTrip } from './objectTrips.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('object-trips')
@Controller('object-trips')
export class ObjectTripsController {
  constructor(private readonly objectTripsService: ObjectTripsService) {}

  @Get()
  async getAllObjectTrips(@Query() query: Paging): Promise<DataList<tbObjectTrips>> {
    return await this.objectTripsService.getAllObjectTrips(query);
  }

  @Post()
  async createObjectTrip(
    @Body() data: CreateObjectTrip,
  ): Promise<tbObjectTrips | undefined> {
    console.log('Start');
    return await this.objectTripsService.createObjectTrip(data);
  }

  @Post('/check-manual')
  async checkManualObjectTrip(): Promise<void> {
    console.log('Start');
    await this.objectTripsService.crawlSchedule();
  }

  @Delete(':id')
  async deleteObjectTrip(@Param('id') id: string): Promise<tbObjectTrips> {
    return await this.objectTripsService.deleteObjectTrip(parseInt(id));
  }
}
