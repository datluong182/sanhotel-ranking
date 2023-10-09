import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import {
  CreateCompanyRequestDto,
  UpdateCompanyRequestDto,
} from "./companies.dto";
import { CompaniesService } from "./companies.service";
import {
  CreateCompaniesCommand,
  UpdateCompaniesCommand,
} from "./companies.command";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() body: CreateCompanyRequestDto) {
    return this.companiesService.createCompany(
      new CreateCompaniesCommand(
        body.name,
        body.address,
        body.avatar,
        body.links,
      ),
    );
  }

  @Put(":id")
  async update(@Body() body: UpdateCompanyRequestDto, @Param("id") id: string) {
    return this.companiesService.updateCompany(
      new UpdateCompaniesCommand(
        id,
        body.name,
        body.address,
        body.avatar,
        body.links,
      ),
    );
  }

  @Get()
  async index() {
    return this.companiesService.findAll();
  }
}
