import { ApiProperty } from '@nestjs/swagger';

export class CreateObjectTrip {
  @ApiProperty({
    required: true,
    default:
       'https://www.tripadvisor.com/Hotel_Review-g293924-d15662004-Reviews-San_Grand_Hotel-Hanoi.html',
  })
  url: string;
}
