"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { subMinutes } from "date-fns";

export async function recordProfileView(viewerId: string, viewedId: string) {
  if (!viewerId || viewerId === viewedId) return;

  try {
    const recentView = await prisma.profileView.findFirst({
      where: {
        viewerId,
        viewedId,
        viewedAt: {
          gt: subMinutes(new Date(), 1),
        },
      },
    });

    if (recentView) {
      return;
    }

    await prisma.profileView.upsert({
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

    await pusherServer.trigger(`private-${viewedId}`, "profile-viewed", {
      viewerId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to record profile view:", error);
  }
}

export async function getProfileViews(userId?: string) {
  if (!userId) {
    const session = await auth();
    userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");
  }

  try {
    const views = await prisma.profileView.findMany({
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

    return views.map((view) => ({
      ...view.viewer,
      viewedAt: view.viewedAt,
      seen: view.seen,
    }));
  } catch (error) {
    console.error("Failed to fetch profile views:", error);
    throw new Error("Failed to fetch profile views");
  }
}

export async function markProfileViewsAsSeen(userId: string) {
  if (!userId) throw new Error("User ID is required");

  try {
    await prisma.profileView.updateMany({
      where: {
        viewedId: userId,
        seen: false,
      },
      data: { seen: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to mark profile views as seen:", error);
    throw new Error("Failed to mark profile views as seen");
  }
}
