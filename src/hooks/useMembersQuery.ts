import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetMemberParams } from "@/types";
import type { Member } from "@prisma/client";
import usePaginationStore from "./usePaginationStore";

interface QueryOptions {
  enabled?: boolean;
}

export const useMembersQuery = (
  paramsString: string,
  options: QueryOptions = {}
) => {
  /**
   * Subscribe to pagination store for reactive updates.
   * 
   * CRITICAL: This ensures the query refetches immediately when pagination
   * changes, without waiting for URL sync to complete.
   * 
   * The store is the source of truth for pagination state, and URL is just
   * a reflection of that state (with a slight delay due to async updates).
   */
  const { pageNumber: storePageNumber, pageSize: storePageSize } =
    usePaginationStore((state) => state.pagination);

  const queryObj = useMemo((): GetMemberParams => {
    const params = new URLSearchParams(paramsString);
    const paramsMap = new Map<string, string>();

    // Collect all params
    const entries: [string, string][] = [];
    params.forEach((value, key) => {
      entries.push([key, value]);
      // Store last value for non-array params
      paramsMap.set(key, value);
    });

    // Get all interests values (can be multiple)
    const interests: string[] = [];
    entries.forEach(([key, value]) => {
      if (key === "interests") {
        interests.push(value);
      }
    });

    return {
      filter: paramsMap.get("filter") || "all",
      ageMin: paramsMap.get("ageMin") || undefined,
      ageMax: paramsMap.get("ageMax") || undefined,
      ageRange: paramsMap.get("ageRange") || "18,65",
      gender: paramsMap.get("gender") || "male,female",
      withPhoto: paramsMap.get("withPhoto") ?? undefined, // Pass through exact value, no defaulting
      orderBy: paramsMap.get("orderBy") || "updated",
      lastActive: paramsMap.get("lastActive") || undefined,
      city: paramsMap.get("city") || undefined,
      interests: interests.length > 0 ? interests : [],
      onlineOnly: paramsMap.get("onlineOnly") === "true" ? "true" : "false",
      sort: paramsMap.get("sort") || "latest",
      // Read pageNumber from Zustand store (reactive), fallback to URL, then default to "1"
      // This ensures immediate reactivity when user clicks pagination
      pageNumber:
        storePageNumber?.toString() ||
        paramsMap.get("pageNumber") ||
        paramsMap.get("page") ||
        "1",
      // Read pageSize from Zustand store first
      pageSize: storePageSize?.toString() || paramsMap.get("pageSize") || "12",
      userLat: paramsMap.get("userLat") || undefined,
      userLon: paramsMap.get("userLon") || undefined,
      distance: paramsMap.get("distance") || undefined,
      sortByDistance: paramsMap.get("sortByDistance") || "false",
    };
  }, [paramsString, storePageNumber, storePageSize]);

  const hasLocationParams = queryObj.userLat && queryObj.userLon;

  // Create stable query key - queryObj is now stable since it depends on paramsString
  const queryKey = useMemo(() => {
    // Sort entries for consistent key generation
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

      // Build query string from queryObj
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
