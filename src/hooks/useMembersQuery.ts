import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetMemberParams } from "@/types";
import type { Member } from "@prisma/client";
import usePaginationStore from "./usePaginationStore";
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";

interface QueryOptions {
  enabled?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

function normalizeCityForQuery(city: string | null): string | undefined {
  if (!city) return undefined;
  const trimmed = city.split(",")[0].trim();
  return trimmed.length >= 2 ? trimmed : undefined;
}

export const useMembersQuery = (
  _urlParamsIgnored: string,
  options: QueryOptions = {},
) => {
  const isHydrated = useSearchPreferencesStore((state) => state.isHydrated);
  const preferences = useSearchPreferencesStore((state) => state.preferences);
  const discoveryMode = useSearchPreferencesStore(
    (state) => state.discoveryMode,
  );

  const { pageNumber: storePageNumber, pageSize: storePageSize } =
    usePaginationStore((state) => state.pagination);

  const queryObj = useMemo((): GetMemberParams => {
    const safePreferences = preferences || {
      gender: ["male", "female"],
      ageMin: 18,
      ageMax: 65,
      city: null,
      interests: [],
      withPhoto: true,
      orderBy: "updated",
    };

    const baseQuery: GetMemberParams = {
      gender: safePreferences.gender.join(","),
      ageRange: `${safePreferences.ageMin},${safePreferences.ageMax}`,
      orderBy: discoveryMode, // Strictly use discoveryMode
      withPhoto: safePreferences.withPhoto ? "true" : "false",
      pageNumber: storePageNumber?.toString() || "1",
      pageSize: storePageSize?.toString() || "15",
    };

    const normalizedCity = normalizeCityForQuery(safePreferences.city);
    if (normalizedCity) {
      baseQuery.city = normalizedCity;
    }

    if (safePreferences.interests && safePreferences.interests.length > 0) {
      baseQuery.interests = safePreferences.interests;
    }

    if (options.userLocation) {
      baseQuery.userLat = options.userLocation.latitude.toString();
      baseQuery.userLon = options.userLocation.longitude.toString();
      baseQuery.sortByDistance = "true";
    }

    return baseQuery;
  }, [
    preferences,
    discoveryMode,
    storePageNumber,
    storePageSize,
    options.userLocation,
  ]);

  const genderKey = preferences?.gender?.join(",") ?? "male,female";
  const ageMin = preferences?.ageMin ?? 18;
  const ageMax = preferences?.ageMax ?? 65;
  const cityKey = normalizeCityForQuery(preferences?.city ?? null) ?? "";
  const interestsKey = (preferences?.interests ?? []).join(",");
  const withPhoto = preferences?.withPhoto ?? true;

  const queryKey = useMemo(
    () => [
      "members",
      genderKey,
      ageMin,
      ageMax,
      cityKey,
      interestsKey,
      withPhoto,
      discoveryMode,
      storePageNumber ?? 1,
      storePageSize ?? 15,
      options.userLocation?.latitude ?? null,
      options.userLocation?.longitude ?? null,
    ],
    [
      genderKey,
      ageMin,
      ageMax,
      cityKey,
      interestsKey,
      withPhoto,
      discoveryMode,
      storePageNumber,
      storePageSize,
      options.userLocation?.latitude,
      options.userLocation?.longitude,
    ],
  );

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams();

      Object.entries(queryObj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, v));
        } else if (value !== undefined && value !== null) {
          query.append(key, value);
        }
      });

      const res = await fetch(`/api/members?${query.toString()}`, {
        signal,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch members: ${res.status}`);
      }

      return res.json() as Promise<{
        data: Array<{
          member: Member & { distance?: number };
          photos: { url: string; id: string }[];
          videos: { url: string; id: string }[];
        }>;
        totalCount: number;
      }>;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    retry: 1,
    gcTime: 0,
    enabled: options.enabled !== false && isHydrated,
    structuralSharing: true,
    throwOnError: false,
  });
};
