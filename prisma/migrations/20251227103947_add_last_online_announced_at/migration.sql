-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastOnlineAnnouncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Interest_memberId_idx" ON "Interest"("memberId");

-- CreateIndex
CREATE INDEX "Like_targetUserId_idx" ON "Like"("targetUserId");

-- CreateIndex
CREATE INDEX "Like_sourceUserId_targetUserId_idx" ON "Like"("sourceUserId", "targetUserId");

-- CreateIndex
CREATE INDEX "Member_userId_idx" ON "Member"("userId");

-- CreateIndex
CREATE INDEX "Member_latitude_longitude_idx" ON "Member"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Message_recipientId_dateRead_idx" ON "Message"("recipientId", "dateRead");

-- CreateIndex
CREATE INDEX "Message_senderId_created_idx" ON "Message"("senderId", "created" DESC);

-- CreateIndex
CREATE INDEX "Message_recipientId_senderId_idx" ON "Message"("recipientId", "senderId");

-- CreateIndex
CREATE INDEX "Photo_memberId_isApproved_idx" ON "Photo"("memberId", "isApproved");

-- CreateIndex
CREATE INDEX "ProfileView_viewedId_viewedAt_idx" ON "ProfileView"("viewedId", "viewedAt" DESC);

-- CreateIndex
CREATE INDEX "ProfileView_viewerId_idx" ON "ProfileView"("viewerId");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt" DESC);

-- CreateIndex
CREATE INDEX "Video_memberId_idx" ON "Video"("memberId");
