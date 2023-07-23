import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { tbObjectBookings } from '@prisma/client';
import { DataList, Paging } from '../app.dto';
import { ObjectBookingsService } from './objectBookings.service';
import { CreateObjectBooking } from './objectBookings.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('object-bookings')
@Controller('object-bookings')
export class ObjectBookingsController {
  constructor(private readonly objectBookingsService: ObjectBookingsService) {}

  @Get()
  async getAllObjectBookings(@Query() query: Paging): Promise<DataList<tbObjectBookings>> {
    return await this.objectBookingsService.getAllObjectBookings(query);
  }

  @Post()
  async createObjectBooking(
    @Body() data: CreateObjectBooking,
  ): Promise<tbObjectBookings | undefined> {
    console.log('Start');
    return await this.objectBookingsService.createObjectBooking(data);
  }

  @Post('/check-manual')
  async checkManualObjectBooking(): Promise<void> {
    console.log('Start');
    await this.objectBookingsService.crawlSchedule();
  }

  @Delete(':id')
  async deleteObjectBooking(@Param('id') id: string): Promise<tbObjectBookings> {
    return await this.objectBookingsService.deleteObjectBooking(parseInt(id));
  }
}
