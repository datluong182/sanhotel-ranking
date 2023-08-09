import { ApiProperty } from '@nestjs/swagger';
import { PLATFORM } from '@prisma/client';

export class GetObjectLogByTime {
  @ApiProperty({
    default: 'TRIP',
  })
  platform: PLATFORM;

  @ApiProperty({
    default:
      'https://www.tripadvisor.com/Hotel_Review-g293924-d15662004-Reviews-San_Grand_Hotel-Hanoi.html',
  })
  url: string;

  @ApiProperty({
    default: '2023-06-30',
  })
  start: string;

  @ApiProperty({
    default: '2023-08-01',
  })
  end: string;
}

export class GetNewsfeedByTime {
  @ApiProperty({
    default: 'TRIP',
  })
  platform: PLATFORM;

  @ApiProperty({
    default:
      'https://www.tripadvisor.com/Hotel_Review-g293924-d15662004-Reviews-San_Grand_Hotel-Hanoi.html',
  })
  url: string;

  @ApiProperty({
    default: '2023-06-30',
  })
  start: string;

  @ApiProperty({
    default: '2023-08-01',
  })
  end: string;

  @ApiProperty({
    default: "0",
    required: true,
  })
  page: string;

   @ApiProperty({
    default: "10",
    required: true,
  })
  limit: string;
}
