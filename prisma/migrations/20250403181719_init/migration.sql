/*
  Warnings:

  - The primary key for the `Interest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Interest` table. All the data in the column will be lost.
  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `interestId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the `_MemberInterests` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `_id` to the `Interest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Interest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Interest` table without a default value. This is not possible if the table is not empty.
  - The required column `_id` was added to the `Member` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_interestId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_memberId_fkey";

-- DropForeignKey
ALTER TABLE "_MemberInterests" DROP CONSTRAINT "_MemberInterests_A_fkey";

-- DropForeignKey
ALTER TABLE "_MemberInterests" DROP CONSTRAINT "_MemberInterests_B_fkey";

-- DropIndex
DROP INDEX "Interest_name_key";

-- AlterTable
ALTER TABLE "Interest" DROP CONSTRAINT "Interest_pkey",
DROP COLUMN "id",
ADD COLUMN     "_id" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Interest_pkey" PRIMARY KEY ("_id");

-- AlterTable
ALTER TABLE "Member" DROP CONSTRAINT "Member_pkey",
DROP COLUMN "id",
DROP COLUMN "interestId",
ADD COLUMN     "_id" TEXT NOT NULL,
ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("_id");

-- DropTable
DROP TABLE "_MemberInterests";

-- CreateTable
CREATE TABLE "MemberInterest" (
    "_id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberInterest_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE INDEX "MemberInterest_memberId_idx" ON "MemberInterest"("memberId");

-- CreateIndex
CREATE INDEX "MemberInterest_interestId_idx" ON "MemberInterest"("interestId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberInterest_memberId_interestId_key" ON "MemberInterest"("memberId", "interestId");

-- AddForeignKey
ALTER TABLE "MemberInterest" ADD CONSTRAINT "MemberInterest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberInterest" ADD CONSTRAINT "MemberInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
