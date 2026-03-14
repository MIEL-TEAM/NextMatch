import { prisma } from "@/lib/prisma";

export async function getPotentialCandidates(
  userId: string,
  excludeIds: string[],
  filters?: {
    gender?: string[];
    ageRange?: number[];
  },
) {
  const whereClause: any = {
    userId: { notIn: [userId, ...excludeIds] },
  };

  if (filters?.gender?.length) {
    whereClause.gender = { in: filters.gender };
  }

  return prisma.member.findMany({
    where: whereClause,
    include: {
      interests: { select: { name: true } },
      user: { select: { emailVerified: true, oauthVerified: true } },
      photos: { take: 1, orderBy: { isApproved: "desc" } },
    },
    orderBy: { created: "desc" },
    take: 300,
  });
}

export async function getRandomCandidates(userId: string) {
  return prisma.member.findMany({
    where: { userId: { not: userId } },
    include: {
      interests: { select: { name: true } },
      user: { select: { emailVerified: true, oauthVerified: true } },
      photos: { take: 1, orderBy: { isApproved: "desc" } },
    },
    orderBy: { created: "desc" },
    take: 12,
  });
}
