import { Body, Controller, Header, Headers, Post } from "@nestjs/common";
import { AddPointForStaffDto, AddPointRequestDto } from "./staff-points.dto";
import { ApiTags } from "@nestjs/swagger";
import { StaffPointService } from "./staff-point.service";

@ApiTags("Point")
@Controller("point")
export class StaffPointController {
    constructor(
        private readonly staffPointService: StaffPointService,
    ) {
        
    }

    @Post("add")
    async addPointForStaff(
        @Body() body: AddPointRequestDto,
        @Headers("user-id") userId: string,
    ) {
        await this.staffPointService.addPointForStaff(body.infos, userId)
    }
}