import { useQuery } from "@tanstack/react-query";

export function useProfileViewsQuery() {
  return useQuery({
    queryKey: ["profileViews"],
    queryFn: async () => {
      const res = await fetch("/api/views");
      if (!res.ok) throw new Error("Failed to fetch profile views");
      const data = await res.json();
      return data.views as Array<{
        id: string;
        name: string;
        image?: string;
        member?: any;
        viewedAt: string;
        seen?: boolean;
      }>;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
