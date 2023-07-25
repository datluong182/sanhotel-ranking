/*
  Warnings:

  - Made the column `stars` on table `tbObjectBookings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tbObjectBookings" ALTER COLUMN "stars" SET NOT NULL;
