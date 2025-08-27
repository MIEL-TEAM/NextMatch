"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMembersQuery } from "@/hooks/useMembersQuery";
import MembersLayout from "@/components/memberStyles/MembersLayout";
import EmptyState from "@/components/EmptyState";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const [isProcessingLocation, setIsProcessingLocation] = useState(false);

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
    setIsProcessingLocation(true);

    // Auto-get location with smooth loading
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

            // Add a small delay for smooth transition
            setTimeout(() => {
              router.replace(newUrl);
              setIsProcessingLocation(false);
            }, 800);
          } else {
            setIsProcessingLocation(false);
            setShowLocationModal(true);
          }
        } else {
          setIsProcessingLocation(false);
          setShowLocationModal(true);
        }
      } catch (error) {
        console.log("💥 Location error:", error);
        setIsProcessingLocation(false);
        setShowLocationModal(true);
      }
    })();
  }, [searchParams, router, locationProcessed]);

  // Show heart loading during location processing
  if (isProcessingLocation) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-4">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <motion.path
                d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454
                C30,20.335,16,28.261,16,28.261z"
                stroke="#FF8A00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(255, 138, 0, 0.3)"
                initial={{ pathLength: 0, opacity: 0.2 }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  pathLength: { duration: 1.5, ease: "easeInOut" },
                  opacity: { duration: 0.8 },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            </svg>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-orange-600 font-medium text-center"
          >
            מאתרים חברים בקרבתך...
          </motion.p>
        </div>
      </div>
    );
  }

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
          setIsProcessingLocation(true);

          // Add location params and redirect with smooth transition
          const params = new URLSearchParams(searchParams.toString());
          params.set("userLat", coordinates.latitude.toString());
          params.set("userLon", coordinates.longitude.toString());
          params.set("sortByDistance", "true");
          const newUrl = `/members?${params.toString()}`;

          setTimeout(() => {
            router.replace(newUrl);
            setIsProcessingLocation(false);
          }, 800);
        }}
      />
    </>
  );
}
