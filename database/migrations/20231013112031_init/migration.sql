/*
  Warnings:

  - The primary key for the `tbCompetitionOTA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tbCompetitionOTATbObjectId` on the `tbReview` table. All the data in the column will be lost.
  - Added the required column `id` to the `tbCompetitionOTA` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbReview" DROP CONSTRAINT "tbReview_tbCompetitionOTATbObjectId_fkey";

-- AlterTable
ALTER TABLE "tbCompetitionOTA" DROP CONSTRAINT "tbCompetitionOTA_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "tbHotelId" DROP NOT NULL,
ADD CONSTRAINT "tbCompetitionOTA_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tbReview" DROP COLUMN "tbCompetitionOTATbObjectId",
ADD COLUMN     "tbCompetitionOTAId" TEXT;

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbCompetitionOTAId_fkey" FOREIGN KEY ("tbCompetitionOTAId") REFERENCES "tbCompetitionOTA"("id") ON DELETE SET NULL ON UPDATE CASCADE;
