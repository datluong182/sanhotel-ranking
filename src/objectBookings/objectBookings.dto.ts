import { ApiProperty } from '@nestjs/swagger';

export class CreateObjectBooking {
  @ApiProperty({
    required: true,
    default:
      'https://www.booking.com/hotel/vn/o-39-gallery-classy-amp-spa.html',
  })
  url: string;
}
