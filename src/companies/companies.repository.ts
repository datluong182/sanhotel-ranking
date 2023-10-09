import { Company } from "./companies.entity";
import { PrismaService } from "../prisma/prisma.service";
import { assignWith } from "lodash";

export class CompaniesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private dbToInterface(tbCompany: any): Company {
    return {
      id: tbCompany.id,
      name: tbCompany.name,
      address: tbCompany.address,
      avatar: tbCompany.avatar,
      links: tbCompany.links ? tbCompany.links.split(",") : null,
    };
  }

  async create(company: Company): Promise<Company> {
    const result = await this.prismaService.tbCompany.create({
      data: {
        ...company,
        links: company.links ? company.links.join(",") : null,
      },
    });
    return this.dbToInterface(result);
  }

  async findById(id: string): Promise<Company | null> {
    const result = await this.prismaService.tbCompany.findFirst({
      where: {
        id,
      },
    });
    return !!result ? this.dbToInterface(result) : null;
  }

  async updateById(id: string, company: Company): Promise<Company> {
    const result = await this.prismaService.tbCompany.update({
      where: {
        id,
      },
      data: {
        ...company,
        ...(company.links
          ? {
              links: company.links.join(","),
            }
          : {
              links: undefined,
            }),
      },
    });
    return this.dbToInterface(result);
  }

  async findAll() {
    const results = await this.prismaService.tbCompany.findMany({});
    return results.map((result) => this.dbToInterface(result));
  }
}
