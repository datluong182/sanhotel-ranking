import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(input: Prisma.tbUserCreateInput) {
    return this.prismaService.tbUser.create({
      data: input,
    });
  }

  async findByUserName(username: string) {
    return this.prismaService.tbUser.findFirst({
      where: {
        username,
      },
    });
  }

  async findByStaffId(staffId: string) {
    return this.prismaService.tbUser.findFirst({
      where: {
        staffId,
      },
    });
  }
}
