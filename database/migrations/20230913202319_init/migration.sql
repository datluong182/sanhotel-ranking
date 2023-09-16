-- AddForeignKey
ALTER TABLE "tbCompetition" ADD CONSTRAINT "tbCompetition_tbHotelId_fkey" FOREIGN KEY ("tbHotelId") REFERENCES "tbHotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
