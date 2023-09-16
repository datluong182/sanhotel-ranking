/*
  Warnings:

  - The primary key for the `tbCompetition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tbCompetition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbCompetition" DROP CONSTRAINT "tbCompetition_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "tbCompetition_pkey" PRIMARY KEY ("month", "year", "tbHotelId", "platform");
