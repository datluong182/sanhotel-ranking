-- AlterTable
ALTER TABLE "tbReview" ADD COLUMN     "tbCompetitionOTAId" TEXT;

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbCompetitionOTAId_fkey" FOREIGN KEY ("tbCompetitionOTAId") REFERENCES "tbCompetitionOTA"("id") ON DELETE SET NULL ON UPDATE CASCADE;
