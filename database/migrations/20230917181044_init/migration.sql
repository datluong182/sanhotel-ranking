/*
  Warnings:

  - You are about to drop the column `disable` on the `tbObject` table. All the data in the column will be lost.
  - You are about to drop the column `idInPlatform` on the `tbObject` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `tbObject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbHotel" ADD COLUMN     "disable" BOOLEAN;

-- AlterTable
ALTER TABLE "tbObject" DROP COLUMN "disable",
DROP COLUMN "idInPlatform",
DROP COLUMN "type";
