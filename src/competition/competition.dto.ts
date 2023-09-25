import { ApiProperty } from '@nestjs/swagger';
import { PLATFORM } from '@prisma/client';

export class QueryCompetition {
  @ApiProperty({
    required: true,
    default: '9',
  })
  month: string;
  @ApiProperty({
    required: true,
    default: '2023',
  })
  year: string;
  @ApiProperty({
    required: true,
    default: PLATFORM.TRIP,
  })
  platform: PLATFORM;
  @ApiProperty({
    required: true,
  })
  tbHotelId: PLATFORM;
}

export class QueryAllCompetition {
  @ApiProperty({
    required: true,
    default: PLATFORM.TRIP,
  })
  platform: PLATFORM;
  @ApiProperty({
    required: true,
    default: '9',
  })
  month: string;
  @ApiProperty({
    required: true,
    default: '2023',
  })
  year: string;
}

export class UpdateExtraCompetition {
  @ApiProperty({
    required: true,
  })
  month: number;
  @ApiProperty({
    required: true,
  })
  year: number;
  @ApiProperty({
    required: true,
  })
  platform: PLATFORM;
  @ApiProperty({
    required: true,
  })
  tbHotelId: string;
  @ApiProperty({
    required: true,
  })
  checkoutInMonth: number;
  @ApiProperty({
    required: true,
  })
  ratioInMonth: number;
}
