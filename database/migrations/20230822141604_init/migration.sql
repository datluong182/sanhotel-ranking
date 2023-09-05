-- CreateTable
CREATE TABLE "tbStaff" (
    "id" TEXT NOT NULL,
    "tbHotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fiveStarsReview" JSONB NOT NULL,

    CONSTRAINT "tbStaff_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbStaff" ADD CONSTRAINT "tbStaff_tbHotelId_fkey" FOREIGN KEY ("tbHotelId") REFERENCES "tbHotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
