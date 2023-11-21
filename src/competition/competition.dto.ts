import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
}

export class QueryCompetitionOTA {
  @ApiProperty({
    required: true,
    isArray: true,
    type: String,
    name: 'tbHotelId',
  })
  tbHotelIds: string[];
  @ApiProperty({
    required: true,
    isArray: true,
    type: PLATFORM,
    name: 'platforms',
  })
  platforms: PLATFORM[];
  @ApiProperty({
    required: true,
    name: 'month',
  })
  month: string;
  @ApiProperty({
    required: true,
    name: 'year',
  })
  year: string;
}

export class CompetitionOTA {
  @ApiProperty({
    required: true,
  })
  id: string;
  @ApiProperty({
    name: 'data',
    type: 'object',
    default: {},
  })
  data: {
    [key: string]: any;
  };
}

export class CalCompetition {
  @ApiPropertyOptional({})
  month?: string;
  @ApiPropertyOptional({})
  year?: string;
}

export class CalCompetitionOTA {
  @ApiPropertyOptional({})
  month?: string;
  @ApiPropertyOptional({})
  year?: string;
}

export class UpdateCompetitionOTA {
  @ApiProperty({
    required: true,
  })
  id: string;
  @ApiProperty({
    name: 'data',
    type: 'object',
    default: {},
  })
  data: {
    [key: string]: any;
  };
}
