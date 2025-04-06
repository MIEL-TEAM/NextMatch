/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Interest` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Interest` table. All the data in the column will be lost.
  - You are about to drop the `_UserInterests` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Interest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_UserInterests" DROP CONSTRAINT "_UserInterests_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserInterests" DROP CONSTRAINT "_UserInterests_B_fkey";

-- AlterTable
ALTER TABLE "Interest" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "interestId" TEXT;

-- DropTable
DROP TABLE "_UserInterests";

-- CreateTable
CREATE TABLE "_MemberInterests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberInterests_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MemberInterests_B_index" ON "_MemberInterests"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberInterests" ADD CONSTRAINT "_MemberInterests_A_fkey" FOREIGN KEY ("A") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberInterests" ADD CONSTRAINT "_MemberInterests_B_fkey" FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
