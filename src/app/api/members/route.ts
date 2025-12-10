import { NextResponse } from "next/server";
import { getMembers, getMembersWithPhotos } from "@/app/actions/memberActions";
import { getMemberVideosForCards } from "@/app/actions/videoActions";
import type { GetMemberParams } from "@/types";

export const dynamic = "force-dynamic"; // Ensure this route is always treated as dynamic

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Get all search parameters with better handling
  const ageRange = searchParams.get("ageRange");
  const gender = searchParams.get("gender");
  const withPhotoRaw = searchParams.get("withPhoto");
  const orderBy = searchParams.get("orderBy");
  const lastActive = searchParams.get("lastActive");

  // Normalize withPhoto to exact string literal "true" | "false"
  // Default to "true" only when param is missing (null)
  let withPhotoNormalized: "true" | "false";
  if (withPhotoRaw === null) {
    withPhotoNormalized = "true"; // Default on initial load
  } else {
    withPhotoNormalized = withPhotoRaw === "true" ? "true" : "false";
  }

  const params: GetMemberParams = {
    filter: searchParams.get("filter") || "all",
    ageMin: searchParams.get("ageMin") || undefined,
    ageMax: searchParams.get("ageMax") || undefined,
    ageRange: ageRange || "18,65",
    gender: gender || "male,female",
    pageNumber:
      searchParams.get("pageNumber") || searchParams.get("page") || "1",
    pageSize: searchParams.get("pageSize") || "12",
    orderBy: orderBy || "updated",
    sort: searchParams.get("sort") || undefined,
    withPhoto: withPhotoNormalized,
    onlineOnly: searchParams.get("onlineOnly") || "false",
    lastActive: lastActive || undefined,
    city: searchParams.get("city") || undefined,
    interests: searchParams.getAll("interests"),
    // Location parameters
    userLat: searchParams.get("userLat") || undefined,
    userLon: searchParams.get("userLon") || undefined,
    distance: searchParams.get("distance") || undefined,
    sortByDistance: searchParams.get("sortByDistance") || "false",
    includeSelf: searchParams.get("includeSelf") || undefined,
  };

  const { items: members, totalCount } = await getMembers(params);

  const memberIds = members.map((m) => m.userId);
  const photos = await getMembersWithPhotos(memberIds);
  const videos = await getMemberVideosForCards(memberIds);

  const data = members.map((member) => ({
    member: {
      ...member,
      distance: (member as any).distance,
    },
    photos: photos[member.userId] || [],
    videos: videos[member.userId] || [],
  }));

  return NextResponse.json({ data, totalCount });
}
