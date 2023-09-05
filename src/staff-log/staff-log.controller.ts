import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { StaffLogService } from './staff-log.service';
import { DataList, PagingDefault, Paging } from "src/app.dto";
import { tbStaff, tbStaffLog } from "@prisma/client";
import { GetStaffLogByTime } from "./staff-log.dto";

@ApiTags('staff-log')
@Controller('staff-log')
export class StaffLogController {
  constructor(private readonly staffLogService: StaffLogService) {}

  @Get()
  async getAllStaffLog(
    @Query() query: GetStaffLogByTime,
  ): Promise<{ count: number; data: tbStaffLog[] }> {
    return await this.staffLogService.getAllStaffLog(query);
  }
}