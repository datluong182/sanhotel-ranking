import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { CreateCompanyRequestDto } from "./companies.dto";

@Controller("companies")
export class CompaniesController {

  @Post()
  async create(
    @Body() body: CreateCompanyRequestDto,
  ) {

  }

  @Put()
  async update() {

  }

  @Get()
  async index() {

  }
}