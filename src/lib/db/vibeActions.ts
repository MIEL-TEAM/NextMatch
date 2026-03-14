import { prisma } from "@/lib/prisma";

export async function dbGetActiveVibeCounts() {
  return prisma.userVibe.groupBy({
    by: ["vibeKey"],
    where: { expiresAt: { gt: new Date() } },
    _count: { vibeKey: true },
  });
}

export async function dbGetUserActiveVibe(userId: string) {
  return prisma.userVibe.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    select: { vibeKey: true, expiresAt: true },
  });
}

export async function dbUpsertUserVibe(
  userId: string,
  vibeKey: string,
  expiresAt: Date
) {
  return prisma.userVibe.upsert({
    where: { userId },
    create: { userId, vibeKey, expiresAt },
    update: { vibeKey, expiresAt },
  });
}

export async function dbDeleteUserVibe(userId: string) {
  return prisma.userVibe.deleteMany({ where: { userId } });
}

export async function dbGetMemberVibes(userIds: string[]) {
  return prisma.userVibe.findMany({
    where: { userId: { in: userIds }, expiresAt: { gt: new Date() } },
    select: { userId: true, vibeKey: true },
  });
}
