/*
  Warnings:

  - Added the required column `tbStaffId` to the `tbStaffLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbStaffLog" ADD COLUMN     "tbStaffId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tbStaffLog" ADD CONSTRAINT "tbStaffLog_tbStaffId_fkey" FOREIGN KEY ("tbStaffId") REFERENCES "tbStaff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
