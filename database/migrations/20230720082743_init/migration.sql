-- CreateTable
CREATE TABLE "tbObjectTrips" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rank" JSONB[],
    "scoreReview" INTEGER NOT NULL,
    "totalReviews" INTEGER NOT NULL,

    CONSTRAINT "tbObjectTrips_pkey" PRIMARY KEY ("id")
);
