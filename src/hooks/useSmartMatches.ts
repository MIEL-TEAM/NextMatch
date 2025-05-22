"use client";

import { useQuery } from "@tanstack/react-query";
import { getSmartMatches } from "@/app/actions/smartMatchActions";

export function useSmartMatches(page: number, pageSize = 12) {
  return useQuery({
    queryKey: ["smartMatches", page],
    queryFn: () => getSmartMatches(page.toString(), pageSize.toString()),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
