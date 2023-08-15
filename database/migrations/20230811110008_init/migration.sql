/*
  Warnings:

  - You are about to drop the column `response` on the `tbObject` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PLATFORM_RESPONSE" AS ENUM ('BOOKING', 'HUBSPOT');

-- AlterTable
ALTER TABLE "tbObject" DROP COLUMN "response";

-- CreateTable
CREATE TABLE "tbResponse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "color" TEXT NOT NULL,
    "platform" "PLATFORM_RESPONSE" NOT NULL,

    CONSTRAINT "tbResponse_pkey" PRIMARY KEY ("id")
);
