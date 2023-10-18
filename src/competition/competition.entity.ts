import { tbHotel, tbObject, tbReview } from '@prisma/client';

export interface CompetitionOTA {
  id: string;
  tbObjectId: string;
  tbObject: tbObject;
  score: number;
  month: number;
  year: number;
  reviews: tbReview[];
  extra?: {
    volume?: number;
    checkoutInMonth?: number;
  };
}
