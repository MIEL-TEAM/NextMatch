import { getSession } from "@/lib/session";
import {
  getMembers,
  getMembersWithPhotos,
  getCurrentUserLocationStatus,
} from "@/app/actions/memberActions";
import { getMemberVideosForCards } from "@/app/actions/videoActions";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import { dbGetUserSearchPreferences } from "@/app/actions/userSearchPreferenceActions";
import { dbGetMemberVibes } from "@/lib/db/vibeActions";
import { VIBE_LABEL } from "@/lib/vibes";
import MembersLayout from "@/components/memberStyles/MembersLayout";
import type { GetMemberParams } from "@/types";
import type { DiscoveryMode, MemberWithMedia } from "@/types/members";

function normalizeCityForQuery(city: string | null): string | undefined {
  if (!city) return undefined;
  const trimmed = city.split(",")[0].trim();
  return trimmed.length >= 2 ? trimmed : undefined;
}

const VALID_MODES: DiscoveryMode[] = ["smart", "activity", "newest", "distance"];
const DEFAULT_PAGE_SIZE = 15;

interface MembersServerDataProps {
  searchParams: { mode?: string; page?: string };
}

export default async function MembersServerData({
  searchParams,
}: MembersServerDataProps) {
  const mode: DiscoveryMode = VALID_MODES.includes(
    searchParams.mode as DiscoveryMode
  )
    ? (searchParams.mode as DiscoveryMode)
    : "smart";

  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const session = await getSession();
  const userId = session?.user?.id ?? null;

  // ── Parallel: preferences + location ────────────────────────────────────────
  const [preferences, locationStatus] = await Promise.all([
    userId
      ? dbGetUserSearchPreferences(userId).catch(() => null)
      : Promise.resolve(null),
    getCurrentUserLocationStatus().catch(() => null),
  ]);

  const coordinates = locationStatus?.coordinates ?? null;

  // ── Build query params (mirrors useMembersQuery logic) ──────────────────────
  const ageMin = preferences?.ageMin ?? 18;
  const ageMax = preferences?.ageMax ?? 65;
  const gender = preferences?.gender?.join(",") ?? "male,female";
  const city = normalizeCityForQuery(preferences?.city ?? null);
  const interests = preferences?.interests ?? [];
  const withPhoto: "true" | "false" =
    preferences?.withPhoto === false ? "false" : "true";

  const params: GetMemberParams = {
    ageRange: `${ageMin},${ageMax}`,
    gender,
    orderBy: mode,
    withPhoto,
    pageNumber: page.toString(),
    pageSize: DEFAULT_PAGE_SIZE.toString(),
    ...(city ? { city } : {}),
    ...(interests.length > 0 ? { interests } : {}),
    ...(coordinates
      ? {
          userLat: coordinates.latitude.toString(),
          userLon: coordinates.longitude.toString(),
          sortByDistance: "true",
        }
      : { sortByDistance: "false" }),
  };

  // ── Fetch members ────────────────────────────────────────────────────────────
  const { items: members, totalCount } = await getMembers(params);

  const memberIds = members.map((m) => m.userId);

  // ── Fetch media + likes + vibes in parallel ──────────────────────────────────
  const [photos, videos, likeIds, vibeRows] = await Promise.all([
    getMembersWithPhotos(memberIds),
    getMemberVideosForCards(memberIds),
    userId
      ? fetchCurrentUserLikeIds().catch(() => [] as string[])
      : Promise.resolve([] as string[]),
    dbGetMemberVibes(memberIds),
  ]);

  const memberVibes: Record<string, string> = {};
  for (const row of vibeRows) {
    memberVibes[row.userId] = VIBE_LABEL[row.vibeKey] ?? row.vibeKey;
  }

  const membersData = members.map((member) => ({
    member: {
      ...member,
      distance: (member as any).distance as number | undefined,
    } as unknown as MemberWithMedia["member"],
    photos: photos[member.userId] ?? [],
    videos: videos[member.userId] ?? [],
  })) satisfies MemberWithMedia[];

  return (
    <MembersLayout
      membersData={membersData}
      totalCount={totalCount}
      likeIds={likeIds}
      mode={mode}
      noResults={membersData.length === 0}
      hasSeenIntro={true}
      currentUserId={userId ?? undefined}
      memberVibes={memberVibes}
    />
  );
}
