/*
  Warnings:

  - The primary key for the `tbCompetitionOTA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tbCompetitionOTA` table. All the data in the column will be lost.
  - You are about to drop the column `tbCompetitionOTAId` on the `tbReview` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbReview" DROP CONSTRAINT "tbReview_tbCompetitionOTAId_fkey";

-- AlterTable
ALTER TABLE "tbCompetitionOTA" DROP CONSTRAINT "tbCompetitionOTA_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "tbCompetitionOTA_pkey" PRIMARY KEY ("tbObjectId");

-- AlterTable
ALTER TABLE "tbReview" DROP COLUMN "tbCompetitionOTAId",
ADD COLUMN     "tbCompetitionOTATbObjectId" TEXT;

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbCompetitionOTATbObjectId_fkey" FOREIGN KEY ("tbCompetitionOTATbObjectId") REFERENCES "tbCompetitionOTA"("tbObjectId") ON DELETE SET NULL ON UPDATE CASCADE;
