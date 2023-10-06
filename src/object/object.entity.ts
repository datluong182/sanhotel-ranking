import { PLATFORM, Prisma, tbObjectLog } from '@prisma/client';

export interface Objects {
  name: string;
  url: string;
  score: number;
  numberScoreReview: number[];
  updatedAt: Date;
  platform: PLATFORM;
  extra?: ObjectExtra;
}

export interface ObjectExtra extends Prisma.JsonObject {
  rank?: number;
  totalHotel?: number;
  stars?: number;
  subScore?: { [key: string]: number };
}

export interface NewObjectLog extends tbObjectLog {
  tbHotelId: string;
}

export interface InfoTrip {
  name: string;
  rating: number;
  rankingPosition: number;
  ratingHistogram: {
    count1: number;
    count2: number;
    count3: number;
    count4: number;
    count5: number;
  };
}

export interface ApifyAgoda {
  url: string;
  name: string;
  score: number;
  numberScoreReview: number[];
  extra: {
    subScore: { [key: string]: number };
  };
}

export interface ApifyExpedia {
  url: string;
  name: string;
  score: number;
  numberScoreReview: number[];
  extra: {
    subScore: { [key: string]: number };
  };
}

export interface ApifyTraveloka {
  url: string;
  name: string;
  score: number;
  numberScoreReview: number[];
  extra: {
    subScore: { [key: string]: number };
  };
}
