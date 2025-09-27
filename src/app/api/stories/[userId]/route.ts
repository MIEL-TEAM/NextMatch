import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch stories for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // Get user's active stories
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
        createdAt: "asc", // Show oldest first
      },
    });

    if (stories.length === 0) {
      return NextResponse.json({ error: "No stories found" }, { status: 404 });
    }

    // Mark stories as viewed (if not already viewed)
    const unviewedStoryIds = stories
      .filter((story) => story.views.length === 0)
      .map((story) => story.id);

    if (unviewedStoryIds.length > 0) {
      await prisma.storyView.createMany({
        data: unviewedStoryIds.map((storyId) => ({
          storyId,
          viewerId: session.user.id!,
        })),
        skipDuplicates: true,
      });
    }

    // Transform stories data
    const transformedStories = stories.map((story) => ({
      id: story.id,
      imageUrl: story.imageUrl,
      textOverlay: story.textOverlay,
      createdAt: story.createdAt.toISOString(),
      user: story.user,
      viewCount: story._count.views,
      reactionCount: story._count.reactions,
      hasViewed: story.views.length > 0,
    }));

    return NextResponse.json(transformedStories);
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
