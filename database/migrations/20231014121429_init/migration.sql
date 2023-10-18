/*
  Warnings:

  - You are about to drop the `tbCompetitionOTAReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbCompetitionOTAReview" DROP CONSTRAINT "tbCompetitionOTAReview_tbCompetitionOTAId_fkey";

-- DropForeignKey
ALTER TABLE "tbCompetitionOTAReview" DROP CONSTRAINT "tbCompetitionOTAReview_tbReviewId_fkey";

-- DropTable
DROP TABLE "tbCompetitionOTAReview";

-- CreateTable
CREATE TABLE "tbCompetitionOTA_Review" (
    "id" TEXT NOT NULL,
    "tbCompetitionOTAId" TEXT NOT NULL,
    "tbReviewId" TEXT NOT NULL,

    CONSTRAINT "tbCompetitionOTA_Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbCompetitionOTA_Review" ADD CONSTRAINT "tbCompetitionOTA_Review_tbCompetitionOTAId_fkey" FOREIGN KEY ("tbCompetitionOTAId") REFERENCES "tbCompetitionOTA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCompetitionOTA_Review" ADD CONSTRAINT "tbCompetitionOTA_Review_tbReviewId_fkey" FOREIGN KEY ("tbReviewId") REFERENCES "tbReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
