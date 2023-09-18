-- AlterTable
ALTER TABLE "tbHotel" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tbObject" ADD COLUMN     "disable" BOOLEAN,
ADD COLUMN     "idInPlatform" TEXT,
ADD COLUMN     "type" "TYPE_HOTEL";
