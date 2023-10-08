import { Injectable } from "@nestjs/common";
import { PLATFORM_RESPONSE, tbResponse } from "@prisma/client";
import { DataList, Paging } from "src/app.dto";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateResponse,
  UpdateResponse,
  UpdateResponses,
} from "./response.dto";
import _ from "lodash";

@Injectable()
export class ResponseService {
  constructor(private prismaService: PrismaService) {
    console.log("init object service");
  }

  async createResponse(data: CreateResponse): Promise<tbResponse | undefined> {
    return await this.prismaService.tbResponse.create({
      data: {
        name: data.name,
        value: data.value,
        color: data.color,
        platform: data.platform,
      },
    });
  }

  async updateResponses(data: UpdateResponses): Promise<void> {
    console.log(data);
    for (let i = 0; i < data.response.length; i++) {
      console.log(data.response[i]);
      await this.updateResponse(data.response[i]);
    }
  }

  async updateResponse(data: UpdateResponse): Promise<tbResponse | undefined> {
    return await this.prismaService.tbResponse.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.platform !== undefined && { platform: data.platform }),
      },
    });
  }

  async deleteResponse(id: string): Promise<tbResponse> {
    return await this.prismaService.tbResponse.delete({
      where: {
        id,
      },
    });
  }

  async getAllResponse(query: Paging): Promise<DataList<tbResponse>> {
    const count = await this.prismaService.tbResponse.count({
      where: {
        ...query.cond,
        platform: query.platform as PLATFORM_RESPONSE,
      },
    });
    const data = await this.prismaService.tbResponse.findMany({
      where: {
        ...query.cond,
        platform: query.platform as PLATFORM_RESPONSE,
      },
      take: parseInt(query.limit),
      skip: parseInt(query.page) * parseInt(query.limit),
    });
    return {
      count,
      page: query.page,
      limit: query.limit,
      data,
    };
  }
}
