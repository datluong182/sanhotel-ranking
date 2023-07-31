-- CreateEnum
CREATE TYPE "PLATFORM" AS ENUM ('TRIP', 'BOOKING');

-- CreateTable
CREATE TABLE "tbObject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "numberScoreReview" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extra" JSONB NOT NULL,
    "platform" "PLATFORM" NOT NULL,

    CONSTRAINT "tbObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbObjectLog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "numberScoreReview" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extra" JSONB NOT NULL,
    "platform" "PLATFORM" NOT NULL,
    "isManual" BOOLEAN NOT NULL,
    "tbObjectId" TEXT NOT NULL,

    CONSTRAINT "tbObjectLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbObjectLog" ADD CONSTRAINT "tbObjectLog_tbObjectId_fkey" FOREIGN KEY ("tbObjectId") REFERENCES "tbObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
