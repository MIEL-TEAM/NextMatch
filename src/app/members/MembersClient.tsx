"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  const { t } = useCopy("empty_state");
  const [isClientReady, setIsClientReady] = useState(false);
  useEffect(() => setIsClientReady(true), []);

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
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  const mountedRef = useRef(true);

  // Smooth minimum loading time
  useEffect(() => {
    const t = setTimeout(() => setMinLoadingComplete(true), 600);
    return () => clearTimeout(t);
  }, []);

  const queryEnabled = locationState === "readyToQuery";
  const query = useMembersQuery(searchParams.toString(), {
    enabled: queryEnabled,
    userLocation: internalLocation,
  });

  // Fetch likes
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

  // Check if we're in search mode (must be before early returns)
  // Check if we're in search mode (must be before early returns)
  const preferences = useSearchPreferencesStore((state) => state.preferences);
  const discoveryMode = useSearchPreferencesStore(
    (state) => state.discoveryMode,
  );

  const searchCity = preferences?.city;
  const searchInterests = preferences?.interests;
  const isSearchMode = !!(
    searchCity ||
    (searchInterests && searchInterests.length > 0)
  );

  if (!isClientReady) return null;

  const fullyLoaded =
    locationState === "readyToQuery" &&
    minLoadingComplete &&
    query.isSuccess &&
    query.data;

  if (!fullyLoaded) {
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

  const { data, totalCount } = query.data;
  const isOnlineFilter = discoveryMode === "activity";

  if (!data || (data.length === 0 && !isOnlineFilter)) {
    return (
      <EmptyState
        message={isSearchMode ? "לא נמצאו תוצאות לחיפוש זה" : t("members.no_results.header")}
        subMessage={isSearchMode ? "נסה לשנות את קריטריוני החיפוש" : t("members.no_results.subtitle")}
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
          // User dismissed/skipped the modal - remember this choice
          handleLocationDismissed();

          // Clean up URL if this was a forced prompt
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
