-- DropForeignKey
ALTER TABLE "tbCompetition" DROP CONSTRAINT "tbCompetition_tbHotelId_fkey";

-- AddForeignKey
ALTER TABLE "tbCompetition" ADD CONSTRAINT "tbCompetition_tbHotelId_fkey" FOREIGN KEY ("tbHotelId") REFERENCES "tbHotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
