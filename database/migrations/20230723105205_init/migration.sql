/*
  Warnings:

  - You are about to drop the `tbObjectBookingsSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tbObjectTripsSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "tbObjectBookingsSetting";

-- DropTable
DROP TABLE "tbObjectTripsSetting";

-- CreateTable
CREATE TABLE "tbObjectTripsLog" (
    "id" SERIAL NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbObjectTripsLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbObjectBookingsLog" (
    "id" SERIAL NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbObjectBookingsLog_pkey" PRIMARY KEY ("id")
);
