-- CreateEnum (idempotent for re-runs after partial failure)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MatchStatus') THEN
    CREATE TYPE "MatchStatus" AS ENUM ('ACTIVE', 'DISSOLVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DissolveReason') THEN
    CREATE TYPE "DissolveReason" AS ENUM ('UNMATCHED', 'BLOCKED', 'ACCOUNT_DELETED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RevealStatus') THEN
    CREATE TYPE "RevealStatus" AS ENUM ('PENDING', 'REVEALED', 'DISMISSED', 'EXPIRED');
  END IF;
END
$$;

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MESSAGE', 'NEW_LIKE', 'MUTUAL_MATCH', 'PROFILE_VIEW', 'STORY_VIEW', 'STORY_REPLY', 'STORY_REACTION', 'MATCH_ONLINE', 'SYSTEM', 'ACHIEVEMENT', 'PROFILE_BOOST', 'SMART_MATCH');

-- DropIndex
DROP INDEX "smart_match_cache_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "processedForMatch" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "coverImagePublicId" TEXT,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"newMessage": {"toast": true, "sound": true, "push": true}, "newLike": {"toast": false, "sound": true, "push": true}, "mutualMatch": {"toast": true, "sound": true, "push": true}, "profileView": {"toast": false, "sound": false, "push": true}, "storyView": {"toast": false, "sound": false, "push": false}, "matchOnline": {"toast": true, "sound": true, "push": true}}';

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "userId1" TEXT NOT NULL,
    "userId2" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dissolvedAt" TIMESTAMP(3),
    "dissolvedBy" TEXT,
    "dissolvedReason" "DissolveReason",
    "user1VideoSnapshot" TEXT,
    "user2VideoSnapshot" TEXT,
    "chatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchReveal" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoSnapshot" TEXT,
    "status" "RevealStatus" NOT NULL DEFAULT 'PENDING',
    "revealedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchReveal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "icon" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorImage" TEXT,
    "relatedId" TEXT,
    "linkUrl" TEXT,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,
    "isToast" BOOLEAN NOT NULL DEFAULT false,
    "groupKey" TEXT,
    "batchSize" INTEGER DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "seenAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_userId1_status_matchedAt_idx" ON "Match"("userId1", "status", "matchedAt" DESC);

-- CreateIndex
CREATE INDEX "Match_userId2_status_matchedAt_idx" ON "Match"("userId2", "status", "matchedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Match_userId1_userId2_key" ON "Match"("userId1", "userId2");

-- CreateIndex
CREATE INDEX "MatchReveal_userId_createdAt_idx" ON "MatchReveal"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MatchReveal_createdAt_idx" ON "MatchReveal"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MatchReveal_matchId_userId_key" ON "MatchReveal"("matchId", "userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_type_createdAt_idx" ON "notifications"("userId", "type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_groupKey_createdAt_idx" ON "notifications"("userId", "groupKey", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_expiresAt_idx" ON "notifications"("expiresAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "Member_gender_idx" ON "Member"("gender");

-- CreateIndex
CREATE INDEX "Member_city_idx" ON "Member"("city");

-- CreateIndex
CREATE INDEX "Member_created_idx" ON "Member"("created" DESC);

-- CreateIndex
CREATE INDEX "Member_dateOfBirth_idx" ON "Member"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Member_gender_dateOfBirth_idx" ON "Member"("gender", "dateOfBirth");

-- CreateIndex
CREATE INDEX "Member_lastActiveAt_idx" ON "Member"("lastActiveAt" DESC);

-- CreateIndex
CREATE INDEX "UserInteraction_userId_timestamp_idx" ON "UserInteraction"("userId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "UserInteraction_targetId_idx" ON "UserInteraction"("targetId");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_action_idx" ON "UserInteraction"("userId", "action");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_targetId_idx" ON "UserInteraction"("userId", "targetId");

-- CreateIndex
CREATE INDEX "smart_match_cache_userId_updatedAt_idx" ON "smart_match_cache"("userId", "updatedAt" DESC);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userId1_fkey" FOREIGN KEY ("userId1") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userId2_fkey" FOREIGN KEY ("userId2") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReveal" ADD CONSTRAINT "MatchReveal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
