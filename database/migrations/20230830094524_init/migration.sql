/*
  Warnings:

  - Added the required column `monthCreated` to the `tbReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearCreated` to the `tbReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbReview" ADD COLUMN     "monthCreated" INTEGER NOT NULL,
ADD COLUMN     "yearCreated" INTEGER NOT NULL;
