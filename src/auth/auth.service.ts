import { UsersRepository } from "src/users/users.repository";
import { LoginCommand } from "./auth.command";
import { LoginResponseDto } from "./auth.dto";
import { isNull } from "lodash";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { compair } from "src/users/user.helper";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  private readonly secret: string;
  private readonly expiresIn: number;

  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = Number(process.env.EXPIRES_IN);
  }

  async login(cmd: LoginCommand): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByUserName(cmd.username);
    if (isNull(user)) {
      throw new NotFoundException("username not found!");
    }
    if (!(await compair(cmd.password, user.password))) {
      throw new BadRequestException("Password not match!");
    }
    if (!user.enabled) {
      throw new BadRequestException("User not enabled!");
    }
    const payload = {
      sub: user.username,
      staffId: user.staffId,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.secret,
        expiresIn: this.expiresIn,
      }),
    };
  }
}
