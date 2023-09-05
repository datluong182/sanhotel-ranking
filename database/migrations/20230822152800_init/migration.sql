-- CreateTable
CREATE TABLE "tbStaffLog" (
    "id" TEXT NOT NULL,
    "tbHotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fiveStarsReview" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbStaffLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbStaffLog" ADD CONSTRAINT "tbStaffLog_tbHotelId_fkey" FOREIGN KEY ("tbHotelId") REFERENCES "tbHotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
