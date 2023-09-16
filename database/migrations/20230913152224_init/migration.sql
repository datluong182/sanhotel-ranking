-- CreateEnum
CREATE TYPE "TYPE_HOTEL" AS ENUM ('ALLY', 'ENEMY');

-- AlterTable
ALTER TABLE "tbHotel" ADD COLUMN     "type" "TYPE_HOTEL";
