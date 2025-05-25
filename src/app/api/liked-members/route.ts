import {
  fetchLikedMembers,
  fetchCurrentUserLikeIds,
} from "@/app/actions/likeActions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "source";
  const members = await fetchLikedMembers(type);
  const likeIds = await fetchCurrentUserLikeIds();

  return NextResponse.json({ members, likeIds });
}
