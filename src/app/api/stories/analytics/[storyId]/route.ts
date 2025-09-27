import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Get story analytics (Premium feature)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyId } = await params;

    // First, verify the story belongs to the current user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
        createdAt: true,
        user: {
          select: {
            isPremium: true,
            premiumUntil: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user has premium access
    const isPremiumActive =
      story.user.isPremium &&
      story.user.premiumUntil &&
      new Date(story.user.premiumUntil) > new Date();

    if (!isPremiumActive) {
      return NextResponse.json(
        {
          error: "Premium required",
          message:
            "Story analytics is a premium feature. Upgrade to see who viewed your stories!",
          requiresPremium: true,
        },
        { status: 402 }
      );
    }

    // Get story views with viewer information
    const storyViews = await prisma.storyView.findMany({
      where: {
        storyId: storyId,
      },
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
        viewedAt: "desc", // Most recent first
      },
    });

    // Format the response
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

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching story analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
