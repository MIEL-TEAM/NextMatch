import { prisma } from "@/lib/prisma";

export const DAILY_LIKE_LIMIT = 3;

function todayMidnightIsrael(): Date {
  const now = new Date();
  const tz = "Asia/Jerusalem";

  const toMinutes = (parts: Intl.DateTimeFormatPart[]) => {
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return (h === 24 ? 0 : h) * 60 + m;
  };

  const opts = { hour: "numeric", minute: "numeric", hour12: false } as const;
  const ilMin = toMinutes(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).formatToParts(now),
  );
  const utcMin = toMinutes(
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).formatToParts(now),
  );

  let offsetMin = ilMin - utcMin;
  if (offsetMin < -720) offsetMin += 1440;
  if (offsetMin > 720) offsetMin -= 1440;

  const dateStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  const [y, mo, d] = dateStr.split("-").map(Number);

  return new Date(Date.UTC(y, mo - 1, d) - offsetMin * 60 * 1000);
}

export async function dbDeleteLike(userId: string, targetUserId: string) {
  return prisma.like.delete({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId: userId,
        targetUserId,
      },
    },
  });
}

export async function dbCreateLike(userId: string, targetUserId: string) {
  return prisma.like.create({
    data: {
      sourceUserId: userId,
      targetUserId,
    },
    select: {
      sourceMember: {
        select: {
          name: true,
          image: true,
          userId: true,
          gender: true,
        },
      },
      targetMember: {
        select: {
          city: true,
          interests: {
            select: { name: true },
            take: 1,
          },
        },
      },
    },
  });
}

export async function dbGetMutualLike(userId: string, targetUserId: string) {
  return prisma.like.findUnique({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId: targetUserId,
        targetUserId: userId,
      },
    },
  });
}

export async function dbGetMemberGender(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    select: { gender: true },
  });
}

export async function dbGetMemberNameImage(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    select: { name: true, image: true, gender: true },
  });
}

export async function dbGetUserEmailName(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
}

export async function dbGetLikeIds(userId: string) {
  return prisma.like.findMany({
    where: {
      sourceUserId: userId,
    },
    select: {
      targetUserId: true,
    },
  });
}

export async function dbGetSourceLikes(userId: string) {
  return prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetMember: true },
  });
}

export async function dbGetTargetLikes(userId: string) {
  return prisma.like.findMany({
    where: { targetUserId: userId },
    select: { sourceMember: true },
  });
}

export async function dbGetLikedUserIds(userId: string) {
  return prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });
}

export async function dbGetMutualLikesList(userId: string, likeIds: string[]) {
  return prisma.like.findMany({
    where: {
      AND: [
        {
          targetUserId: userId,
        },
        { sourceUserId: { in: likeIds } },
      ],
    },
    select: { sourceMember: true },
  });
}

export async function dbGetLikesCountToday(userId: string): Promise<number> {
  return prisma.like.count({
    where: {
      sourceUserId: userId,
      createdAt: { gte: todayMidnightIsrael() },
    },
  });
}

export async function dbGetUserPremiumStatus(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumUntil: true },
  });
}

export async function dbCreateLikeWithDailyLimit(
  userId: string,
  targetUserId: string,
) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.like.count({
      where: {
        sourceUserId: userId,
        createdAt: { gte: todayMidnightIsrael() },
      },
    });

    if (count >= DAILY_LIKE_LIMIT) {
      throw new Error("LIKE_LIMIT_REACHED");
    }

    return tx.like.create({
      data: { sourceUserId: userId, targetUserId },
      select: {
        sourceMember: {
          select: { name: true, image: true, userId: true, gender: true },
        },
        targetMember: {
          select: {
            city: true,
            interests: { select: { name: true }, take: 1 },
          },
        },
      },
    });
  });
}
