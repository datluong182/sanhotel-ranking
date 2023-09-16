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
import { ReviewService } from './review.service';
import { DataList, PagingDefault, Paging } from 'src/app.dto';
import { tbHotel, tbLastUpdateReview, tbReview } from '@prisma/client';
import { CreateReview, UpdateReview } from './review.dto';
import { NewReview } from './review.entity';

@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async getAllReview(@Query() query: Paging): Promise<DataList<tbReview>> {
    return await this.reviewService.getAllReview(query);
  }

  @Get('/check-manual')
  async crawlReview(): Promise<{
    newReview: NewReview;
    month: number;
    year: number;
  }> {
    return await this.reviewService.crawlSchedule();
  }

  @Get('/last-updated')
  async getLastUpdatedReview(): Promise<tbLastUpdateReview> {
    return await this.reviewService.getLastUpdatedReview();
  }

  // @Get(":id")
  // async getOneReview(@Param('id') id: string): Promise<tbHotel | undefined> {
  //   return await this.reviewService.getOneHotel(id);
  // }

  // @Post()
  // async createReview(
  //   @Body() data: CreateReview,
  // ): Promise<tbHotel | undefined> {
  //   console.log('Start');
  //   return await this.reviewService.createReview(data);
  // }

  // @Put()
  // async updateReview(
  //   @Body() data: UpdateReview,
  // ): Promise<tbHotel | undefined> {
  //   console.log('Start');
  //   return await this.reviewService.updateReview(data);
  // }

  // @Delete(':id')
  // async deleteReview(@Param('id') id: string): Promise<tbHotel> {
  //   return await this.reviewService.deleteReview(id);
  // }
}
