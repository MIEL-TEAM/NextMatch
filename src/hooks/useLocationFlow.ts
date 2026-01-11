import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrentUserLocationStatus } from "@/app/actions/memberActions";
import {
  checkLocationPermission,
  getCurrentLocation,
} from "@/lib/locationUtils";

import type { LocationData, StableLocationParams } from "@/types/members";

// Single localStorage key
const LOCATION_DISMISSED_AT_KEY = "miel_location_dismissed_at";
const DISMISSAL_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

function shouldShowBanner(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const dismissedAt = localStorage.getItem(LOCATION_DISMISSED_AT_KEY);
    if (!dismissedAt) return true; // Never dismissed

    const timestamp = parseInt(dismissedAt, 10);
    if (isNaN(timestamp)) return true;

    // Show if cooldown expired
    return Date.now() - timestamp > DISMISSAL_COOLDOWN;
  } catch {
    return true;
  }
}

function markDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_DISMISSED_AT_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error marking dismissed:", error);
  }
}

export function useLocationFlow() {
  const searchParams = useSearchParams();

  const [locationState, setLocationState] = useState<
    "loading" | "readyToQuery"
  >("loading");
  const [internalLocation, setInternalLocation] = useState<LocationData | null>(
    null
  );
  const [showLocationBanner, setShowLocationBanner] = useState(false);

  const rawLat = searchParams.get("userLat");
  const rawLon = searchParams.get("userLon");
  const rawRequestLocation = searchParams.get("requestLocation");

  const stableParams = useMemo<StableLocationParams>(
    () => ({
      userLat: rawLat,
      userLon: rawLon,
      hasLocation: Boolean(rawLat && rawLon),
      forceLocationPrompt: rawRequestLocation === "true",
    }),
    [rawLat, rawLon, rawRequestLocation]
  );

  const resetLocation = () => {
    setInternalLocation(null);
    setLocationState("loading");
    setShowLocationBanner(false);
  };

  // Main location resolution effect
  useEffect(() => {
    let cancelled = false;

    async function resolveLocation() {
      try {
        if (
          stableParams.hasLocation &&
          stableParams.userLat &&
          stableParams.userLon
        ) {
          if (!cancelled) {
            setInternalLocation({
              latitude: parseFloat(stableParams.userLat),
              longitude: parseFloat(stableParams.userLon),
            });
          }
          return true; // Has location
        }

        // 2. Check database
        const dbResult = await getCurrentUserLocationStatus();
        if (!cancelled && dbResult?.coordinates) {
          setInternalLocation(dbResult.coordinates);
          return true; // Has location
        }

        // 3. Try browser if permission already granted
        const hasPermission = await checkLocationPermission();
        if (!cancelled && hasPermission) {
          const browserResult = await getCurrentLocation();
          if (browserResult.granted && browserResult.coordinates) {
            setInternalLocation(browserResult.coordinates);
            return true; // Has location
          }
        }

        return false; // No location from any source
      } catch (error) {
        console.error("Error resolving location:", error);
        return false;
      }
    }

    async function initialize() {
      const hasLocation = await resolveLocation();

      if (cancelled) return;

      // Determine if we should show banner
      const forceShow = stableParams.forceLocationPrompt;
      const shouldShow = forceShow || (!hasLocation && shouldShowBanner());

      // Check browser permission for non-force scenarios
      if (shouldShow && !forceShow) {
        try {
          const hasPermission = await checkLocationPermission();
          if (hasPermission) {
            setShowLocationBanner(false);
            setLocationState("readyToQuery");
            return;
          }
        } catch (error) {
          console.error("Error checking location permission:", error);
        }
      }

      setShowLocationBanner(shouldShow);
      setLocationState("readyToQuery");
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [stableParams]);

  const handleLocationGranted = (coordinates: LocationData) => {
    setInternalLocation(coordinates);
    setShowLocationBanner(false);
  };

  const handleLocationDismissed = () => {
    markDismissed();
    setShowLocationBanner(false);
  };

  return {
    locationState,
    internalLocation,
    showLocationBanner,
    handleLocationGranted,
    handleLocationDismissed,
    stableParams,
    resetLocation,
  };
}
