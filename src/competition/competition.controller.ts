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
import { CompetitionService } from './competition.service';
import { DataList, PagingDefault, Paging } from 'src/app.dto';
import {
  tbCompetition,
  tbCompetitionOTA,
  tbHotel,
  tbObjectLog,
} from '@prisma/client';
import {
  QueryAllCompetition,
  QueryCompetition,
  QueryCompetitionOTA,
  UpdateCompetitionOTA,
  UpdateExtraCompetition,
} from './competition.dto';
import { CompetitionOTA } from './competition.entity';

@ApiTags('competition')
@Controller('competition')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get()
  async getCompetition(
    @Query() query: QueryCompetition,
  ): Promise<tbCompetition | undefined> {
    return await this.competitionService.getCompetition(query);
  }

  @Get('/all')
  async getAllCompetition(
    @Query() query: QueryAllCompetition,
  ): Promise<tbCompetition[]> {
    return await this.competitionService.getAllCompetition(query);
  }

  @Put('/ota-review')
  async updateCompetitionReviewOta(): Promise<void> {
    await this.competitionService.updateCompetitionReviewOta();
  }

  @Put('/ota-review/update-property')
  async updatePropertyCompetitionReviewOta(
    @Body() data: UpdateCompetitionOTA,
  ): Promise<void> {
    await this.competitionService.updatePropertyCompetitionOTA(data);
  }

  @Put('/ota-review/update-property/many')
  async updatePropertyManyCompetitionReviewOta(
    @Body() data: UpdateCompetitionOTA[],
  ): Promise<void> {
    await this.competitionService.updatePropertyManyCompetitionOTA(data);
  }

  @Get('/ota-review')
  async getCompetitionReviewOta(
    @Query() query: QueryCompetitionOTA,
  ): Promise<CompetitionOTA[]> {
    return await this.competitionService.getCompetitionReviewOta(query);
  }

  @Get('/check-manual')
  async checkManual(): Promise<any> {
    return await this.competitionService.updateCompetition();
  }
}
