"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMembersQuery } from "@/hooks/useMembersQuery";
import MembersLayout from "@/components/memberStyles/MembersLayout";
import EmptyState from "@/components/EmptyState";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import { useEffect, useState, useCallback, useRef } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import HeartLoading from "@/components/HeartLoading";
import {
  checkLocationPermission,
  getCurrentLocation,
} from "@/lib/locationUtils";

type LoadingState = "initial" | "location" | "data" | "ready";

export default function MembersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [likeIds, setLikeIds] = useState<string[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>("initial");

  const locationProcessedRef = useRef(false);
  const mountedRef = useRef(true);

  const userLat = searchParams.get("userLat");
  const userLon = searchParams.get("userLon");
  const hasLocationParams = Boolean(userLat && userLon);

  // Enable query when ready
  const queryEnabled = loadingState === "data" || hasLocationParams;
  const query = useMembersQuery(searchParams, { enabled: queryEnabled });

  // Fetch likes immediately
  useEffect(() => {
    fetchCurrentUserLikeIds()
      .then((ids) => {
        if (mountedRef.current) {
          setLikeIds(ids);
        }
      })
      .catch(console.warn);

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle location setup
  useEffect(() => {
    if (locationProcessedRef.current) return;

    const handleLocationSetup = async () => {
      if (hasLocationParams) {
        setLoadingState("data");

        locationProcessedRef.current = true;
        return;
      }

      setLoadingState("location");

      try {
        const hasPermission = await checkLocationPermission();

        if (hasPermission) {
          const location = await getCurrentLocation();

          if (location.granted && location.coordinates) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("userLat", location.coordinates.latitude.toString());
            params.set("userLon", location.coordinates.longitude.toString());
            params.set("sortByDistance", "true");

            router.replace(`${pathname}?${params.toString()}`, {
              scroll: false,
            });
          } else {
            setLoadingState("data");
          }
        } else {
          setShowLocationModal(true);
          setLoadingState("data");
        }
      } catch (error) {
        console.warn("Location error:", error);
        setLoadingState("data");
      }

      locationProcessedRef.current = true;
    };

    handleLocationSetup();
  }, [hasLocationParams, searchParams, router, pathname]);

  const handleLocationGranted = useCallback(
    (coordinates: { latitude: number; longitude: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("userLat", coordinates.latitude.toString());
      params.set("userLon", coordinates.longitude.toString());
      params.set("sortByDistance", "true");

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setShowLocationModal(false);
    },
    [searchParams, router, pathname]
  );

  // Update state when location params arrive
  useEffect(() => {
    if (hasLocationParams && loadingState === "location") {
      setLoadingState("data");
    }
  }, [hasLocationParams, loadingState]);

  // Update loading message based on query state
  useEffect(() => {
    if (query.isLoading && loadingState === "data") {
    }
  }, [query.isLoading, loadingState]);

  if (loadingState === "initial") {
    return null;
  }

  if (loadingState === "location") {
    return <HeartLoading message="מאתרים חברים בקרבתך" />;
  }

  if (query.isLoading && !query.data) {
    return <HeartLoading message="טוען פרופילים" />;
  }

  if (query.isError) {
    return <EmptyState message="שגיאה בטעינה" />;
  }

  if (!query.data) {
    return <HeartLoading message="טוען פרופילים..." />;
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
      <MembersLayout
        membersData={data}
        totalCount={totalCount}
        likeIds={likeIds}
        isOnlineFilter={isOnlineFilter}
        noResults={data.length === 0}
        hasSeenIntro={true}
      />

      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationGranted={handleLocationGranted}
      />
    </>
  );
}
