-- CreateTable
CREATE TABLE "tbLastUpdate" (
    "id" TEXT NOT NULL,
    "platform" "PLATFORM" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isManual" BOOLEAN NOT NULL,

    CONSTRAINT "tbLastUpdate_pkey" PRIMARY KEY ("id")
);
