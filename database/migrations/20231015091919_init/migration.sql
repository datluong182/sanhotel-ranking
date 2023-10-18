/*
  Warnings:

  - Added the required column `extra` to the `tbCompetitionOTA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbCompetitionOTA" ADD COLUMN     "extra" JSONB NOT NULL;
