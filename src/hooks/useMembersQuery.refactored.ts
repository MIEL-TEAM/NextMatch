import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetMemberParams } from "@/types";
import type { Member } from "@prisma/client";
import usePaginationStore from "./usePaginationStore";
import {
  useSearchPreferencesStore,
  selectGender,
  selectAgeRange,
  selectCity,
  selectInterests,
  selectWithPhoto,
  selectOrderBy,
  selectIsHydrated,
} from "@/stores/searchPreferencesStore";

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
  urlParamsString: string,
  options: QueryOptions = {},
) => {
  const isHydrated = useSearchPreferencesStore(selectIsHydrated);
  const gender = useSearchPreferencesStore(selectGender);
  const ageRange = useSearchPreferencesStore(selectAgeRange);
  const city = useSearchPreferencesStore(selectCity);
  const interests = useSearchPreferencesStore(selectInterests);
  const withPhoto = useSearchPreferencesStore(selectWithPhoto);
  const orderBy = useSearchPreferencesStore(selectOrderBy);

  const { pageNumber: storePageNumber, pageSize: storePageSize } =
    usePaginationStore((state) => state.pagination);

  const queryObj = useMemo((): GetMemberParams => {
    if (
      !isHydrated ||
      !gender ||
      !ageRange ||
      withPhoto === undefined ||
      !orderBy
    ) {
      return {
        gender: "male,female",
        ageRange: "18,65",
        orderBy: "updated",
        withPhoto: "false",
        pageNumber: "1",
        pageSize: "15",
      };
    }

    const urlParams = new URLSearchParams(urlParamsString);
    const urlPageNumber = urlParams.get("pageNumber") || urlParams.get("page");
    const urlUserLat = urlParams.get("userLat");
    const urlUserLon = urlParams.get("userLon");
    const urlDistance = urlParams.get("distance");
    const urlSortByDistance = urlParams.get("sortByDistance");

    const baseQuery: GetMemberParams = {
      gender: gender.join(","),
      ageRange: `${ageRange[0]},${ageRange[1]}`,
      orderBy: orderBy,
      withPhoto: withPhoto ? "true" : "false",
      pageNumber: storePageNumber?.toString() || urlPageNumber || "1",
      pageSize: storePageSize?.toString() || urlParams.get("pageSize") || "15",
    };

    const normalizedCity = normalizeCityForQuery(city || null);
    if (normalizedCity) {
      baseQuery.city = normalizedCity;
    }

    if (interests && interests.length > 0) {
      baseQuery.interests = interests;
    }

    if (options.userLocation) {
      baseQuery.userLat = options.userLocation.latitude.toString();
      baseQuery.userLon = options.userLocation.longitude.toString();
      baseQuery.sortByDistance = "true";
    } else if (urlUserLat && urlUserLon) {
      baseQuery.userLat = urlUserLat;
      baseQuery.userLon = urlUserLon;
      baseQuery.distance = urlDistance || undefined;
      baseQuery.sortByDistance = urlSortByDistance || "false";
    }

    return baseQuery;
  }, [
    isHydrated,
    gender,
    ageRange,
    city,
    interests,
    withPhoto,
    orderBy,
    storePageNumber,
    storePageSize,
    urlParamsString,
    options.userLocation,
  ]);

  const queryKey = useMemo(() => {
    const stableObj = Object.entries(queryObj)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return ["members", stableObj];
  }, [queryObj]);

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
