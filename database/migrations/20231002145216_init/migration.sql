/*
  Warnings:

  - The values [EXPEDIA] on the enum `PLATFORM` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PLATFORM_new" AS ENUM ('TRIP', 'BOOKING', 'GOOGLE', 'AGODA');
ALTER TABLE "tbReview" ALTER COLUMN "platform" TYPE "PLATFORM_new" USING ("platform"::text::"PLATFORM_new");
ALTER TABLE "tbObject" ALTER COLUMN "platform" TYPE "PLATFORM_new" USING ("platform"::text::"PLATFORM_new");
ALTER TABLE "tbObjectLog" ALTER COLUMN "platform" TYPE "PLATFORM_new" USING ("platform"::text::"PLATFORM_new");
ALTER TABLE "tbLastUpdate" ALTER COLUMN "platform" TYPE "PLATFORM_new" USING ("platform"::text::"PLATFORM_new");
ALTER TABLE "tbCompetition" ALTER COLUMN "platform" TYPE "PLATFORM_new" USING ("platform"::text::"PLATFORM_new");
ALTER TYPE "PLATFORM" RENAME TO "PLATFORM_old";
ALTER TYPE "PLATFORM_new" RENAME TO "PLATFORM";
DROP TYPE "PLATFORM_old";
COMMIT;
