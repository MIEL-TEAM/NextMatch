import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST - React to a story
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { storyId, reactionType } = body;

    if (!storyId || !reactionType) {
      return NextResponse.json(
        { error: "Story ID and reaction type are required" },
        { status: 400 }
      );
    }

    // Verify story exists and is active
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        userId: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!story || !story.isActive || story.expiresAt < new Date()) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Don't allow users to react to their own stories
    if (story.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot react to your own story" },
        { status: 400 }
      );
    }

    // Create or update reaction
    const reaction = await prisma.storyReaction.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id,
        },
      },
      update: {
        reactionType,
      },
      create: {
        storyId,
        userId: session.user.id,
        reactionType,
      },
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch (error) {
    console.error("Error creating story reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove reaction from story
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    await prisma.storyReaction.delete({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting story reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
