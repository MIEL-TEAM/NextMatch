import { useQuery } from "@tanstack/react-query";

export function useLikedMembersQuery(type: string) {
  return useQuery({
    queryKey: ["liked-members", type],
    queryFn: async () => {
      const res = await fetch(`/api/liked-members?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch liked members");
      return res.json() as Promise<{
        members: any[];
        likeIds: string[];
      }>;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
