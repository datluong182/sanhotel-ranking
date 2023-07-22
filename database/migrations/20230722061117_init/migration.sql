/*
  Warnings:

  - You are about to drop the column `numberReviews` on the `tbObjectTrips` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbObjectTrips" DROP COLUMN "numberReviews",
ADD COLUMN     "numberScoreReviews" INTEGER[];
