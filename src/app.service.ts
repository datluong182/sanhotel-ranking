import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from "nestjs-pino";
@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService,
      private readonly logger: Logger) {
        this.logger.warn("App started")
  }
}
