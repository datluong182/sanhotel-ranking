import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserRegisterRequestDto } from "./users.dto";
import { UsersService } from "./users.service";
import { RegisterUserCommand } from "./users.command";
import { ApiTags } from "@nestjs/swagger";
import { StaffRepository } from "src/staff/staff.repository";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post("register")
  async register(@Body() body: UserRegisterRequestDto) {
    return this.userService.registerUser(
      new RegisterUserCommand(
        body.username,
        body.password,
        body.staffId,
        false,
        new Date(),
      ),
    );
  }

  @Get("my")
  async getMy() {}
}
