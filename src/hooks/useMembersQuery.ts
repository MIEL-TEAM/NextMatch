import { useQuery } from "@tanstack/react-query";
import type { GetMemberParams } from "@/types";

export const useMembersQuery = (params: URLSearchParams) => {
  const queryObj: GetMemberParams = {
    filter: params.get("filter") || "all",
    ageMin: params.get("ageMin") || undefined,
    ageMax: params.get("ageMax") || undefined,
    city: params.get("city") || undefined,
    interests: params.getAll("interests") || [],
    onlineOnly: params.get("onlineOnly") === "true" ? "true" : "false",
    sort: params.get("sort") || "latest",
    page: params.get("page") || "1",
  };

  const queryKey = ["members", JSON.stringify(queryObj)];

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
          member: any;
          photos: { url: string; id: string }[];
          videos: { url: string; id: string }[];
        }>;
        totalCount: number;
      }>;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
