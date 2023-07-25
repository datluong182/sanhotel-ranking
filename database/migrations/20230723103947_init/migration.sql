-- CreateTable
CREATE TABLE "tbObjectTripsSetting" (
    "id" SERIAL NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbObjectTripsSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbObjectBookingsSetting" (
    "id" SERIAL NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbObjectBookingsSetting_pkey" PRIMARY KEY ("id")
);
