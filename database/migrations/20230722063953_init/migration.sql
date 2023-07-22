/*
  Warnings:

  - You are about to drop the column `scoreReview` on the `tbObjectTrips` table. All the data in the column will be lost.
  - Added the required column `score` to the `tbObjectTrips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbObjectTrips" DROP COLUMN "scoreReview",
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL;
