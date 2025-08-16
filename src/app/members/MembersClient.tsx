"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMembersQuery } from "@/hooks/useMembersQuery";
import MembersLayout from "@/components/memberStyles/MembersLayout";
import EmptyState from "@/components/EmptyState";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import { useEffect, useState } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import {
  checkLocationPermission,
  getCurrentLocation,
} from "@/lib/locationUtils";

export default function MembersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = useMembersQuery(searchParams);
  const [likeIds, setLikeIds] = useState<string[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationProcessed, setLocationProcessed] = useState(false);

  useEffect(() => {
    fetchCurrentUserLikeIds().then(setLikeIds);
  }, []);

  useEffect(() => {
    console.log("🚀 MembersClient useEffect triggered", {
      locationProcessed,
      userLat: searchParams.get("userLat"),
      userLon: searchParams.get("userLon"),
    });

    if (locationProcessed) {
      return;
    }

    const userLat = searchParams.get("userLat");
    const userLon = searchParams.get("userLon");
    const hasLocationParams = Boolean(userLat && userLon);

    if (hasLocationParams) {
      setLocationProcessed(true);
      return;
    }

    setLocationProcessed(true);

    // Auto-get location
    (async () => {
      try {
        const hasPermission = await checkLocationPermission();

        if (hasPermission) {
          const location = await getCurrentLocation();

          if (location.granted && location.coordinates) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("userLat", location.coordinates.latitude.toString());
            params.set("userLon", location.coordinates.longitude.toString());
            params.set("sortByDistance", "true");
            const newUrl = `/members?${params.toString()}`;

            router.replace(newUrl);
          } else {
            setShowLocationModal(true);
          }
        } else {
          setShowLocationModal(true);
        }
      } catch (error) {
        console.log("💥 Location error:", error);
        setShowLocationModal(true);
      }
    })();
  }, [searchParams, router, locationProcessed]);

  if (query.isLoading && !query.isFetchedAfterMount) return null;

  if (query.isError) return <EmptyState message="שגיאה בטעינה" />;

  if (!query.data) return <EmptyState message="שגיאה בטעינה" />;

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
        onClose={() => {
          setShowLocationModal(false);
        }}
        onLocationGranted={(coordinates) => {
          console.log("✅ Location granted from modal:", coordinates);
          setShowLocationModal(false);
        }}
      />
    </>
  );
}
