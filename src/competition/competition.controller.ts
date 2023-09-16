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
import { tbCompetition, tbHotel, tbObjectLog } from '@prisma/client';
import { QueryCompetition } from './competition.dto';

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

  @Get('/check-manual')
  async checkManual(): Promise<void> {
    await this.competitionService.updateCompetition();
  }
}
