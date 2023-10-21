import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PLATFORM, Prisma, tbHotel, tbReview, tbStaff } from "@prisma/client";
import { StaffEnum } from "./staff.enum";

export const TYPE_RANKING = {
  STAFF: "STAFF",
  HOTEL: "HOTEL",
};

export type TYPE_RANKING = (typeof TYPE_RANKING)[keyof typeof TYPE_RANKING];

export class CreateStaff {
  @ApiProperty({
    required: true,
    default: "Ruby",
  })
  name: string;
  @ApiProperty({
    required: true,
    default: [],
  })
  otherNames: string[];

  @ApiProperty({
    required: true,
  })
  tbHotelId: string;

  @ApiProperty({
    required: true,
    enum: StaffEnum,
  })
  role: StaffEnum;

  @ApiProperty({
    required: true,
  })
  fiveStarsReview: object;
}

export class UpdateStaff extends CreateStaff {
  @ApiProperty({
    required: true,
  })
  id: string;
}

export class QueryRankByDayStaff {
  @ApiProperty({
    default: "2023-06-30",
  })
  start: string;
  @ApiProperty({
    default: "2023-08-31",
  })
  end: string;
  @ApiProperty({})
  tbStaffId: string;

  @ApiProperty({
    default: "TRIP",
  })
  platform: PLATFORM;
}

export class QueryRankingStaff {
  @ApiProperty({
    default: "2023-06-30",
  })
  start: string;
  @ApiProperty({
    default: "2023-08-31",
  })
  end: string;
  @ApiPropertyOptional({})
  tbHotelId?: string;

  @ApiProperty({
    default: "TRIP",
  })
  platform: PLATFORM;

  @ApiProperty({
    default: true,
  })
  allReview: boolean | string;
}

export class RankingStaff {
  tbStaff: tbStaff;
  tbStaffId: string;
  tbHotel: tbHotel;
  tbHotelId: string;
  reviews: tbReview[];
  fiveStarsReview: number;
  platform?: PLATFORM;
}

export class RankingStaffHotel {
  tbHotel: tbHotel;
  tbHotelId: string;
  reviews: ReviewRankingStaffHotel[];
  fiveStarsReview: number;
  badReview?: tbReview[];
  staffs?: tbStaff[];
  platform: PLATFORM;
}

export class ReviewRankingStaffHotel {
  id: string;
  tbHotelId: string;
  username: string;
  title: string;
  content: string[];
  extra: Prisma.JsonValue;
  createdAt: Date;
  monthCreated: number;
  yearCreated: number;
  platform: PLATFORM;
  staffs: tbStaff[];
}
