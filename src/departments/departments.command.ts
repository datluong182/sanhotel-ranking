import { DepartmentType } from "./departments.enum";

export class CreateDepartmentCommand {
  constructor(
    public readonly type: DepartmentType,
    public readonly companyId: string,
    public readonly name: string,
    public readonly image: string,
  ) {}
}

export class UpdateDepartmentCommand {
  constructor(
    public readonly id: string,
    public readonly type: DepartmentType,
    public readonly companyId: string,
    public readonly name: string,
    public readonly image: string,
  ) {}
}
