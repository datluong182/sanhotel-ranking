-- AlterTable
ALTER TABLE "tbObject" ADD COLUMN     "tbHotelId" TEXT;

-- CreateTable
CREATE TABLE "tbHotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "avatar" TEXT,
    "gm" TEXT NOT NULL,
    "links" JSONB NOT NULL,

    CONSTRAINT "tbHotel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbObject" ADD CONSTRAINT "tbObject_tbHotelId_fkey" FOREIGN KEY ("tbHotelId") REFERENCES "tbHotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
