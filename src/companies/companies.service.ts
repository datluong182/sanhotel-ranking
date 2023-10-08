import { Injectable } from "@nestjs/common";
import { CreateCompaniesCommand } from "./companies.command";
import { CompaniesRepository } from "./companies.repository";

@Injectable()
export class CompaniesService {

  constructor(
    private readonly companiesRepository: CompaniesRepository,
  ) {
  }
  async createCompany(cmd: CreateCompaniesCommand) {
    return this.companiesRepository.create({
      name: cmd.name,
      address: cmd.address,
      avatar: cmd.avatar,
      links: cmd.links,
    });
  }
}