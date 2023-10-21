import { Body, Controller, Header, Headers, Post } from "@nestjs/common";
import { AddPointForStaffDto, AddPointRequestDto } from "./staff-points.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { StaffPointService } from "./staff-point.service";
import { RolesGuard } from "../auth/auth.guard";

@ApiTags("Point")
@Controller("point")
export class StaffPointController {
  constructor(private readonly staffPointService: StaffPointService) {}

  @ApiBearerAuth()
  @Post("add")
  @RolesGuard.hasRoles("ADMIN")
  async addPointForStaff(
    @Body() body: AddPointRequestDto,
    @Headers("user-id") userId: string,
  ) {
    await this.staffPointService.addPointForStaff(body.infos, userId);
  }
}
