import { ApiProperty } from "@nestjs/swagger";
import { PLATFORM } from "@prisma/client";

export class GetObjectLogByTime {
  @ApiProperty({
    required: true,
    default: 'TRIP',
  })
  platform: PLATFORM;

  @ApiProperty({
    required: true,
    default: 'https://www.tripadvisor.com/Hotel_Review-g293924-d15662004-Reviews-San_Grand_Hotel-Hanoi.html'
  })
  url: String;

  @ApiProperty({
    required: true,
    default: '2023-06-30T17:00:00.000Z'
  })
  start: String;

  @ApiProperty({
    required: true,
    default: '2023-07-31T17:00:00.000Z'
  })
  end: String;
}