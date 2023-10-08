import { DepartmentType } from "./departments.enum";

export class CreateDepartmentRequestDto {
  type: DepartmentType;
  companyId: string;
  name: string;
  image: string;
}
