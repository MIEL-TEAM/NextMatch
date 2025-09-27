import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch users who have active stories for the carousel
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users with active stories
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

    // Transform data for carousel
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

    // Sort: current user first, then unviewed stories, then by story count
    storyUsers.sort((a, b) => {
      if (a.isCurrentUser) return -1;
      if (b.isCurrentUser) return 1;
      if (a.hasUnviewedStories && !b.hasUnviewedStories) return -1;
      if (!a.hasUnviewedStories && b.hasUnviewedStories) return 1;
      return b.totalStories - a.totalStories;
    });

    return NextResponse.json(storyUsers);
  } catch (error) {
    console.error("Error fetching story users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
