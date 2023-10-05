-- AlterTable
ALTER TABLE "tbStaff" ADD COLUMN     "point" INTEGER,
ADD COLUMN     "staffId" TEXT;

-- CreateTable
CREATE TABLE "tbStaffLevel" (
    "id" TEXT NOT NULL,
    "threshHolePoint" INTEGER NOT NULL,
    "levelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbStaffLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbPointHistory" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbPointHistory_pkey" PRIMARY KEY ("id")
);
