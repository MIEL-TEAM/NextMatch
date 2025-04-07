/*
  Warnings:

  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the `Interest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemberInterest` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `Member` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "MemberInterest" DROP CONSTRAINT "MemberInterest_interestId_fkey";

-- DropForeignKey
ALTER TABLE "MemberInterest" DROP CONSTRAINT "MemberInterest_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_memberId_fkey";

-- AlterTable
ALTER TABLE "Member" DROP CONSTRAINT "Member_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "canceledAt" SET DATA TYPE TIMESTAMP(6);

-- DropTable
DROP TABLE "Interest";

-- DropTable
DROP TABLE "MemberInterest";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "months" INTEGER NOT NULL DEFAULT 1,
    "boosts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
