-- AlterTable
ALTER TABLE "tbReview" ADD COLUMN     "tbObjectLogId" TEXT;

-- AddForeignKey
ALTER TABLE "tbReview" ADD CONSTRAINT "tbReview_tbObjectLogId_fkey" FOREIGN KEY ("tbObjectLogId") REFERENCES "tbObjectLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
