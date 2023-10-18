/*
  Warnings:

  - The primary key for the `tbCompetitionOTA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ratioInMonth` on the `tbCompetitionOTA` table. All the data in the column will be lost.
  - You are about to alter the column `score` on the `tbCompetitionOTA` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `tbCompetitionOTAMonth` on the `tbObject` table. All the data in the column will be lost.
  - You are about to drop the column `tbCompetitionOTATbHotelId` on the `tbObject` table. All the data in the column will be lost.
  - You are about to drop the column `tbCompetitionOTAYear` on the `tbObject` table. All the data in the column will be lost.
  - You are about to drop the column `tbCompetitionOTAMonth` on the `tbReview` table. All the data in the column will be lost.
  - You are about to drop the column `tbCompetitionOTATbHotelId` on the `tbReview` table. All the data in the column will be lost.
  - You are about to drop the column `tbCompetitionOTAYear` on the `tbReview` table. All the data in the column will be lost.
  - Added the required column `tbObjectId` to the `tbCompetitionOTA` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbObject" DROP CONSTRAINT "tbObject_tbCompetitionOTATbHotelId_tbCompetitionOTAMonth_t_fkey";

-- DropForeignKey
ALTER TABLE "tbReview" DROP CONSTRAINT "tbReview_tbCompetitionOTATbHotelId_tbCompetitionOTAMonth_t_fkey";

-- AlterTable
ALTER TABLE "tbCompetitionOTA" DROP CONSTRAINT "tbCompetitionOTA_pkey",
DROP COLUMN "ratioInMonth",
ADD COLUMN     "tbObjectId" TEXT NOT NULL,
ALTER COLUMN "score" SET DATA TYPE INTEGER,
ADD CONSTRAINT "tbCompetitionOTA_pkey" PRIMARY KEY ("tbObjectId");

-- AlterTable
ALTER TABLE "tbObject" DROP COLUMN "tbCompetitionOTAMonth",
DROP COLUMN "tbCompetitionOTATbHotelId",
DROP COLUMN "tbCompetitionOTAYear";

-- AlterTable
ALTER TABLE "tbReview" DROP COLUMN "tbCompetitionOTAMonth",
DROP COLUMN "tbCompetitionOTATbHotelId",
DROP COLUMN "tbCompetitionOTAYear",
ADD COLUMN     "tbCompetitionOTATbObjectId" TEXT;

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbCompetitionOTATbObjectId_fkey" FOREIGN KEY ("tbCompetitionOTATbObjectId") REFERENCES "tbCompetitionOTA"("tbObjectId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCompetitionOTA" ADD CONSTRAINT "tbCompetitionOTA_tbObjectId_fkey" FOREIGN KEY ("tbObjectId") REFERENCES "tbObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
