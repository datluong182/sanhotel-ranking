/*
  Warnings:

  - The primary key for the `tbCompetitionOTA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tbHotelId` on the `tbCompetitionOTA` table. All the data in the column will be lost.
  - Added the required column `id` to the `tbCompetitionOTA` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbCompetitionOTA" DROP CONSTRAINT "tbCompetitionOTA_tbHotelId_fkey";

-- AlterTable
ALTER TABLE "tbCompetitionOTA" DROP CONSTRAINT "tbCompetitionOTA_pkey",
DROP COLUMN "tbHotelId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "tbCompetitionOTA_pkey" PRIMARY KEY ("id");
