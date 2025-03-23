-- AlterTable
ALTER TABLE "User" ADD COLUMN     "boostsAvailable" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premiumUntil" TIMESTAMP(3);
