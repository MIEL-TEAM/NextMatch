-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'chat',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invitations_recipientId_status_createdAt_idx" ON "invitations"("recipientId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "invitations_recipientId_dismissedAt_idx" ON "invitations"("recipientId", "dismissedAt");

-- CreateIndex
CREATE INDEX "invitations_recipientId_acceptedAt_idx" ON "invitations"("recipientId", "acceptedAt");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
