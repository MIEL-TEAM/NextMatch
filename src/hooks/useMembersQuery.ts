import { useQuery } from "@tanstack/react-query";
import type { GetMemberParams } from "@/types";
import type { Member } from "@prisma/client";

export const useMembersQuery = (params: URLSearchParams) => {
  // Get all parameters from URL and create stable query object
  const queryObj: GetMemberParams = {
    filter: params.get("filter") || "all",
    ageMin: params.get("ageMin") || undefined,
    ageMax: params.get("ageMax") || undefined,
    ageRange: params.get("ageRange") || "18,100",
    gender: params.get("gender") || "male,female",
    withPhoto: params.get("withPhoto") || "false",
    orderBy: params.get("orderBy") || "updated",
    city: params.get("city") || undefined,
    interests: params.getAll("interests") || [],
    onlineOnly: params.get("onlineOnly") === "true" ? "true" : "false",
    sort: params.get("sort") || "latest",
    pageNumber: params.get("pageNumber") || params.get("page") || "1",
    pageSize: params.get("pageSize") || "12",
    // Location parameters
    userLat: params.get("userLat") || undefined,
    userLon: params.get("userLon") || undefined,
    distance: params.get("distance") || undefined,
    sortByDistance: params.get("sortByDistance") || "false",
  };

  // Check if we have location parameters
  const hasLocationParams = queryObj.userLat && queryObj.userLon;

  // Create stable query key by sorting and filtering out undefined values
  const stableQueryObj = Object.entries(queryObj)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const queryKey = ["members", stableQueryObj];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const query = new URLSearchParams();

      Object.entries(queryObj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, v));
        } else if (value !== undefined) {
          query.append(key, value);
        }
      });

      const res = await fetch(`/api/members?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json() as Promise<{
        data: Array<{
          member: Member & { distance?: number };
          photos: { url: string; id: string }[];
          videos: { url: string; id: string }[];
        }>;
        totalCount: number;
      }>;
    },
    staleTime: hasLocationParams ? 1000 * 30 : 1000 * 60 * 5, // 30s for location, 5min for regular
    refetchOnWindowFocus: false, // Disable auto-refetch to prevent loops
    retry: 1,
    gcTime: 1000 * 60 * 10, // Keep data for 10 minutes
  });
};
