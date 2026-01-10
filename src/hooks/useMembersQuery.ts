import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetMemberParams } from "@/types";
import type { Member } from "@prisma/client";
import usePaginationStore from "./usePaginationStore";

interface QueryOptions {
  enabled?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

export const useMembersQuery = (
  paramsString: string,
  options: QueryOptions = {}
) => {
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

    // Base query object from URL params
    const baseObj = {
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

    // Merge in location from options (client state) if available
    // This overrides URL params if present, or adds them if missing
    if (options.userLocation) {
      return {
        ...baseObj,
        userLat: options.userLocation.latitude.toString(),
        userLon: options.userLocation.longitude.toString(),
        sortByDistance: "true",
      };
    }

    return baseObj;
  }, [paramsString, storePageNumber, storePageSize, options.userLocation]);

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
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
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
    staleTime: 0, // ✅ Always fetch fresh data
    refetchOnWindowFocus: true, // ✅ Refetch when tab is focused
    refetchOnReconnect: true, // ✅ Refetch on reconnect
    refetchOnMount: "always", // ✅ Always refetch on mount
    retry: 1,
    gcTime: 0, // ✅ Don't cache in memory
    enabled: options.enabled !== false,
    structuralSharing: true,
    throwOnError: false,
  });
};
