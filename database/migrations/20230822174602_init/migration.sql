/*
  Warnings:

  - Added the required column `tbStaffLastUpdateId` to the `tbStaffLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbStaffLog" ADD COLUMN     "tbStaffLastUpdateId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tbStaffLastUpdate" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbStaffLastUpdate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbStaffLog" ADD CONSTRAINT "tbStaffLog_tbStaffLastUpdateId_fkey" FOREIGN KEY ("tbStaffLastUpdateId") REFERENCES "tbStaffLastUpdate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
