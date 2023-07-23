-- CreateTable
CREATE TABLE "tbObjectBookings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "numberScoreReviews" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbObjectBookings_pkey" PRIMARY KEY ("id")
);
