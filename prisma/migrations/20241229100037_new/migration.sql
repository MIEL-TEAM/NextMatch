/*
  Warnings:

  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sourceMemberId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `targetMemberId` on the `Like` table. All the data in the column will be lost.
  - Added the required column `sourceUserId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetUserId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_sourceMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_targetMemberId_fkey";

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
DROP COLUMN "sourceMemberId",
DROP COLUMN "targetMemberId",
ADD COLUMN     "sourceUserId" TEXT NOT NULL,
ADD COLUMN     "targetUserId" TEXT NOT NULL,
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("sourceUserId", "targetUserId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "Member"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "Member"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
