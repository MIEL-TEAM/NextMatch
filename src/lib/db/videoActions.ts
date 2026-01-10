import { prisma } from "@/lib/prisma";

export async function dbGetMemberVideos(memberId: string) {
  return prisma.video.findMany({
    where: { memberId },
    orderBy: { createdAt: "desc" },
  });
}

export async function dbGetVideosForMembers(memberIds: string[]) {
  return prisma.video.findMany({
    where: {
      member: {
        userId: {
          in: memberIds,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      member: {
        select: {
          userId: true,
        },
      },
    },
  });
}
