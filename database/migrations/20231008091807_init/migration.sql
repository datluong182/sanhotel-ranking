-- CreateEnum
CREATE TYPE "ManagedScope" AS ENUM ('COMPANY', 'DEPARTMENT');

-- AlterTable
ALTER TABLE "tbStaff" ADD COLUMN     "managedScope" "ManagedScope";
