import { ApiProperty } from '@nestjs/swagger';
import { PLATFORM, TYPE_HOTEL } from '@prisma/client';

export class CreateHotel {
  @ApiProperty({
    required: true,
    default: 'San Grand Hotel',
  })
  name: string;
  @ApiProperty({
    required: true,
    default: 'No.02 Cau Go Alley Hoan Kiem, Hanoi',
  })
  address: string;
  @ApiProperty({})
  avatar?: string;
  @ApiProperty({
    required: true,
    default: 'Nguyen Van A',
  })
  gm: string;
  @ApiProperty({
    required: true,
  })
  links: { [key: string]: string };
  @ApiProperty({
    required: true,
    default: 'ALLY',
  })
  type: TYPE_HOTEL;
  @ApiProperty({
    required: true,
    default: false,
  })
  disable: boolean;
}

export class UpdateHotel extends CreateHotel {
  @ApiProperty({
    required: true,
  })
  id: string;
}

export class QueryFiveStars {
  @ApiProperty({
    required: true,
    default: 'TRIP',
  })
  platform: PLATFORM;
  @ApiProperty({
    required: true,
    default: '2023-08-20',
  })
  start: string;
  @ApiProperty({
    required: true,
    default: '2023-08-28',
  })
  end: string;
}
