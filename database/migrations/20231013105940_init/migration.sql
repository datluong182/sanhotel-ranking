/*
  Warnings:

  - The primary key for the `tbCompetitionOTA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tbCompetitionOTA` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `tbCompetitionOTA` table. All the data in the column will be lost.
  - You are about to drop the column `tbCompetitionOTAId` on the `tbReview` table. All the data in the column will be lost.
  - You are about to drop the `_tbCompetitionOTATotbObject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_tbCompetitionOTATotbObject" DROP CONSTRAINT "_tbCompetitionOTATotbObject_A_fkey";

-- DropForeignKey
ALTER TABLE "_tbCompetitionOTATotbObject" DROP CONSTRAINT "_tbCompetitionOTATotbObject_B_fkey";

-- DropForeignKey
ALTER TABLE "tbReview" DROP CONSTRAINT "tbReview_tbCompetitionOTAId_fkey";

-- AlterTable
ALTER TABLE "tbCompetitionOTA" DROP CONSTRAINT "tbCompetitionOTA_pkey",
DROP COLUMN "id",
DROP COLUMN "platform",
ADD CONSTRAINT "tbCompetitionOTA_pkey" PRIMARY KEY ("tbHotelId", "month", "year");

-- AlterTable
ALTER TABLE "tbObject" ADD COLUMN     "tbCompetitionOTAMonth" INTEGER,
ADD COLUMN     "tbCompetitionOTATbHotelId" TEXT,
ADD COLUMN     "tbCompetitionOTAYear" INTEGER;

-- AlterTable
ALTER TABLE "tbReview" DROP COLUMN "tbCompetitionOTAId",
ADD COLUMN     "tbCompetitionOTAMonth" INTEGER,
ADD COLUMN     "tbCompetitionOTATbHotelId" TEXT,
ADD COLUMN     "tbCompetitionOTAYear" INTEGER;

-- DropTable
DROP TABLE "_tbCompetitionOTATotbObject";

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbCompetitionOTATbHotelId_tbCompetitionOTAMonth_t_fkey" FOREIGN KEY ("tbCompetitionOTATbHotelId", "tbCompetitionOTAMonth", "tbCompetitionOTAYear") REFERENCES "tbCompetitionOTA"("tbHotelId", "month", "year") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbObject" ADD CONSTRAINT "tbObject_tbCompetitionOTATbHotelId_tbCompetitionOTAMonth_t_fkey" FOREIGN KEY ("tbCompetitionOTATbHotelId", "tbCompetitionOTAMonth", "tbCompetitionOTAYear") REFERENCES "tbCompetitionOTA"("tbHotelId", "month", "year") ON DELETE SET NULL ON UPDATE CASCADE;
