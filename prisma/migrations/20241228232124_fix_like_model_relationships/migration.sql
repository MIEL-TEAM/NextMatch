/*
  Warnings:

  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sourceUserId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `targetUserId` on the `Like` table. All the data in the column will be lost.
  - Added the required column `sourceMemberId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetMemberId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_sourceUserId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_targetUserId_fkey";

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
DROP COLUMN "sourceUserId",
DROP COLUMN "targetUserId",
ADD COLUMN     "sourceMemberId" TEXT NOT NULL,
ADD COLUMN     "targetMemberId" TEXT NOT NULL,
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("sourceMemberId", "targetMemberId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_sourceMemberId_fkey" FOREIGN KEY ("sourceMemberId") REFERENCES "Member"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_targetMemberId_fkey" FOREIGN KEY ("targetMemberId") REFERENCES "Member"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
