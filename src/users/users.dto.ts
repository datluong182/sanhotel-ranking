import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UserRegisterRequestDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  staffId: string;
}
