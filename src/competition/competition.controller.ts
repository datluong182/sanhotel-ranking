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
import { CompetitionService } from "./competition.service";
import { DataList, PagingDefault, Paging } from "src/app.dto";
import { tbCompetition, tbHotel, tbObjectLog } from "@prisma/client";
import {
  QueryAllCompetition,
  QueryCompetition,
  UpdateExtraCompetition,
} from "./competition.dto";

@ApiTags("competition")
@Controller("competition")
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get()
  async getCompetition(
    @Query() query: QueryCompetition,
  ): Promise<tbCompetition | undefined> {
    return await this.competitionService.getCompetition(query);
  }

  @Put("/extra")
  async updateExtra(@Body() data: UpdateExtraCompetition) {
    await this.competitionService.updateExtra(data);
  }

  @Get("/all")
  async getAllCompetition(
    @Query() query: QueryAllCompetition,
  ): Promise<tbCompetition[]> {
    return await this.competitionService.getAllCompetition(query);
  }

  @Get("/check-manual")
  async checkManual(): Promise<any> {
    return await this.competitionService.updateCompetition();
  }
}
