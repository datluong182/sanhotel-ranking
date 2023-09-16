import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PLATFORM } from '@prisma/client';

export class PagingDefault {
  @ApiProperty({
    required: true,
    default: '0',
  })
  page: string;

  @ApiProperty({
    required: true,
    default: '10',
  })
  limit: string;

  @ApiProperty({
    name: 'cond',
    type: 'object',
    default: {},
  })
  cond: object;
}

export class Paging extends PagingDefault {
  @ApiProperty({
    required: true,
    default: 'TRIP',
  })
  @IsString()
  platform: PLATFORM;
}

export class DataList<T> {
  count: number;
  page: string;
  limit: string;
  data: Array<T>;
}
