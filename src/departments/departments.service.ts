import { Injectable } from "@nestjs/common";
import {
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
} from "./departments.command";
import { DepartmentsRepository } from "./departments.repository";

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly departmentsRepository: DepartmentsRepository,
  ) {}

  async create(cmd: CreateDepartmentCommand) {
    return this.
  }

  async update(cmd: UpdateDepartmentCommand) {

  }

  async getAll() {}
}
