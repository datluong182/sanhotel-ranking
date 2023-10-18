-- CreateTable
CREATE TABLE "tbCompetitionOTAReview" (
    "id" TEXT NOT NULL,
    "tbCompetitionOTAId" TEXT NOT NULL,
    "tbReviewId" TEXT NOT NULL,

    CONSTRAINT "tbCompetitionOTAReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbCompetitionOTAReview" ADD CONSTRAINT "tbCompetitionOTAReview_tbCompetitionOTAId_fkey" FOREIGN KEY ("tbCompetitionOTAId") REFERENCES "tbCompetitionOTA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCompetitionOTAReview" ADD CONSTRAINT "tbCompetitionOTAReview_tbReviewId_fkey" FOREIGN KEY ("tbReviewId") REFERENCES "tbReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
