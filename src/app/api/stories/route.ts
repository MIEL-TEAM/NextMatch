import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { add } from "date-fns";

// GET - Fetch all active stories for the current user's feed
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stories = await prisma.story.findMany({
      where: {
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
        createdAt: "desc",
      },
    });

    // Group stories by user and add view status
    const storyGroups = stories.reduce(
      (groups, story) => {
        const userId = story.userId;
        if (!groups[userId]) {
          groups[userId] = {
            user: story.user,
            stories: [],
            hasUnviewedStories: false,
          };
        }

        const hasViewed = story.views.length > 0;
        groups[userId].stories.push({
          ...story,
          hasViewed,
        });

        if (!hasViewed) {
          groups[userId].hasUnviewedStories = true;
        }

        return groups;
      },
      {} as Record<string, any>
    );

    return NextResponse.json(Object.values(storyGroups));
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new story
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      imageUrl,
      publicId,
      textOverlay,
      filter,
      privacy = "PUBLIC",
    } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Check if user is premium for unlimited stories
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });

    // Check daily story limit for free users
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
        return NextResponse.json(
          {
            error:
              "Free users can only post 1 story per day. Upgrade to Premium for unlimited stories!",
          },
          { status: 403 }
        );
      }
    }

    // Create the story
    const expiresAt = add(new Date(), { hours: 24 });

    const story = await prisma.story.create({
      data: {
        userId: session.user.id,
        imageUrl,
        publicId,
        textOverlay,
        filter,
        privacy,
        expiresAt,
      },
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

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
