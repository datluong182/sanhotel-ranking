import { ApiProperty } from "@nestjs/swagger";
import { PLATFORM } from "@prisma/client";

export class CreateObject {
  @ApiProperty({
    required: true,
    default:
      "https://www.tripadvisor.com/Hotel_Review-g293924-d15662004-Reviews-San_Grand_Hotel-Hanoi.html",
  })
  url: string;
  @ApiProperty({
    required: true,
    default: "TRIP",
  })
  platform: PLATFORM;
  @ApiProperty({
    required: true,
  })
  tbHotelId: string;
}

export class UpdateObjectResponse {
  @ApiProperty({
    required: true,
  })
  id: string;
  @ApiProperty({
    required: true,
  })
  value: number;
  @ApiProperty({
    required: true,
  })
  color: string;
}

export class UpdateManyObjectResponse {
  data: Array<{
    id: string;
    value: number;
    color: string;
  }>;
}

export class GetLastUpdate {
  @ApiProperty({
    required: true,
    default: "TRIP",
  })
  platform: PLATFORM;
}

export class CreateLastUpdate {
  @ApiProperty({
    required: true,
    default: "2023-07-31 23:00:00",
  })
  date: string;

  @ApiProperty({
    required: true,
    default: "TRIP",
  })
  platform: PLATFORM;

  @ApiProperty({
    required: true,
    default: true,
  })
  isManual: boolean;
}

export class UpdateObjectByUrl {
  @ApiProperty({
    required: true,
    default:
      "https://www.tripadvisor.com/Hotel_Review-g293924-d15662004-Reviews-San_Grand_Hotel-Hanoi.html",
  })
  url: string;

  @ApiProperty({
    required: true,
  })
  name: string;

  @ApiProperty({
    required: true,
  })
  score: number;

  @ApiProperty({
    required: true,
  })
  numberScoreReview: number[];

  @ApiProperty({
    required: true,
  })
  extra: {
    rank: number;
    totalHotel: number;
  };

  @ApiProperty({
    required: true,
  })
  updatedAt: string;

  @ApiProperty({
    required: true,
    default: "TRIP",
  })
  platform: PLATFORM;
}
