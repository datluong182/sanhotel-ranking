/*
  Warnings:

  - The primary key for the `tbCompetitionOTA_Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tbCompetitionOTA_Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbCompetitionOTA_Review" DROP CONSTRAINT "tbCompetitionOTA_Review_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "tbCompetitionOTA_Review_pkey" PRIMARY KEY ("tbCompetitionOTAId", "tbReviewId");
