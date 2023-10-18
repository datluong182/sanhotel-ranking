-- DropForeignKey
ALTER TABLE "tbCompetitionOTA" DROP CONSTRAINT "tbCompetitionOTA_tbObjectId_fkey";

-- AddForeignKey
ALTER TABLE "tbCompetitionOTA" ADD CONSTRAINT "tbCompetitionOTA_tbObjectId_fkey" FOREIGN KEY ("tbObjectId") REFERENCES "tbObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
