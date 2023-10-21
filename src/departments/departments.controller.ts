import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
} from "./departments.dto";
import { DepartmentsService } from "./departments.service";
import {
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
} from "./departments.command";

@ApiTags("Departments")
@Controller("departments")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post("")
  async create(@Body() body: CreateDepartmentRequestDto) {
    return this.departmentsService.create(
      new CreateDepartmentCommand(
        body.type,
        body.companyId,
        body.name,
        body.image,
      ),
    );
  }

  @Put(":id")
  async update(
    @Body() body: UpdateDepartmentRequestDto,
    @Param("id") id: string,
  ) {
    return this.departmentsService.update(
      new UpdateDepartmentCommand(
        id,
        body.type,
        body.companyId,
        body.name,
        body.image,
      ),
    );
  }

  @Get("")
  async getAll() {
    return this.departmentsService.getAll();
  }
}
