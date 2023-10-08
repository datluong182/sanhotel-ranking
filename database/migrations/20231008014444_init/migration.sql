-- CreateTable
CREATE TABLE "tbUser" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbUser_pkey" PRIMARY KEY ("id")
);
