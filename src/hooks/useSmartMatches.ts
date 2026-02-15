"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSmartMatches } from "@/app/actions/smartMatchActions";
import { useCallback } from "react";

export function useSmartMatches(page: number, pageSize = 12) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["smartMatches", page, pageSize],
    queryFn: () => getSmartMatches(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refreshMatches = useCallback(async () => {
    queryClient.removeQueries({ queryKey: ["smartMatches"] });

    return queryClient.refetchQueries({
      queryKey: ["smartMatches", page, pageSize],
    });
  }, [page, pageSize, queryClient]);

  const forceRefreshWithAI = useCallback(async () => {
    try {
      const response = await fetch("/api/smart-matches/force-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
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
    refreshMatches,
    forceRefreshWithAI,
  };
}
