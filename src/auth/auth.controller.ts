import { Body, Controller, Post } from "@nestjs/common";
import { LoginRequestDto } from "./auth.dto";
import { AuthService } from "./auth.service";
import { LoginCommand } from "./auth.command";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Auths")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginRequestDto) {
    return this.authService.login(
      new LoginCommand(body.username, body.password),
    );
  }
}
