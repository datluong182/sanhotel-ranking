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
import {
  CreateLastUpdate,
  CreateObject,
  GetLastUpdate,
  UpdateObjectByUrl,
} from './object.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('object')
@Controller('object')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Get()
  async getAllObject(@Query() query: Paging): Promise<DataList<tbObject>> {
    return await this.objectService.getAllObject(query);
  }

  @Get('/one/:id')
  async getOneObject(@Param('id') id: string): Promise<{ data: tbObject }> {
    return await this.objectService.getOneObject(id);
  }

  @Get('/last-update')
  async getLastUpdate(
    @Query() query: GetLastUpdate,
  ): Promise<{ updatedAt: Date }> {
    return await this.objectService.getLastUpdate(query);
  }

  @Post('/last-update')
  async createLastUpdate(@Body() data: CreateLastUpdate): Promise<void> {
    return await this.objectService.createLastUpdate(
      data.date,
      data.platform,
      data.isManual,
    );
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

  @Post('/check-manual/test')
  async checkManualObjectTest(): Promise<void> {
    console.log('Start');
    await this.objectService.crawlSchedule(true);
  }

  @Delete(':id')
  async deleteObjectTrip(@Param('id') id: string): Promise<tbObject> {
    return await this.objectService.deleteObject(id);
  }
}
