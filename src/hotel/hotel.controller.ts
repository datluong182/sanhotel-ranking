import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HotelService } from './hotel.service';
import { DataList, PagingDefault, Paging } from "src/app.dto";
import { tbHotel, tbObjectLog } from "@prisma/client";
import { CreateHotel, QueryFiveStars, UpdateHotel } from "./hotel.dto";

@ApiTags('hotel')
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}


  @Get()
  async getAllHotel(@Query() query: PagingDefault): Promise<DataList<tbHotel>> {
    return await this.hotelService.getAllHotel(query);
  }

  @Get("/five-stars")
  async getChartFiveStars(@Query() query: QueryFiveStars): Promise<{ dataDate: string[]; data: { name: string; data: number[] }[] }> {
    return await this.hotelService.getChartFiveStars(query);
  }

  @Get(":id")
  async getOneHotel(@Param('id') id: string): Promise<tbHotel | undefined> {
    return await this.hotelService.getOneHotel(id);
  }

  @Post()
  async createHotel(
    @Body() data: CreateHotel,
  ): Promise<tbHotel | undefined> {
    console.log('Start');
    return await this.hotelService.createHotel(data);
  }

  @Put()
  async updateHotel(
    @Body() data: UpdateHotel,
  ): Promise<tbHotel | undefined> {
    console.log('Start');
    return await this.hotelService.updateHotel(data);
  }

  @Delete(':id')
  async deleteHotel(@Param('id') id: string): Promise<tbHotel> {
    return await this.hotelService.deleteHotel(id);
  }
}