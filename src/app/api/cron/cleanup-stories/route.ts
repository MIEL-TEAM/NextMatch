import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// to clean up expired stories every hour

export async function POST() {
  try {
    console.log("🧹 Starting story cleanup job...");

    // Find expired stories
    const expiredStories = await prisma.story.findMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            isActive: false,
          },
        ],
      },
      select: {
        id: true,
        publicId: true,
        imageUrl: true,
      },
    });

    if (expiredStories.length === 0) {
      console.log("✅ No expired stories to clean up");
      return NextResponse.json({
        success: true,
        message: "No expired stories to clean up",
        cleaned: 0,
      });
    }

    console.log(
      `🗑️ Found ${expiredStories.length} expired stories to clean up`
    );

    // Delete from Cloudinary
    const cloudinaryDeletions = expiredStories
      .filter((story) => story.publicId)
      .map((story) => story.publicId!);

    if (cloudinaryDeletions.length > 0) {
      try {
        await cloudinary.api.delete_resources(cloudinaryDeletions);
        console.log(
          `☁️ Deleted ${cloudinaryDeletions.length} images from Cloudinary`
        );
      } catch (cloudinaryError) {
        console.error("❌ Error deleting from Cloudinary:", cloudinaryError);
        // Continue with database cleanup even if Cloudinary fails
      }
    }

    // Delete related records from database (cascade will handle most of this)
    const storyIds = expiredStories.map((story) => story.id);

    // Delete story views
    await prisma.storyView.deleteMany({
      where: {
        storyId: {
          in: storyIds,
        },
      },
    });

    // Delete story reactions
    await prisma.storyReaction.deleteMany({
      where: {
        storyId: {
          in: storyIds,
        },
      },
    });

    // Delete story replies
    await prisma.storyReply.deleteMany({
      where: {
        storyId: {
          in: storyIds,
        },
      },
    });

    // Delete the stories themselves
    await prisma.story.deleteMany({
      where: {
        id: {
          in: storyIds,
        },
      },
    });

    console.log(
      `✅ Successfully cleaned up ${expiredStories.length} expired stories`
    );

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${expiredStories.length} expired stories`,
      cleaned: expiredStories.length,
      cloudinaryDeleted: cloudinaryDeletions.length,
    });
  } catch (error) {
    console.error("❌ Story cleanup job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Story cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET() {
  return POST();
}
