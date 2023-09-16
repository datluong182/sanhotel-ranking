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
