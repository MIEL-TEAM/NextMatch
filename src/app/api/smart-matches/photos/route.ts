import { NextRequest, NextResponse } from "next/server";
import { getMemberPhotos } from "@/app/actions/memberActions";
import { getAuthUserId } from "@/app/actions/authActions";
import { redis } from "@/lib/redis";

const CACHE_TTL = 60 * 15;

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get member IDs from query
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "Member IDs required" },
        { status: 400 }
      );
    }

    const memberIds = idsParam.split(",");
    if (memberIds.length === 0) {
      return NextResponse.json({ photos: {} }, { status: 200 });
    }

    const cacheKey = `photos:${userId}:${memberIds.sort().join("-")}`;
    const cachedPhotos = await redis.get(cacheKey);

    if (cachedPhotos) {
      const parsedPhotos =
        typeof cachedPhotos === "string"
          ? JSON.parse(cachedPhotos)
          : cachedPhotos;

      return NextResponse.json(
        { photos: parsedPhotos },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=900",
          },
        }
      );
    }

    const photoPromises = memberIds.map((memberId) =>
      getMemberPhotos(memberId).then((photos) => ({
        memberId,
        photos: photos.map((photo) => ({
          url: photo.url,
          id: photo.id,
        })),
      }))
    );

    const photoResults = await Promise.all(photoPromises);

    const photosMap = photoResults.reduce((acc, item) => {
      if (item.photos.length > 0) {
        acc[item.memberId] = item.photos;
      }
      return acc;
    }, {} as Record<string, Array<{ url: string; id: string }>>);

    await redis.set(cacheKey, JSON.stringify(photosMap), { ex: CACHE_TTL });

    return NextResponse.json(
      { photos: photosMap },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=900",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching member photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch member photos" },
      { status: 500 }
    );
  }
}
