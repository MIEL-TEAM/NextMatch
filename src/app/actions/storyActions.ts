"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { add } from "date-fns";
import { ActionResult } from "@/types";
import { createMessgae } from "./messageActions";

type StoryPrivacy = "PUBLIC" | "PREMIUM" | "PRIVATE";

interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  publicId?: string | null;
  textOverlay?: string | null;
  filter?: string | null;
  privacy: StoryPrivacy;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface StoryWithUser extends Story {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  viewCount?: number;
  reactionCount?: number;
  hasViewed?: boolean;
}

export async function createStory(
  formData: FormData
): Promise<ActionResult<Story>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    const imageUrl = formData.get("imageUrl") as string;
    const publicId = formData.get("publicId") as string;
    const textOverlay = formData.get("textOverlay") as string;
    const filter = formData.get("filter") as string;
    const privacy = (formData.get("privacy") as StoryPrivacy) || "PUBLIC";

    if (!imageUrl) {
      return { status: "error", error: "Image URL is required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });

    if (!user?.isPremium) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStoryCount = await prisma.story.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (todayStoryCount >= 1) {
        return {
          status: "error",
          error:
            "Free users can only post 1 story per day. Upgrade to Premium for unlimited stories!",
        };
      }
    }

    const expiresAt = add(new Date(), { hours: 24 });

    try {
      const story = await prisma.story.create({
        data: {
          userId: session.user.id,
          imageUrl,
          publicId: publicId || null,
          textOverlay: textOverlay || null,
          filter: filter || null,
          privacy,
          expiresAt,
        },
      });

      revalidatePath("/members");

      try {
        const { pusherServer } = await import("@/lib/pusher");
        await pusherServer.trigger(
          `private-${session.user.id}`,
          "story:created",
          {
            storyId: story.id,
            userId: session.user.id,
            timestamp: new Date().toISOString(),
          }
        );
      } catch (pusherError) {
        console.warn("Failed to send story creation update:", pusherError);
      }

      return { status: "success", data: story as Story };
    } catch (prismaError) {
      console.error("Prisma error creating story:", prismaError);
      return {
        status: "error",
        error:
          "Database not ready. Please run: npx prisma migrate dev --name add_stories_feature",
      };
    }
  } catch (error) {
    console.error("Error creating story:", error);
    return { status: "error", error: "Failed to create story" };
  }
}

export async function getStoryUsers() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    try {
      const usersWithStories = await prisma.user.findMany({
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
                  viewerId: session.user.id,
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

      const storyUsers = usersWithStories.map((user) => {
        const hasUnviewedStories = user.stories.some(
          (story) => story.views.length === 0
        );

        return {
          id: user.id,
          name: user.name || "Unknown",
          image: user.image,
          hasUnviewedStories,
          totalStories: user.stories.length,
          isCurrentUser: user.id === session.user.id,
        };
      });

      storyUsers.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        if (a.hasUnviewedStories && !b.hasUnviewedStories) return -1;
        if (!a.hasUnviewedStories && b.hasUnviewedStories) return 1;
        return b.totalStories - a.totalStories;
      });

      return storyUsers;
    } catch (prismaError) {
      console.log("Database not ready for stories:", prismaError);
      return [];
    }
  } catch (error) {
    console.error("Error fetching story users:", error);
    return [];
  }
}

export async function getUserStories(userId: string): Promise<StoryWithUser[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    console.log("Getting stories for user:", userId);

    try {
      const stories = await prisma.story.findMany({
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
              viewerId: session.user.id,
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

      console.log(`Found ${stories.length} stories for user ${userId}`);

      const unviewedStoryIds = stories
        .filter((story) => story.views.length === 0)
        .map((story) => story.id);

      if (unviewedStoryIds.length > 0 && session.user.id) {
        await prisma.storyView.createMany({
          data: unviewedStoryIds.map((storyId) => ({
            storyId,
            viewerId: session.user.id!,
          })),
          skipDuplicates: true,
        });

        try {
          const { pusherServer } = await import("@/lib/pusher");
          await pusherServer.trigger(
            `private-${session.user.id}`,
            "story:viewed",
            {
              userId,
              storyIds: unviewedStoryIds,
              timestamp: new Date().toISOString(),
            }
          );
        } catch (pusherError) {
          console.warn("Failed to send story view update:", pusherError);
        }
      }

      const transformedStories = stories.map((story) => ({
        id: story.id,
        userId: story.userId,
        imageUrl: story.imageUrl,
        publicId: story.publicId,
        textOverlay: story.textOverlay,
        filter: story.filter,
        privacy: story.privacy as StoryPrivacy,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        isActive: story.isActive,
        user: story.user,
        viewCount: story._count.views,
        reactionCount: story._count.reactions,
        hasViewed: story.views.length > 0,
      }));

      return transformedStories;
    } catch (prismaError) {
      console.log("Database not ready for fetching stories:", prismaError);
      return [];
    }
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return [];
  }
}

export async function reactToStory(
  storyId: string,
  reactionType: string
): Promise<ActionResult<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    console.log("Reacting to story:", storyId, "with:", reactionType);
    return { status: "success", data: "Reaction added" };
  } catch (error) {
    console.error("Error reacting to story:", error);
    return { status: "error", error: "Failed to react to story" };
  }
}

export async function getStoryAnalytics(storyId: string): Promise<
  ActionResult<{
    storyId: string;
    totalViews: number;
    viewers: Array<{
      id: string;
      name: string;
      image: string | null;
      viewedAt: Date;
    }>;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Not authenticated" };
    }

    // Verify story ownership and premium status
    const story = await prisma.story.findUnique({
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

    if (!story) {
      return { status: "error", error: "Story not found" };
    }

    if (story.userId !== session.user.id) {
      return { status: "error", error: "Access denied" };
    }

    // Check premium access
    const isPremiumActive =
      story.user.isPremium &&
      story.user.premiumUntil &&
      new Date(story.user.premiumUntil) > new Date();

    if (!isPremiumActive) {
      return {
        status: "error",
        error: "Premium required",
        requiresPremium: true,
      };
    }

    // Get story views
    const storyViews = await prisma.storyView.findMany({
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

    const analytics = {
      storyId: story.id,
      totalViews: storyViews.length,
      viewers: storyViews.map((view) => ({
        id: view.viewer.id,
        name: view.viewer.name || "Unknown User",
        image: view.viewer.image,
        viewedAt: view.viewedAt,
      })),
    };

    return { status: "success", data: analytics };
  } catch (error) {
    console.error("Error fetching story analytics:", error);
    return { status: "error", error: "Failed to fetch analytics" };
  }
}

export async function sendStoryMessage(
  storyId: string,
  messageText: string
): Promise<ActionResult<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error", error: "Not authenticated" };
    }

    const story = await prisma.story.findUnique({
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

    if (!story) {
      return { status: "error", error: "Story not found" };
    }

    if (story.userId === session.user.id) {
      return { status: "error", error: "Cannot message yourself" };
    }

    const contextualMessage = `🖼️ הגיב/ה על הסטורי שלך: "${messageText}"\n\n📸 תמונת הסטורי: ${story.imageUrl}`;

    const result = await createMessgae(story.userId, {
      text: contextualMessage,
    });

    if (result.status === "error") {
      return { status: "error", error: "Failed to send message" };
    }

    await prisma.storyReply.create({
      data: {
        storyId,
        senderId: session.user.id,
        recipientId: story.userId,
        messageText,
      },
    });

    return { status: "success", data: "Message sent successfully!" };
  } catch (error) {
    console.error("Error sending story message:", error);
    return { status: "error", error: "Failed to send message" };
  }
}
