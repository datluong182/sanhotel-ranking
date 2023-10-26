import { PLATFORM, tbHotel, tbObject, tbReview } from '@prisma/client';

export interface ObjectOTA {
  id: string;
  tbObjectId: string;
  tbObject: tbObject;
  score: number;
  month: number;
  year: number;
  reviews: tbReview[];
  extra?: {
    volume?: string;
    checkoutInMonth?: number;
  };
}

export interface CompetitionOTA {
  name: string;
  score: number;
  ratioInMonth: number;
  numberReviews: number;
  numberBookingCO: number;
  OTA: { [key: string]: ObjectOTA };
}
