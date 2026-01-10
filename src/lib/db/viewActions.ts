import { prisma } from "@/lib/prisma";

export async function dbGetRecentProfileView(
  viewerId: string,
  viewedId: string,
  thresholdDate: Date
) {
  return prisma.profileView.findFirst({
    where: {
      viewerId,
      viewedId,
      viewedAt: {
        gt: thresholdDate,
      },
    },
  });
}

export async function dbUpsertProfileView(viewerId: string, viewedId: string) {
  return prisma.profileView.upsert({
    where: {
      viewerId_viewedId: {
        viewerId,
        viewedId,
      },
    },
    update: {
      viewedAt: new Date(),
      seen: false,
    },
    create: {
      viewerId,
      viewedId,
      viewedAt: new Date(),
      seen: false,
    },
  });
}

export async function dbGetProfileViews(userId: string) {
  return prisma.profileView.findMany({
    where: { viewedId: userId },
    orderBy: { viewedAt: "desc" },
    take: 50,
    include: {
      viewer: {
        select: {
          id: true,
          name: true,
          image: true,
          member: true,
        },
      },
    },
  });
}

export async function dbMarkProfileViewsAsSeen(userId: string) {
  return prisma.profileView.updateMany({
    where: {
      viewedId: userId,
      seen: false,
    },
    data: { seen: true },
  });
}
