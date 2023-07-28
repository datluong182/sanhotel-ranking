-- CreateTable
CREATE TABLE "tbObjectTrips" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "numberScoreReviews" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbObjectTrips_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "tbObjectBookings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "stars" INTEGER NOT NULL,
    "numberScoreReviews" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbObjectBookings_pkey" PRIMARY KEY ("id")
);
