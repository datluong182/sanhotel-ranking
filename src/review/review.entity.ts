import { Prisma } from "@prisma/client";

export class Review {
  username: string;
  title: string;
  content: string[];
  extra: object;
  createdAt: Date;
  monthCreated: number;
  yearCreated: number;
}

export class ReviewTrip extends Review {
  extra: ExtraTrip;
}

export class ExtraTrip {
  link: string;
  stars: number;
  reviewId: string;
}

export class ReviewBooking extends Review {
  extra: {
    score: number;
    reviewId: string;
    link: string;
  }
}

export class NewReview { 
  [key: string]: {
    TRIP: ReviewTrip[];
    BOOKING: ReviewBooking[];
  }
}