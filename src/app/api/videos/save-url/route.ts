import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { memberId, videoUrl } = body;

    // Verify the member belongs to the current user
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || member.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (videoUrl) {
      // Create a new video record
      const video = await prisma.video.create({
        data: {
          url: videoUrl,
          memberId: memberId,
        },
      });

      return NextResponse.json({
        success: true,
        videoUrl: video.url,
        videoId: video.id,
      });
    } else {
      // Delete all videos for this member (if videoUrl is null)
      await prisma.video.deleteMany({
        where: { memberId: memberId },
      });

      return NextResponse.json({
        success: true,
        videoUrl: null,
      });
    }
  } catch (error) {
    console.error("Error saving video:", error);
    return NextResponse.json(
      { error: "Failed to save video" },
      { status: 500 }
    );
  }
}
