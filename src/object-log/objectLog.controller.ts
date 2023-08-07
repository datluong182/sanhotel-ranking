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
import { tbObjectLog } from '@prisma/client';
import { DataList, Paging } from '../app.dto';
import { ObjectLogService } from './objectLog.service';
import { ApiTags } from '@nestjs/swagger';
import { GetObjectLogByTime } from './objectLog.dto';

@ApiTags('object-log')
@Controller('object-log')
export class ObjectLogController {
  constructor(private readonly objectService: ObjectLogService) {}

  @Get()
  async getAllObjectLog(
    @Query() query: GetObjectLogByTime,
  ): Promise<{ count: number; data: tbObjectLog[] }> {
    return await this.objectService.getAllObjectLog(query);
  }

  @Get('/newsfeed')
  async getAllNewsfeed(
    @Query() query: GetObjectLogByTime,
  ): Promise<{ count: number; data: tbObjectLog[] }> {
    return await this.objectService.getAllNewsfeed(query);
  }
}
