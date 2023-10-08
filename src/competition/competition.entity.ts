import { tbHotel, tbObject, tbReview } from '@prisma/client';

export interface CompetitionOtaReview {
  name: string;
  reviews: tbReview[];
  objects: tbObject[];
}
