/*
  Warnings:

  - Added the required column `ratioInMonth` to the `tbCompetitionOTA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbCompetitionOTA" ADD COLUMN     "ratioInMonth" DOUBLE PRECISION NOT NULL;
