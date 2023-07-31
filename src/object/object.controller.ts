import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Delete,
  Param,
  Put,
  Patch,
} from '@nestjs/common';
import { tbObject } from '@prisma/client';
import { DataList, Paging } from '../app.dto';
import { ObjectService } from './object.service';
import { CreateObject, UpdateObjectByUrl } from './object.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('object')
@Controller('object')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Get()
  async getAllObject(@Query() query: Paging): Promise<DataList<tbObject>> {
    return await this.objectService.getAllObject(query);
  }

  @Get('/last-update')
  async getLastUpdate(): Promise<{ updatedAt: Date }> {
    return await this.objectService.getLastUpdate();
  }

  @Post()
  async createObjectTrip(
    @Body() data: CreateObject,
  ): Promise<tbObject | undefined> {
    console.log('Start');
    return await this.objectService.createObject(data);
  }

  @Patch('/update-by-url')
  async updateObjectByUrl(@Body() data: UpdateObjectByUrl): Promise<void> {
    await this.objectService.updateObjectByUrl(data);
  }

  @Post('/check-manual')
  async checkManualObject(): Promise<void> {
    console.log('Start');
    await this.objectService.crawlSchedule(false);
  }

  @Delete(':id')
  async deleteObjectTrip(@Param('id') id: string): Promise<tbObject> {
    return await this.objectService.deleteObject(id);
  }
}
