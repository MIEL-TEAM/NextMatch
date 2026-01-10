import { prisma } from "@/lib/prisma";

export async function dbGetLikesWithTargetMember(userId: string) {
  return prisma.like.findMany({
    where: { sourceUserId: userId },
    include: { targetMember: true },
  });
}
