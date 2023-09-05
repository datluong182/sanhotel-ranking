import { ApiProperty } from "@nestjs/swagger";
import { PLATFORM } from "@prisma/client";

export class CreateReview {
  @ApiProperty({
    required: true,
  })
  tbHotelId: string;
  @ApiProperty({
    required: true,
  })
  username: string;
  @ApiProperty({
    required: true,
  })
  title?: string;
  @ApiProperty({
    required: true,
  })
  content: string[];
  @ApiProperty({
    required: true,
  })
  extra: object
  @ApiProperty({
    required: true,
  })
  createdAt: object
  @ApiProperty({
    required: true,
  })
  platform: PLATFORM
}

export class UpdateReview extends CreateReview {
  @ApiProperty({
    required: true,
  })
  id: string;
}