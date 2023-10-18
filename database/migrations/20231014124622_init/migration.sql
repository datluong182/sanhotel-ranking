/*
  Warnings:

  - You are about to drop the column `tbCompetitionOTAId` on the `tbReview` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbReview" DROP CONSTRAINT "tbReview_tbCompetitionOTAId_fkey";

-- AlterTable
ALTER TABLE "tbReview" DROP COLUMN "tbCompetitionOTAId";
