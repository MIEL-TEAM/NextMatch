import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
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

    if (memberIds.length === 0) {
      return NextResponse.json({ photos: {} });
    }

    const photos = await prisma.photo.findMany({
      where: {
        memberId: { in: memberIds },
      },
      select: {
        url: true,
        id: true,
        memberId: true,
      },
    });

    const photosByMemberId = photos.reduce<
      Record<string, Array<{ url: string; id: string }>>
    >((acc, photo) => {
      if (photo.memberId) {
        if (!acc[photo.memberId]) {
          acc[photo.memberId] = [];
        }
        acc[photo.memberId].push({ url: photo.url, id: photo.id });
      }
      return acc;
    }, {});

    memberIds.forEach((id) => {
      if (!photosByMemberId[id]) {
        photosByMemberId[id] = [];
      }
    });

    return NextResponse.json({ photos: photosByMemberId });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("API: Error fetching member photos:", error);
    }
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch member photos" }),
      { status: 500 }
    );
  }
}
