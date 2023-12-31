import { PLATFORM, Prisma } from '@prisma/client';

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
  extra: {
    link: string;
    stars: number;
    reviewId: string;
  };
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
  };
}

export class ReviewGoogle extends Review {
  extra: {
    score: number;
    reviewId: string;
    link: string;
  };
}

export class NewReview {
  [key: string]: {
    TRIP: ReviewTrip[];
    BOOKING: ReviewBooking[];
    GOOGLE: ReviewGoogle[];
  };
}

export class PlaceGoogle {
  url: string;
  title: string;
  address: string;
  reviews: PlaceGoogleReview[];
}

export class PlaceGoogleReview {
  name: string;
  text: string;
  publishedAtDate: string;
  reviewId: string;
  reviewUrl: string;
  stars: number;
}
