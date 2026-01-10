"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { add } from "date-fns";
import { ActionResult } from "@/types";
import { createMessgae } from "./messageActions";
import { getSession } from "@/lib/session";
import { Story, StoryPrivacy, StoryWithUser } from "@/types/story";
import {
  dbCreateStory,
  dbCreateStoryReply,
  dbCreateStoryViews,
  dbDeleteStory,
  dbGetCurrentUserBasicInfo,
  dbGetStoryForDelete,
  dbGetStoryForMessage,
  dbGetStoryViews,
  dbGetStoryWithUserPremium,
  dbGetTodayStoryCount,
  dbGetUserForStoryDelete,
  dbGetUserPremiumStatus,
  dbGetUserStories,
  dbGetUsersWithStories,
} from "@/lib/db/storyActions";

export async function createStory(
  formData: FormData
): Promise<ActionResult<Story>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    const imageUrl = formData.get("imageUrl") as string;
    const publicId = formData.get("publicId") as string;
    const textOverlay = formData.get("textOverlay") as string;
    const textX = formData.get("textX")
      ? parseFloat(formData.get("textX") as string)
      : null;
    const textY = formData.get("textY")
      ? parseFloat(formData.get("textY") as string)
      : null;
    const filter = formData.get("filter") as string;
    const privacy = (formData.get("privacy") as StoryPrivacy) || "PUBLIC";

    if (!imageUrl) {
      return { status: "error", error: "Image URL is required" };
    }

    const user = await dbGetUserPremiumStatus(session.user.id);

    if (!user?.isPremium) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStoryCount = await dbGetTodayStoryCount(
        session.user.id,
        today,
        tomorrow
      );

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
      const story = await dbCreateStory({
        userId: session.user.id,
        imageUrl,
        publicId: publicId || null,
        textOverlay: textOverlay || null,
        textX,
        textY,
        filter: filter || null,
        privacy,
        expiresAt,
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
    const session = await getSession();
    if (!session?.user?.id) {
      return [];
    }

    try {
      // Get all users with stories
      const usersWithStories = await dbGetUsersWithStories(session.user.id);

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

      // Check if current user is in the list
      const currentUserInList = storyUsers.find((user) => user.isCurrentUser);

      if (!currentUserInList) {
        const currentUser = await dbGetCurrentUserBasicInfo(session.user.id);

        if (currentUser) {
          storyUsers.push({
            id: currentUser.id,
            name: currentUser.name || "Unknown",
            image: currentUser.image,
            hasUnviewedStories: false,
            totalStories: 0,
            isCurrentUser: true,
          });
        }
      }

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
    const session = await getSession();
    if (!session?.user?.id) {
      return [];
    }

    try {
      const stories = await dbGetUserStories(userId, session.user.id);

      const unviewedStoryIds = stories
        .filter((story) => story.views.length === 0)
        .map((story) => story.id);

      if (unviewedStoryIds.length > 0 && session.user.id) {
        await dbCreateStoryViews(
          unviewedStoryIds.map((storyId) => ({
            storyId,
            viewerId: session.user.id!,
          }))
        );

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
        textX: story.textX,
        textY: story.textY,
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
    const session = await getSession();
    if (!session?.user?.id) {
      return { status: "error", error: "Unauthorized" };
    }

    // TODO: Implement story reaction logic
    console.log(`Reacting to story ${storyId} with ${reactionType}`);

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

    const story = await dbGetStoryWithUserPremium(storyId);

    if (!story) {
      return { status: "error", error: "Story not found" };
    }

    if (story.userId !== session.user.id) {
      return { status: "error", error: "Access denied" };
    }

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

    const storyViews = await dbGetStoryViews(storyId);

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
    const session = await getSession();
    if (!session?.user?.id) {
      return { status: "error", error: "Not authenticated" };
    }

    const story = await dbGetStoryForMessage(storyId);

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

    await dbCreateStoryReply({
      storyId,
      senderId: session.user.id,
      recipientId: story.userId,
      messageText,
    });

    return { status: "success", data: "Message sent successfully!" };
  } catch (error) {
    console.error("Error sending story message:", error);
    return { status: "error", error: "Failed to send message" };
  }
}

export async function deleteStory(
  storyId: string
): Promise<ActionResult<string>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { status: "error", error: "לא מחובר" };
    }

    const user = await dbGetUserForStoryDelete(session.user.id);
    if (!user) {
      return { status: "error", error: "משתמש לא נמצא" };
    }

    // Check if story exists and belongs to user
    const story = await dbGetStoryForDelete(storyId);

    if (!story) {
      return { status: "error", error: "סטורי לא נמצא" };
    }

    if (story.userId !== user.id) {
      return { status: "error", error: "אין הרשאה למחוק סטורי זה" };
    }

    // Delete from database
    await dbDeleteStory(storyId);

    // Delete from Cloudinary if publicId exists
    if (story.publicId) {
      try {
        const { cloudinary } = await import("@/lib/cloudinary");
        await cloudinary.v2.uploader.destroy(story.publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete from Cloudinary:", cloudinaryError);
        // Don't fail the whole operation if Cloudinary deletion fails
      }
    }

    revalidatePath("/members");

    return { status: "success", data: "סטורי נמחק בהצלחה" };
  } catch (error) {
    console.error("Error deleting story:", error);
    return { status: "error", error: "שגיאה במחיקת הסטורי" };
  }
}
