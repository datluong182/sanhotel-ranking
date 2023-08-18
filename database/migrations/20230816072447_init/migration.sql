/*
  Warnings:

  - Made the column `tbHotelId` on table `tbObject` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tbObject" ALTER COLUMN "tbHotelId" SET NOT NULL;
