import { PrismaService } from "../prisma/prisma.service";

export class DepartmentsRepository {
  constructor(
    private readonly prismaService: PrismaService,
  ) {
  }

  

}