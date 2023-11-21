import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { DataList, PagingDefault, Paging } from 'src/app.dto';
import { tbReview, tbStaff } from '@prisma/client';
import {
  CreateStaff,
  QueryRankingStaff,
  QueryRankByDayStaff,
  RankingStaff,
  RankingStaffHotel,
  UpdateStaff,
} from './staff.dto';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async getAllStaff(@Query() query: PagingDefault): Promise<DataList<tbStaff>> {
    return await this.staffService.getAllStaff(query);
  }

  @Post('/chart-review-by-day')
  async reviewsByDayStaff(
    @Body() data: QueryRankByDayStaff
  ): Promise<tbReview[]> {
    return await this.staffService.reviewsByDayStaff(data);
  }

  @Post('/chart-ranking-by-day')
  async rankingByDayStaff(
    @Body() data: QueryRankByDayStaff
  ): Promise<{ day: string; value: number }[]> {
    return await this.staffService.rankingByDay(data);
  }

  @Get('/ranking')
  async getRanking(
    @Query() query: QueryRankingStaff
  ): Promise<{ count: number; data: RankingStaff[] }> {
    return await this.staffService.getRanking(query);
  }
  @Get('/ranking-hotel')
  async getRankingHotel(
    @Query() query: QueryRankingStaff
  ): Promise<{ count: number; data: RankingStaffHotel[] }> {
    return await this.staffService.getRankingHotel(query);
  }

  @Get('/ranking-hotel/bad-review')
  async getRankingHotelBadReview(
    @Query() query: QueryRankingStaff
  ): Promise<{ count: number; data: RankingStaffHotel[] }> {
    return await this.staffService.getRankingHotelBadReview(query);
  }

  @Get(':id')
  async getOneHotel(@Param('id') id: string): Promise<tbStaff | undefined> {
    return await this.staffService.getOneStaff(id);
  }

  @Post()
  async createStaff(@Body() data: CreateStaff): Promise<tbStaff | undefined> {
    console.log('Start');
    return await this.staffService.createStaff(data);
  }

  @Put()
  async updateStaff(@Body() data: UpdateStaff): Promise<tbStaff | undefined> {
    console.log('Start');
    return await this.staffService.updateStaff(data);
  }

  @Delete(':id')
  async deleteStaff(@Param('id') id: string): Promise<tbStaff> {
    return await this.staffService.deleteStaff(id);
  }
}
