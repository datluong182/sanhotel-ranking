import { Injectable } from "@nestjs/common";
import {
  CreateCompaniesCommand,
  UpdateCompaniesCommand,
} from "./companies.command";
import { CompaniesRepository } from "./companies.repository";
import { Company } from "./companies.entity";

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}
  async createCompany(cmd: CreateCompaniesCommand) {
    return this.companiesRepository.create({
      name: cmd.name,
      address: cmd.address,
      avatar: cmd.avatar,
      links: cmd.links,
    });
  }

  async updateCompany(cmd: UpdateCompaniesCommand) {
    const company = await this.companiesRepository.findById(cmd.id);
    return this.companiesRepository.updateById(cmd.id, {
      ...company,
      ...cmd,
    });
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.findAll();
  }
}
