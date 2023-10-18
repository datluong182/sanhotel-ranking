-- AlterTable
ALTER TABLE "tbReview" ADD COLUMN     "tbCompetitionOTAId" TEXT;

-- CreateTable
CREATE TABLE "tbCompetitionOTA" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "platform" "PLATFORM" NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "tbHotelId" TEXT NOT NULL,

    CONSTRAINT "tbCompetitionOTA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_tbCompetitionOTATotbObject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_tbCompetitionOTATotbObject_AB_unique" ON "_tbCompetitionOTATotbObject"("A", "B");

-- CreateIndex
CREATE INDEX "_tbCompetitionOTATotbObject_B_index" ON "_tbCompetitionOTATotbObject"("B");

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbCompetitionOTAId_fkey" FOREIGN KEY ("tbCompetitionOTAId") REFERENCES "tbCompetitionOTA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCompetitionOTA" ADD CONSTRAINT "tbCompetitionOTA_tbHotelId_fkey" FOREIGN KEY ("tbHotelId") REFERENCES "tbHotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tbCompetitionOTATotbObject" ADD CONSTRAINT "_tbCompetitionOTATotbObject_A_fkey" FOREIGN KEY ("A") REFERENCES "tbCompetitionOTA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tbCompetitionOTATotbObject" ADD CONSTRAINT "_tbCompetitionOTATotbObject_B_fkey" FOREIGN KEY ("B") REFERENCES "tbObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
