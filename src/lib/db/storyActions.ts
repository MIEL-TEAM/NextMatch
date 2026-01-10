import { prisma } from "@/lib/prisma";
import { StoryPrivacy } from "@/types/story";

export async function dbGetUserPremiumStatus(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });
}

export async function dbGetTodayStoryCount(
  userId: string,
  today: Date,
  tomorrow: Date
) {
  return prisma.story.count({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
}

export async function dbCreateStory(data: {
  userId: string;
  imageUrl: string;
  publicId?: string | null;
  textOverlay?: string | null;
  textX?: number | null;
  textY?: number | null;
  filter?: string | null;
  privacy: StoryPrivacy;
  expiresAt: Date;
}) {
  return prisma.story.create({
    data: {
      userId: data.userId,
      imageUrl: data.imageUrl,
      publicId: data.publicId,
      textOverlay: data.textOverlay,
      textX: data.textX,
      textY: data.textY,
      filter: data.filter,
      privacy: data.privacy,
      expiresAt: data.expiresAt,
    },
  });
}

export async function dbGetUsersWithStories(viewerId: string) {
  return prisma.user.findMany({
    where: {
      stories: {
        some: {
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      stories: {
        where: {
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          views: {
            where: {
              viewerId,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      stories: {
        _count: "desc",
      },
    },
  });
}

export async function dbGetCurrentUserBasicInfo(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, image: true },
  });
}

export async function dbGetUserStories(userId: string, viewerId: string) {
  return prisma.story.findMany({
    where: {
      userId,
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      views: {
        where: {
          viewerId,
        },
      },
      _count: {
        select: {
          views: true,
          reactions: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function dbCreateStoryViews(
  data: { storyId: string; viewerId: string }[]
) {
  return prisma.storyView.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function dbGetStoryWithUserPremium(storyId: string) {
  return prisma.story.findUnique({
    where: { id: storyId },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          isPremium: true,
          premiumUntil: true,
        },
      },
    },
  });
}

export async function dbGetStoryViews(storyId: string) {
  return prisma.storyView.findMany({
    where: { storyId },
    include: {
      viewer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      viewedAt: "desc",
    },
  });
}

export async function dbGetStoryForMessage(storyId: string) {
  return prisma.story.findUnique({
    where: { id: storyId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function dbCreateStoryReply(data: {
  storyId: string;
  senderId: string;
  recipientId: string;
  messageText: string;
}) {
  return prisma.storyReply.create({
    data,
  });
}

export async function dbGetUserForStoryDelete(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function dbGetStoryForDelete(storyId: string) {
  return prisma.story.findUnique({
    where: { id: storyId },
    select: { userId: true, publicId: true },
  });
}

export async function dbDeleteStory(storyId: string) {
  return prisma.story.delete({
    where: { id: storyId },
  });
}
