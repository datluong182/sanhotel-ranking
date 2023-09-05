-- CreateTable
CREATE TABLE "tbReview" (
    "id" TEXT NOT NULL,
    "tbHotelId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "extra" JSONB NOT NULL,
    "createdAt" TEXT NOT NULL,
    "platform" "PLATFORM" NOT NULL,

    CONSTRAINT "tbReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbHotelId_fkey" FOREIGN KEY ("tbHotelId") REFERENCES "tbHotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
