"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCurrentLocation,
  LocationPermissionResult,
} from "@/lib/locationUtils";
import { updateCurrentUserLocation } from "@/app/actions/memberActions";
import { useRouter, useSearchParams } from "next/navigation";
import useFilterStore from "@/hooks/useFilterStore";

interface LocationPermissionBannerProps {
  isVisible: boolean;
  onClose: () => void;
  onLocationGranted?: (coordinates: {
    latitude: number;
    longitude: number;
  }) => void;
}

export default function LocationPermissionBanner({
  isVisible,
  onClose,
  onLocationGranted,
}: LocationPermissionBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFilters } = useFilterStore();

  const handleEnableLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result: LocationPermissionResult = await getCurrentLocation();

      if (result.granted && result.coordinates) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("userLat", result.coordinates.latitude.toString());
        params.set("userLon", result.coordinates.longitude.toString());
        params.set("sortByDistance", "true");
        params.set("includeSelf", "true");

        setFilters("userLat", result.coordinates.latitude.toString());
        setFilters("userLon", result.coordinates.longitude.toString());
        setFilters("sortByDistance", "true");

        await updateCurrentUserLocation(
          result.coordinates.latitude,
          result.coordinates.longitude
        );

        const newUrl = `/members?${params.toString()}`;
        router.replace(newUrl);

        if (onLocationGranted) {
          onLocationGranted(result.coordinates);
        }
      } else {
        setError(result.error || "לא ניתן לקבל את המיקום");
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError("שגיאה בקבלת המיקום");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50"
        >
          <div className="bg-[#19172c] border border-[#292f46] rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500" />

            <div className="flex items-center gap-4 w-full sm:w-auto z-10">
              <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <h3
                  className="text-white font-medium text-sm sm:text-base text-right"
                  dir="rtl"
                >
                  {error ? (
                    <span className="text-red-400">{error}</span>
                  ) : (
                    "אפשר מיקום לתוצאות טובות יותר"
                  )}
                </h3>
                <p
                  className="text-gray-400 text-xs sm:text-sm text-right"
                  dir="rtl"
                >
                  {error
                    ? "נסה שוב או בדוק הגדרות דפדפן"
                    : "הצג אנשים בסביבתך ומיין לפי מרחק"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start z-10">
              <Button
                size="sm"
                variant="light"
                onPress={onClose}
                className="text-gray-400 hover:text-white min-w-0 px-3"
              >
                לא עכשיו
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/20"
                onPress={handleEnableLocation}
                isLoading={isLoading}
              >
                {isLoading ? "מאתר..." : "אפשר מיקום"}
              </Button>
            </div>

            <button
              onClick={onClose}
              className="absolute top-2 left-2 text-gray-500 hover:text-gray-300 sm:hidden"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
