import { has, isNull } from "lodash";
import { hash } from "./user.helper";
import { RegisterUserCommand } from "./users.command";
import { UsersRepository } from "./users.repository";
import { BadRequestException, Injectable } from "@nestjs/common";
import { StaffRepository } from "src/staff/staff.repository";

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly staffRepository: StaffRepository,
  ) {}

  async registerUser(cmd: RegisterUserCommand) {
    const hashed = await hash(cmd.password);
    const userByUsername = await this.userRepository.findByUserName(
      cmd.username,
    );
    const userByStaffId = await this.userRepository.findByStaffId(cmd.staffId);
    if (!isNull(userByUsername) || !isNull(userByStaffId)) {
      throw new BadRequestException("Username or staffId existed");
    }
    const staff = this.staffRepository.findFirstStaffByStaffId(cmd.staffId);
    if (!staff) {
      throw new BadRequestException("StaffId not existed!");
    }
    const result = await this.userRepository.createUser({
      username: cmd.username,
      password: hashed,
      staffId: cmd.staffId,
      enabled: cmd.enabled,
      updatedAt: cmd.executionTime,
      createdAt: cmd.executionTime,
    });
    delete result.password;
    return result;
  }
}
