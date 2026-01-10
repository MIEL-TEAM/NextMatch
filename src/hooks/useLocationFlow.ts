import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCurrentUserLocationStatus } from "@/app/actions/memberActions";
import {
  checkLocationPermission,
  getCurrentLocation,
} from "@/lib/locationUtils";

import type {
  LocationState,
  LocationData,
  DbLocationStatus,
  StableLocationParams,
} from "@/types/members";

const LOCATION_FLOW_KEY = "miel_location_flow_completed";
const LOCATION_USER_DISMISSED_KEY = "miel_location_user_dismissed";
const LOCATION_PERMISSION_GRANTED_KEY = "miel_location_permission_granted";

function hasCompletedLocationFlow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Check localStorage first (persists across sessions)
    const completed = localStorage.getItem(LOCATION_FLOW_KEY) === "true";
    // Also check sessionStorage as fallback for current session
    const sessionCompleted =
      sessionStorage.getItem(LOCATION_FLOW_KEY) === "true";
    return completed || sessionCompleted;
  } catch {
    return false;
  }
}

function markLocationFlowCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_FLOW_KEY, "true");
    sessionStorage.setItem(LOCATION_FLOW_KEY, "true");
  } catch {
    // Silently fail if storage is not available
  }
}

function hasUserDismissedLocationModal(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOCATION_USER_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function markUserDismissedLocationModal(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_USER_DISMISSED_KEY, "true");
  } catch (error) {
    console.error("Error marking user dismissed location modal:", error);
  }
}

function savePermissionState(granted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LOCATION_PERMISSION_GRANTED_KEY,
      granted ? "true" : "false"
    );
  } catch (error) {
    console.error("Error saving permission state:", error);
  }
}

function wasPreviouslyGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOCATION_PERMISSION_GRANTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function useLocationFlow() {
  const searchParams = useSearchParams();

  const routerRef = useRef(useRouter());
  const pathnameRef = useRef(usePathname());

  routerRef.current = useRouter();
  pathnameRef.current = usePathname();

  const [locationState, setLocationState] = useState<LocationState>("initial");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [internalLocation, setInternalLocation] = useState<LocationData | null>(
    null
  );

  const visitedStatesRef = useRef<Set<LocationState>>(new Set());
  const dbLocationRef = useRef<DbLocationStatus | null>(null);
  const browserLocationRef = useRef<LocationData | null>(null);
  const locationStartRef = useRef<number | null>(null);
  const isFirstMountRef = useRef(true);
  const hasInitializedRef = useRef(false);

  const rawLat = searchParams.get("userLat");
  const rawLon = searchParams.get("userLon");
  const rawRequestLocation = searchParams.get("requestLocation");

  const stableParams = useMemo<StableLocationParams>(() => {
    return {
      userLat: rawLat,
      userLon: rawLon,
      hasLocation: Boolean(rawLat && rawLon),
      forceLocationPrompt: rawRequestLocation === "true",
    };
  }, [rawLat, rawLon, rawRequestLocation]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transitionToStateRef = useRef((newState: LocationState) => {
    // Placeholder
  });

  transitionToStateRef.current = (newState: LocationState) => {
    if (!visitedStatesRef.current.has(newState)) {
      visitedStatesRef.current.add(newState);
      setLocationState(newState);
    }
  };

  const transitionToState = (newState: LocationState) => {
    transitionToStateRef.current(newState);
  };

  // Initialize state machine
  useEffect(() => {
    if (locationState !== "initial" || hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    locationStartRef.current = Date.now();

    // ✅ CRITICAL FIX: If we have URL params AND we've completed flow before,
    // skip the entire state machine to prevent remount cycles
    if (
      stableParams.hasLocation &&
      stableParams.userLat &&
      stableParams.userLon &&
      hasCompletedLocationFlow()
    ) {
      setInternalLocation({
        latitude: parseFloat(stableParams.userLat),
        longitude: parseFloat(stableParams.userLon),
      });
      visitedStatesRef.current.add("readyToQuery");
      setLocationState("readyToQuery");
      return;
    }

    transitionToState("checkingUrlLocation");
  }, [locationState, stableParams]);

  // Timeout fallback
  useEffect(() => {
    if (locationState === "initial" || locationState === "readyToQuery") return;

    const timeout = setTimeout(() => {
      transitionToState("noLocationAvailable");
    }, 8000);

    return () => clearTimeout(timeout);
  }, [locationState]);

  // Check URL params
  useEffect(() => {
    if (locationState !== "checkingUrlLocation") return;

    if (
      stableParams.hasLocation &&
      stableParams.userLat &&
      stableParams.userLon
    ) {
      setInternalLocation({
        latitude: parseFloat(stableParams.userLat),
        longitude: parseFloat(stableParams.userLon),
      });
      transitionToState("readyToQuery");
      return;
    }

    transitionToState("checkingDbLocation");
  }, [locationState, stableParams]);

  // Check DB location
  useEffect(() => {
    if (locationState !== "checkingDbLocation") return;

    let cancelled = false;

    const run = async () => {
      try {
        if (isFirstMountRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          isFirstMountRef.current = false;
        }

        const dbRes = await Promise.race([
          getCurrentUserLocationStatus(),
          new Promise<DbLocationStatus>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  hasLocation: false,
                  locationEnabled: false,
                  coordinates: null,
                }),
              2000
            )
          ),
        ]);

        if (cancelled) return;

        dbLocationRef.current = dbRes;

        if (stableParams.forceLocationPrompt) {
          transitionToState("noLocationAvailable");
          return;
        }

        if (!dbRes.hasLocation || !dbRes.locationEnabled) {
          transitionToState("noLocationAvailable");
          return;
        }

        transitionToState("requestingBrowserPermission");
      } catch {
        if (!cancelled) transitionToState("noLocationAvailable");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [locationState, stableParams.forceLocationPrompt]);

  // Check browser permission
  useEffect(() => {
    if (locationState !== "requestingBrowserPermission") return;

    let cancelled = false;

    const run = async () => {
      try {
        // Check actual browser permission state
        const hasPermission = await Promise.race([
          checkLocationPermission(),
          new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), 1000)
          ),
        ]);

        if (cancelled) return;

        if (hasPermission) {
          // Permission already granted - save state and get location
          savePermissionState(true);
          transitionToState("gettingBrowserLocation");
        } else {
          // No permission - use DB location
          savePermissionState(false);
          transitionToState("usingDbLocation");
        }
      } catch {
        if (!cancelled) transitionToState("usingDbLocation");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [locationState]);

  // Get browser location
  useEffect(() => {
    if (locationState !== "gettingBrowserLocation") return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await Promise.race([
          getCurrentLocation(),
          new Promise<{ granted: boolean; coordinates: LocationData | null }>(
            (resolve) =>
              setTimeout(
                () => resolve({ granted: false, coordinates: null }),
                2000
              )
          ),
        ]);

        if (cancelled) return;

        if (res.granted && res.coordinates) {
          // Successfully got location - save permission state
          savePermissionState(true);
          browserLocationRef.current = res.coordinates;
          transitionToState("usingBrowserLocation");
        } else {
          // Failed to get location
          savePermissionState(false);
          transitionToState("usingDbLocation");
        }
      } catch {
        if (!cancelled) transitionToState("usingDbLocation");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [locationState]);

  // Using browser location → set internal state
  useEffect(() => {
    if (locationState !== "usingBrowserLocation") return;

    const coords = browserLocationRef.current;
    if (!coords) {
      transitionToState("usingDbLocation");
      return;
    }

    // No URL update - just set internal state
    markLocationFlowCompleted();
    setInternalLocation(coords);
    transitionToState("readyToQuery");
  }, [locationState]);

  // Using DB location → set internal state
  useEffect(() => {
    if (locationState !== "usingDbLocation") return;

    const dbLoc = dbLocationRef.current;

    if (!dbLoc?.coordinates) {
      transitionToState("noLocationAvailable");
      return;
    }

    const coords = dbLoc.coordinates;

    // No URL update - just set internal state
    markLocationFlowCompleted();
    setInternalLocation(coords);
    transitionToState("readyToQuery");
  }, [locationState]);

  // Show modal (with guards to prevent repeated prompts)
  useEffect(() => {
    if (locationState !== "noLocationAvailable") return;

    // Guard 1: If user explicitly requested location (?requestLocation=true), always show
    if (stableParams.forceLocationPrompt) {
      setShowLocationModal(true);
      markLocationFlowCompleted();
      transitionToState("readyToQuery");
      return;
    }

    // Guard 2: If user previously dismissed the modal, don't show it again
    if (hasUserDismissedLocationModal()) {
      markLocationFlowCompleted();
      transitionToState("readyToQuery");
      return;
    }

    if (wasPreviouslyGranted()) {
      markLocationFlowCompleted();
      transitionToState("readyToQuery");
      return;
    }

    if (hasCompletedLocationFlow()) {
      transitionToState("readyToQuery");
      return;
    }

    setShowLocationModal(true);
    markLocationFlowCompleted();
    transitionToState("readyToQuery");
  }, [locationState, stableParams.forceLocationPrompt]);

  const handleLocationGranted = (coordinates: LocationData) => {
    // No URL update - just set internal state
    markLocationFlowCompleted();
    savePermissionState(true);

    setShowLocationModal(false);
    setInternalLocation(coordinates);
    // Directly transition since we have the location now
    transitionToState("readyToQuery");
  };

  const handleLocationDismissed = () => {
    markUserDismissedLocationModal();
    markLocationFlowCompleted();
    setShowLocationModal(false);
  };

  return {
    locationState,
    showLocationModal,
    setShowLocationModal,
    handleLocationGranted,
    handleLocationDismissed,
    stableParams,
    internalLocation,
  };
}
