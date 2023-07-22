/*
  Warnings:

  - You are about to drop the column `totalReviews` on the `tbObjectTrips` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `tbObjectTrips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbObjectTrips" DROP COLUMN "totalReviews",
ADD COLUMN     "numberReviews" INTEGER[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
