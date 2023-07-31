import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class Paging {
  @ApiProperty({
    required: true,
    default: 'TRIP',
  })
  @IsString()
  platform: string;

  @ApiProperty({
    required: true,
    default: 0,
  })
  @IsInt()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    required: true,
    default: 10,
  })
  @IsInt()
  @Type(() => Number)
  limit: number;

  @ApiProperty({
    name: 'cond',
    type: 'object',
    default: {},
  })
  cond: object;
}

export class DataList<T> {
  count: number;
  page: number;
  limit: number;
  data: Array<T>;
}
