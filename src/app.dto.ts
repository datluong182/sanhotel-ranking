import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class Paging {
  @ApiProperty({
    required: true,
  })
  @IsInt()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    required: true,
  })
  @IsInt()
  @Type(() => Number)
  limit: number;

  @ApiProperty({
    name: 'cond',
    type: 'object',
  })
  cond: object;
}

export class DataList<T> {
  count: number;
  page: number;
  limit: number;
  data: Array<T>;
}

