import SmartMatchesClient from "./SmartMatchesClient";
import { getSmartMatchesOrchestrator } from "@/lib/smart-matching/orchestrator";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import { getAuthUserId } from "@/lib/session";

export default async function SmartMatchesServerData() {
  const userId = await getAuthUserId();

  const [matchesResponse, likedIds] = await Promise.all([
    getSmartMatchesOrchestrator(userId),
    fetchCurrentUserLikeIds(),
  ]);

  return (
    <SmartMatchesClient
      matches={matchesResponse.items}
      likedIds={likedIds}
    />
  );
}
