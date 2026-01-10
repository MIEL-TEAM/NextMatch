import { prisma } from "@/lib/prisma";

export async function dbGetUserForAnnouncement(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      image: true,
      lastOnlineAnnouncedAt: true,
    },
  });
}

export async function dbGetOutboundLikes(userId: string) {
  return prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });
}

export async function dbUpdateUserAnnouncementTime(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastOnlineAnnouncedAt: new Date() },
  });
}

export async function dbGetMutualMatchIds(userId: string, likeIds: string[]) {
  return prisma.like.findMany({
    where: {
      AND: [{ targetUserId: userId }, { sourceUserId: { in: likeIds } }],
    },
    select: { sourceUserId: true },
  });
}
