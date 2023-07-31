import { PLATFORM, Prisma } from '@prisma/client';

export interface Objects {
  name: string;
  url: string;
  score: number;
  numberScoreReview: number[];
  updatedAt: Date;
  platform: PLATFORM;
  extra: ObjectExtra;
}

export interface ObjectExtra extends Prisma.JsonObject {
  rank?: number;
  totalHotel?: number;
  stars?: number;
}

// export interface Object {
//   name: string;
//   url: string;
//   rank: number;
//   score: number;
//   numberScoreReviews: number[];
//   updatedAt: Date;
// }