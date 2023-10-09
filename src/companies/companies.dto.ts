import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyRequestDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  address: string;
  @ApiProperty()
  avatar: string;
  @ApiProperty({
    isArray: true,
    type: String,
  })
  links: string[];
}

export class UpdateCompanyRequestDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  address: string;
  @ApiProperty()
  avatar: string;
  @ApiProperty({
    isArray: true,
    type: String,
  })
  links: string[];
}
