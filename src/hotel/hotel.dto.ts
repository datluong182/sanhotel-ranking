import { ApiProperty } from "@nestjs/swagger";

export class CreateHotel {
  @ApiProperty({
    required: true,
    default: 'San Grand Hotel'
  })
  name: string;
  @ApiProperty({
    required: true,
    default: 'No.02 Cau Go Alley Hoan Kiem, Hanoi'
  })
  address: string;
  @ApiProperty({
  })
  avatar?: string;
  @ApiProperty({
    required: true,
    default: 'Nguyen Van A'
  })
  gm: string;
  @ApiProperty({
    required: true,
   
  })
  links: { [key: string]: string };
}

export class UpdateHotel extends CreateHotel {
  @ApiProperty({
    required: true,
  })
  id: string;
}