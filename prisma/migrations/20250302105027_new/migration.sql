/*
  Warnings:

  - A unique constraint covering the columns `[userId,interest]` on the table `UserInterest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_interest_key" ON "UserInterest"("userId", "interest");
