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

  // Hard filter only for gender (as requested)
  if (filters?.gender?.length) {
    whereClause.gender = { in: filters.gender };
  }

  // Removed strict age filtering to allow soft scoring.
  // We fetch a larger pool to ensure stability.

  return prisma.member.findMany({
    where: whereClause,
    include: {
      interests: { select: { name: true } },
      user: { select: { emailVerified: true, oauthVerified: true } },
      photos: true,
    },
    orderBy: { created: "desc" }, // Prioritize fresh users
    take: 300, // Increased from 50 to 300 for stable pool
  });
}

export async function getRandomCandidates(userId: string) {
  return prisma.member.findMany({
    where: { userId: { not: userId } },
    include: {
      interests: { select: { name: true } },
      user: { select: { emailVerified: true, oauthVerified: true } },
      photos: true,
    },
    orderBy: { created: "desc" },
    take: 12,
  });
}
