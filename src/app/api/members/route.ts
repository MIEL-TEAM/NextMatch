import { NextResponse } from "next/server";
import { getMembers, getMembersWithPhotos } from "@/app/actions/memberActions";
import { getMemberVideosForCards } from "@/app/actions/videoActions";
import type { GetMemberParams } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const params: GetMemberParams = {
    filter: searchParams.get("filter") || "all",
    ageMin: searchParams.get("ageMin") || undefined,
    ageMax: searchParams.get("ageMax") || undefined,
    ageRange: searchParams.get("ageRange") || undefined,
    gender: searchParams.get("gender") || undefined,
    pageNumber:
      searchParams.get("pageNumber") || searchParams.get("page") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
    sort: searchParams.get("sort") || undefined,
    withPhoto: searchParams.get("withPhoto") || undefined,
    onlineOnly: searchParams.get("onlineOnly") || undefined,
    city: searchParams.get("city") || undefined,
    interests: searchParams.getAll("interests"),
  };

  const { items: members, totalCount } = await getMembers(params);
  const memberIds = members.map((m) => m.userId);
  const photos = await getMembersWithPhotos(memberIds);
  const videos = await getMemberVideosForCards(memberIds);

  const data = members.map((member) => ({
    member,
    photos: photos[member.userId] || [],
    videos: videos[member.userId] || [],
  }));

  return NextResponse.json({ data, totalCount });
}
