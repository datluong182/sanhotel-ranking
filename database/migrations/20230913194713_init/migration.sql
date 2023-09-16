-- CreateTable
CREATE TABLE "tbCompetition" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "extra" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "numberReviewHighAll" INTEGER NOT NULL,
    "numberReviewHigh" INTEGER NOT NULL,
    "reviewHigh" INTEGER[],
    "numberReviewBad" INTEGER NOT NULL,
    "reviewBad" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "platform" "PLATFORM" NOT NULL,
    "tbHotelId" TEXT NOT NULL,

    CONSTRAINT "tbCompetition_pkey" PRIMARY KEY ("id")
);
