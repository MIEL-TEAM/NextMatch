"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSmartMatches } from "@/app/actions/smartMatchActions";
import { useCallback } from "react";
import useFilterStore from "./useFilterStore";

export function useSmartMatches(page: number, pageSize = 12) {
  const queryClient = useQueryClient();
  const { filters } = useFilterStore();

  // Include filters in query key so it refreshes when filters change
  const query = useQuery({
    queryKey: [
      "smartMatches",
      page,
      pageSize,
      filters.gender,
      filters.ageRange,
    ],
    queryFn: () => {
      console.log(
        "🎯 Enhanced useSmartMatches - calling getSmartMatches with filters:",
        filters
      );
      return getSmartMatches(
        page.toString(),
        pageSize.toString(),
        filters.gender,
        filters.ageRange
      );
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Prefetch next page for better UX
  const prefetchNextPage = useCallback(() => {
    if (query.data?.totalCount && page * pageSize < query.data.totalCount) {
      queryClient.prefetchQuery({
        queryKey: ["smartMatches", page + 1, pageSize],
        queryFn: () =>
          getSmartMatches(
            (page + 1).toString(),
            pageSize.toString(),
            filters.gender,
            filters.ageRange
          ),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [
    page,
    pageSize,
    query.data?.totalCount,
    queryClient,
    filters.gender,
    filters.ageRange,
  ]);

  // Enhanced refresh function that clears all cache
  const refreshMatches = useCallback(async () => {
    // Clear all smart matches cache
    queryClient.removeQueries({ queryKey: ["smartMatches"] });

    // Force refresh current page
    return queryClient.refetchQueries({
      queryKey: ["smartMatches", page, pageSize],
    });
  }, [page, pageSize, queryClient]);

  // Force refresh with AI re-analysis
  const forceRefreshWithAI = useCallback(async () => {
    try {
      // Call API to force AI re-analysis
      const response = await fetch("/api/smart-matches/force-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Clear all cache and refetch
        queryClient.removeQueries({ queryKey: ["smartMatches"] });
        return queryClient.refetchQueries({
          queryKey: ["smartMatches", page, pageSize],
        });
      }
    } catch (error) {
      console.error("Force refresh error:", error);
      throw error;
    }
  }, [page, pageSize, queryClient]);

  return {
    ...query,
    prefetchNextPage,
    refreshMatches,
    forceRefreshWithAI,
  };
}
