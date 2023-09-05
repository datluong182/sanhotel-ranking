import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PLATFORM } from "@prisma/client";

export class GetStaffLogByTime {
  @ApiProperty({
    required: true,
  })
  tbHotelId: string;

  @ApiPropertyOptional({

  })
  staffId?: string;

  @ApiProperty({
    default: '2023-07-30',
  })
  start?: string;

  @ApiProperty({
    default: '2023-08-30',
  })
  end?: string;
}