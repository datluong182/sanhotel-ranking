import { Injectable } from "@nestjs/common";
import { PLATFORM_RESPONSE, tbHotel } from "@prisma/client";
import { DataList, PagingDefault } from "src/app.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateHotel, UpdateHotel } from "./hotel.dto";
import _ from 'lodash';

@Injectable()
export class HotelService {
  constructor(private prismaService: PrismaService) {
    console.log('init object service');
  }

  async createHotel(data: CreateHotel): Promise<tbHotel | undefined> {
    return await this.prismaService.tbHotel.create({
      data: {
        ...data,
      }
    })
  }

  async updateHotel(data: UpdateHotel): Promise<tbHotel | undefined> {
    return await this.prismaService.tbHotel.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
      }
    })
  }

  async deleteHotel(id: string): Promise<tbHotel> {
    return await this.prismaService.tbHotel.delete({
      where: {
        id,
      },
    });
  }
  
  async getOneHotel(id: string): Promise<tbHotel | undefined> {
    return await this.prismaService.tbHotel.findFirst({
      where: {
        id,
      }
    })
  }

  async getAllHotel(query: PagingDefault): Promise<DataList<tbHotel>> {
    const count = await this.prismaService.tbHotel.count({
      where: {
        ...query.cond,
      }
    })
    const data = await this.prismaService.tbHotel.findMany({
      where: {
        ...query.cond,
      },
      take: parseInt(query.limit),
      skip: parseInt(query.page) * parseInt(query.limit),
    })
    return {
      count,
      page: query.page,
      limit: query.limit,
      data,
    };
  }
}