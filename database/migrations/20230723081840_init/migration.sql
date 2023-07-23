/*
  Warnings:

  - Changed the type of `rank` on the `tbObjectTrips` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "tbObjectTrips" DROP COLUMN "rank",
ADD COLUMN     "rank" INTEGER NOT NULL;
