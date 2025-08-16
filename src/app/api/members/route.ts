import { NextResponse } from "next/server";
import { getMembers, getMembersWithPhotos } from "@/app/actions/memberActions";
import { getMemberVideosForCards } from "@/app/actions/videoActions";
import type { GetMemberParams } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Get all search parameters with better handling
  const ageRange = searchParams.get("ageRange");
  const gender = searchParams.get("gender");
  const withPhoto = searchParams.get("withPhoto");
  const orderBy = searchParams.get("orderBy");

  const params: GetMemberParams = {
    filter: searchParams.get("filter") || "all",
    ageMin: searchParams.get("ageMin") || undefined,
    ageMax: searchParams.get("ageMax") || undefined,
    ageRange: ageRange || "18,100",
    gender: gender || "male,female",
    pageNumber:
      searchParams.get("pageNumber") || searchParams.get("page") || "1",
    pageSize: searchParams.get("pageSize") || "12",
    orderBy: orderBy || "updated",
    sort: searchParams.get("sort") || undefined,
    withPhoto: withPhoto || "false",
    onlineOnly: searchParams.get("onlineOnly") || "false",
    city: searchParams.get("city") || undefined,
    interests: searchParams.getAll("interests"),
    // Location parameters
    userLat: searchParams.get("userLat") || undefined,
    userLon: searchParams.get("userLon") || undefined,
    distance: searchParams.get("distance") || undefined,
    sortByDistance: searchParams.get("sortByDistance") || "false",
    includeSelf: searchParams.get("includeSelf") || undefined,
  };

  console.log("🗺️ API Members request with location params:", {
    userLat: params.userLat,
    userLon: params.userLon,
    sortByDistance: params.sortByDistance,
    distance: params.distance,
  });

  const { items: members, totalCount } = await getMembers(params);

  console.log("📊 API returning:", {
    totalMembers: members.length,
    hasLocation: params.userLat && params.userLon,
    firstMemberDistance: members[0]?.distance,
    allDistances: members.map((m) => ({
      name: (m as any).name,
      distance: (m as any).distance,
    })),
  });

  const memberIds = members.map((m) => m.userId);
  const photos = await getMembersWithPhotos(memberIds);
  const videos = await getMemberVideosForCards(memberIds);

  const data = members.map((member) => ({
    member: {
      ...member,
      distance: (member as any).distance, // Preserve distance from memberActions
    },
    photos: photos[member.userId] || [],
    videos: videos[member.userId] || [],
  }));

  return NextResponse.json({ data, totalCount });
}
