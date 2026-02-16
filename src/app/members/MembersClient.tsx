"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";

import { useMembersQuery } from "@/hooks/useMembersQuery";
import { useLocationFlow } from "@/hooks/useLocationFlow";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";

import type { Session } from "next-auth";

import MembersLayout from "@/components/memberStyles/MembersLayout";
import EmptyState from "@/components/EmptyState";
import HeartLoading from "@/components/HeartLoading";
import LocationPermissionBanner from "@/components/LocationPermissionBanner";
import { StoriesContainer } from "@/components/stories/StoriesContainer";
import { useCopy } from "@/lib/copy";

export default function MembersClient({
  serverSession,
}: {
  serverSession: Session | null;
}) {
  console.log("RENDER MembersClient");

  const { t } = useCopy("empty_state");


  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentSession = serverSession;

  const {
    locationState,
    showLocationBanner,
    handleLocationGranted,
    handleLocationDismissed,
    stableParams,
    internalLocation,
  } = useLocationFlow();

  const [likeIds, setLikeIds] = useState<string[]>([]);
  const mountedRef = useRef(true);

  // 🔹 Query enabled only when hydration ready
  const queryEnabled = locationState === "readyToQuery";

  const queryOptions = useMemo(
    () => ({
      enabled: queryEnabled,
      userLocation: internalLocation,
    }),
    [queryEnabled, internalLocation]
  );

  const query = useMembersQuery(searchParams.toString(), queryOptions);

  // 🔹 Fetch like IDs (non-blocking)
  useEffect(() => {
    if (currentSession?.user?.id) {
      fetchCurrentUserLikeIds()
        .then((ids) => mountedRef.current && setLikeIds(ids))
        .catch(console.warn);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [currentSession?.user?.id]);

  // 🔹 Search mode detection
  const preferences = useSearchPreferencesStore((state) => state.preferences);
  const discoveryMode = useSearchPreferencesStore(
    (state) => state.discoveryMode
  );

  const isSearchMode = !!(
    preferences?.city ||
    (preferences?.interests && preferences.interests.length > 0)
  );



  // 🔥 NEW: Only show spinner if NO DATA exists
  if (!query.data && query.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <HeartLoading message="טוען פרופילים..." />
      </motion.div>
    );
  }

  if (!query.data) return null;

  const { data, totalCount } = query.data;
  const isOnlineFilter = discoveryMode === "activity";

  if (!data || (data.length === 0 && !isOnlineFilter)) {
    return (
      <EmptyState
        message={
          isSearchMode
            ? "לא נמצאו תוצאות לחיפוש זה"
            : t("members.no_results.header")
        }
        subMessage={
          isSearchMode
            ? "נסה לשנות את קריטריוני החיפוש"
            : t("members.no_results.subtitle")
        }
        icon
      />
    );
  }

  return (
    <>
      {/* Stories */}
      {currentSession?.user?.id && (
        <div className="mb-8 relative">
          <div className="w-screen px-2 pt-4">
            <StoriesContainer currentUserId={currentSession.user.id} />
          </div>
        </div>
      )}

      {/* Members Grid */}
      <MembersLayout
        membersData={data}
        totalCount={totalCount}
        likeIds={likeIds}
        isOnlineFilter={isOnlineFilter}
        noResults={data.length === 0}
        hasSeenIntro={true}
      />

      {/* Location Banner */}
      <LocationPermissionBanner
        isVisible={showLocationBanner}
        onClose={() => {
          handleLocationDismissed();

          if (stableParams.forceLocationPrompt) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("requestLocation");
            router.replace(`${pathname}?${params.toString()}`, {
              scroll: false,
            });
          }
        }}
        onLocationGranted={handleLocationGranted}
      />
    </>
  );
}
