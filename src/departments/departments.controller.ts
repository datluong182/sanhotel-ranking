import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Post } from "@nestjs/common";
import { CreateDepartmentRequestDto } from "./departments.dto";

@ApiTags("Departments")
@Controller("departments")
export class DepartmentsController {
  @Post("")
  async create(@Body() body: CreateDepartmentRequestDto) {
    return null;
  }
}
