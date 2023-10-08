import { ApiProperty } from "@nestjs/swagger";
import { PLATFORM_RESPONSE } from "@prisma/client";

export class CreateResponse {
  @ApiProperty({
    required: true,
  })
  name: string;
  @ApiProperty({
    required: true,
    default: 0,
  })
  value: number;
  @ApiProperty({
    required: true,
  })
  color: string;
  @ApiProperty({
    required: true,
    default: "HUBSPOT",
  })
  platform: PLATFORM_RESPONSE;
}

export class UpdateResponses {
  response: UpdateResponse[];
}

export class UpdateResponse {
  @ApiProperty({
    required: true,
  })
  id: string;
  @ApiProperty({})
  name: string;
  @ApiProperty({
    default: 0,
  })
  value: number;
  @ApiProperty({})
  color: string;
  @ApiProperty({
    default: "HUBSPOT",
  })
  platform: PLATFORM_RESPONSE;
}
