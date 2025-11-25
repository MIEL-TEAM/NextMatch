"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useServerSession } from "@/contexts/SessionContext";
import { motion } from "framer-motion";

import { useMembersQuery } from "@/hooks/useMembersQuery";
import { useLocationFlow } from "@/hooks/useLocationFlow";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";

import type { Session } from "next-auth";

import MembersLayout from "@/components/memberStyles/MembersLayout";
import EmptyState from "@/components/EmptyState";
import HeartLoading from "@/components/HeartLoading";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { StoriesContainer } from "@/components/stories/StoriesContainer";

export default function MembersClient({
  serverSession,
}: {
  serverSession: Session | null;
}) {
  const [isClientReady, setIsClientReady] = useState(false);
  useEffect(() => setIsClientReady(true), []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { session: clientSession } = useServerSession();
  const currentSession = serverSession || clientSession;

  const {
    locationState,
    showLocationModal,
    setShowLocationModal,
    handleLocationGranted,
    stableParams,
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
  const isOnlineFilter =
    searchParams.get("filter") === "online" ||
    searchParams.get("onlineOnly") === "true";

  if (!data || (data.length === 0 && !isOnlineFilter)) {
    return (
      <EmptyState
        message="לא נמצאו תוצאות בטווח הגילאים שבחרת"
        subMessage="נסה/י להרחיב את טווח הגילאים או לשנות את הגדרות הסינון"
        icon
      />
    );
  }

  return (
    <>
      {/* Stories */}
      {currentSession?.user?.id && (
        <div className="mb-8 relative">
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
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

      {/* Location Modal */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
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
