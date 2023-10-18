/*
  Warnings:

  - You are about to drop the column `tbCompetitionOTATbObjectId` on the `tbReview` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbReview" DROP CONSTRAINT "tbReview_tbCompetitionOTATbObjectId_fkey";

-- AlterTable
ALTER TABLE "tbReview" DROP COLUMN "tbCompetitionOTATbObjectId";
