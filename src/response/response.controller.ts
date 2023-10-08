import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ResponseService } from "./response.service";
import { DataList, Paging } from "src/app.dto";
import { tbResponse } from "@prisma/client";
import {
  CreateResponse,
  UpdateResponse,
  UpdateResponses,
} from "./response.dto";

@ApiTags("response")
@Controller("response")
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Get()
  async getAllResponse(@Query() query: Paging): Promise<DataList<tbResponse>> {
    return await this.responseService.getAllResponse(query);
  }

  @Post()
  async createResponse(
    @Body() data: CreateResponse,
  ): Promise<tbResponse | undefined> {
    console.log("Start");
    return await this.responseService.createResponse(data);
  }

  @Put()
  async updateResponse(
    @Body() data: UpdateResponse,
  ): Promise<tbResponse | undefined> {
    console.log("Start");
    return await this.responseService.updateResponse(data);
  }

  @Put("/many")
  async updateResponses(@Body() data: UpdateResponses): Promise<void> {
    console.log("Start");
    await this.responseService.updateResponses(data);
  }

  @Delete(":id")
  async deleteObjectTrip(@Param("id") id: string): Promise<tbResponse> {
    return await this.responseService.deleteResponse(id);
  }
}
