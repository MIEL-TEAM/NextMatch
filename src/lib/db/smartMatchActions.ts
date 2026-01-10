import { prisma } from "@/lib/prisma";

export async function dbCreateUserInteraction(data: {
  userId: string;
  targetId: string;
  action: string;
  duration?: number;
  weight: number;
}) {
  return prisma.userInteraction.create({
    data: {
      userId: data.userId,
      targetId: data.targetId,
      action: data.action,
      duration: data.duration,
      weight: data.weight,
    },
  });
}

export async function dbGetUserInteractions(userId: string) {
  return prisma.userInteraction.findMany({
    where: { userId },
    select: { targetId: true, action: true, weight: true, duration: true },
    orderBy: { timestamp: "desc" },
    take: 100,
  });
}

export async function dbGetUserLikes(userId: string) {
  return prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
    take: 50,
  });
}

export async function dbGetUserMessages(userId: string) {
  return prisma.message.findMany({
    where: { senderId: userId },
    select: { recipientId: true, text: true },
    orderBy: { created: "desc" },
    take: 50,
  });
}

export async function dbGetRandomMembers(userId: string) {
  return prisma.member.findMany({
    where: { userId: { not: userId } },
    include: {
      interests: { select: { name: true } },
      user: { select: { emailVerified: true, oauthVerified: true } },
    },
    orderBy: { created: "desc" },
    take: 12,
  });
}

export async function dbGetUserPreferences(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredGenders: true,
      preferredAgeMin: true,
      preferredAgeMax: true,
    },
  });
}

export async function dbGetPotentialMatches(
  userId: string,
  excludeUserIds: string[],
  genderFilter: any,
  ageFilter: any
) {
  return prisma.member.findMany({
    where: {
      userId: { in: excludeUserIds, not: userId },
      ...genderFilter,
      ...ageFilter,
    },
    include: {
      interests: { select: { name: true } },
      user: { select: { emailVerified: true, oauthVerified: true } },
    },
    orderBy: { created: "desc" },
  });
}

export async function dbDeleteSmartMatchCache(userId: string) {
  return prisma.smartMatchCache.deleteMany({
    where: { userId },
  });
}

export async function dbGetSmartMatchCache(userId: string, since: Date) {
  return prisma.smartMatchCache.findFirst({
    where: {
      userId,
      createdAt: { gte: since },
    },
  });
}

export async function dbGetCurrentUserProfile(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    include: {
      interests: { select: { name: true } },
      user: {
        select: {
          preferredGenders: true,
          preferredAgeMin: true,
          preferredAgeMax: true,
        },
      },
    },
  });
}

export async function dbSaveSmartMatchCache(userId: string, cacheData: any[]) {
  return prisma.smartMatchCache.create({
    data: {
      userId,
      matchData: JSON.stringify(cacheData),
    },
  });
}

export async function dbGetLikedProfiles(likedUserIds: string[]) {
  return prisma.member.findMany({
    where: { userId: { in: likedUserIds } },
    include: { interests: true },
  });
}

export async function dbGetUserLikesWithDetails(userId: string) {
  const likes = await prisma.like.findMany({
    where: { sourceUserId: userId },
    take: 50,
  });

  const targetUserIds = likes
    .map((like) => like.targetUserId)
    .filter(Boolean) as string[];

  const targetUsers = await prisma.member.findMany({
    where: { userId: { in: targetUserIds } },
    include: {
      interests: { select: { name: true } },
    },
  });

  return targetUsers;
}

export async function dbGetUserMessagesWithDetails(userId: string) {
  return prisma.message.findMany({
    where: { senderId: userId },
    include: {
      recipient: {
        select: {
          name: true,
          gender: true,
        },
      },
    },
    orderBy: { created: "desc" },
    take: 50,
  });
}

export async function dbGetMessageRecipients(recipientIds: string[]) {
  return prisma.member.findMany({
    where: {
      userId: {
        in: recipientIds,
      },
    },
    select: {
      userId: true,
      gender: true,
    },
  });
}

export async function dbGetUserInteractionsWithDetails(userId: string) {
  return prisma.userInteraction.findMany({
    where: { userId },
    include: {
      target: {
        select: {
          name: true,
          gender: true,
          city: true,
          dateOfBirth: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
    take: 100,
  });
}
