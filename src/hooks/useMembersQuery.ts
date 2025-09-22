import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetMemberParams } from "@/types";
import type { Member } from "@prisma/client";

interface QueryOptions {
  enabled?: boolean;
}

export const useMembersQuery = (
  params: URLSearchParams,
  options: QueryOptions = {}
) => {
  const queryObj = useMemo(
    (): GetMemberParams => ({
      filter: params.get("filter") || "all",
      ageMin: params.get("ageMin") || undefined,
      ageMax: params.get("ageMax") || undefined,
      ageRange: params.get("ageRange") || "18,100",
      gender: params.get("gender") || "male,female",
      withPhoto: params.get("withPhoto") || "true",
      orderBy: params.get("orderBy") || "updated",
      city: params.get("city") || undefined,
      interests: params.getAll("interests") || [],
      onlineOnly: params.get("onlineOnly") === "true" ? "true" : "false",
      sort: params.get("sort") || "latest",
      pageNumber: params.get("pageNumber") || params.get("page") || "1",
      pageSize: params.get("pageSize") || "12",
      userLat: params.get("userLat") || undefined,
      userLon: params.get("userLon") || undefined,
      distance: params.get("distance") || undefined,
      sortByDistance: params.get("sortByDistance") || "false",
    }),
    [params]
  );

  const hasLocationParams = queryObj.userLat && queryObj.userLon;

  const stableQueryObj = useMemo(
    () =>
      Object.entries(queryObj)
        .filter(([, value]) => value !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    [queryObj]
  );

  const queryKey = ["members", stableQueryObj];

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams();

      Object.entries(queryObj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, v));
        } else if (value !== undefined) {
          query.append(key, value);
        }
      });

      const res = await fetch(`/api/members?${query.toString()}`, {
        signal,

        headers: {
          Accept: "application/json",
          "Cache-Control": "max-age=60",
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
    staleTime: hasLocationParams ? 1000 * 30 : 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    gcTime: 1000 * 60 * 5,
    enabled: options.enabled !== false,

    structuralSharing: true,
    throwOnError: false,
  });
};
