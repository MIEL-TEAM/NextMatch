import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/app/actions/authActions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const memberIds = searchParams.get("ids")?.split(",") || [];

    console.log("API: Received request for photo IDs:", memberIds);

    if (memberIds.length === 0) {
      console.log("API: No member IDs provided, returning empty object");
      return NextResponse.json({ photos: {} });
    }

    const photos = await prisma.photo.findMany({
      where: {
        memberId: { in: memberIds },
        // Don't require approval for now to check if that's the issue
        // isApproved: true,
      },
      select: {
        url: true,
        id: true,
        memberId: true,
      },
    });

    console.log(`API: Found ${photos.length} photos for the requested members`);

    // Group photos by member ID
    const photosByMemberId = photos.reduce((acc, photo) => {
      if (!acc[photo.memberId]) {
        acc[photo.memberId] = [];
      }
      acc[photo.memberId].push({ url: photo.url, id: photo.id });
      return acc;
    }, {} as Record<string, Array<{ url: string; id: string }>>);

    // Add empty arrays for members with no photos
    memberIds.forEach((id) => {
      if (!photosByMemberId[id]) {
        photosByMemberId[id] = [];
      }
    });

    console.log(
      "API: Photos grouped by member ID:",
      Object.keys(photosByMemberId)
    );

    return NextResponse.json({ photos: photosByMemberId });
  } catch (error) {
    console.error("API: Error fetching member photos:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch member photos" }),
      { status: 500 }
    );
  }
}
