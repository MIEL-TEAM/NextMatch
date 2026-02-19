"use client";

import { useSearchParams } from "next/navigation";
import { useMembersQuery } from "@/hooks/useMembersQuery";
import MembersLayout from "@/components/memberStyles/MembersLayout";
import MembersPageSkeleton from "@/components/memberStyles/MembersPageSkeleton";
import EmptyState from "@/components/EmptyState";
import { useCopy } from "@/lib/copy";
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useMemo } from "react";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import { LocationData } from "@/types/members";

interface MembersDataProps {
    location: LocationData | null;
    locationState: "loading" | "readyToQuery";
}

export default function MembersData({ location, locationState }: MembersDataProps) {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { t } = useCopy("empty_state");
    const [likeIds, setLikeIds] = useState<string[]>([]);
    const mountedRef = useRef(true);

    const preferences = useSearchPreferencesStore((state) => state.preferences);
    const discoveryMode = useSearchPreferencesStore(
        (state) => state.discoveryMode
    );

    const isSearchMode = !!(
        preferences?.city ||
        (preferences?.interests && preferences.interests.length > 0)
    );

    const queryEnabled = locationState === "readyToQuery";

    const queryOptions = useMemo(
        () => ({
            enabled: queryEnabled,
            userLocation: location,
        }),
        [queryEnabled, location]
    );

    const query = useMembersQuery(searchParams.toString(), queryOptions);

    useEffect(() => {
        if (session?.user?.id) {
            fetchCurrentUserLikeIds()
                .then((ids) => mountedRef.current && setLikeIds(ids))
                .catch(console.warn);
        }
        return () => {
            mountedRef.current = false;
        };
    }, [session?.user?.id]);

    if (query.isLoading) {
        return <MembersPageSkeleton />;
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

    // Success State
    return (
        <MembersLayout
            membersData={data}
            totalCount={totalCount}
            likeIds={likeIds}
            isOnlineFilter={isOnlineFilter}
            noResults={data.length === 0}
            hasSeenIntro={true}
        />
    );
}
