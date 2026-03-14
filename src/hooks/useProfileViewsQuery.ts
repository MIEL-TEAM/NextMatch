import { useQuery } from "@tanstack/react-query";

export type ProfileViewEntry = {
  id: string;
  name: string | null;
  image: string | null;
  viewedAt: string;
  seen: boolean;
};

export type ProfileViewsResult =
  | { restricted: true; views: [] }
  | { restricted: false; views: ProfileViewEntry[] };

export function useProfileViewsQuery() {
  return useQuery<ProfileViewsResult>({
    queryKey: ["profileViews"],
    queryFn: async () => {
      const res = await fetch("/api/views");
      if (!res.ok) throw new Error("Failed to fetch profile views");
      return res.json() as Promise<ProfileViewsResult>;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
