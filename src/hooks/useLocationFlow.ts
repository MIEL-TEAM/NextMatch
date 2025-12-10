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
  const urlUpdateAppliedRef = useRef(false);
  const dbLocationRef = useRef<DbLocationStatus | null>(null);
  const browserLocationRef = useRef<LocationData | null>(null);
  const locationStartRef = useRef<number | null>(null);
  const isFirstMountRef = useRef(true);

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
    if (locationState === "initial") {
      locationStartRef.current = Date.now();
      transitionToState("checkingUrlLocation");
    }
  }, [locationState]);

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
        const hasPermission = await Promise.race([
          checkLocationPermission(),
          new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), 1000)
          ),
        ]);

        if (cancelled) return;

        if (hasPermission) {
          transitionToState("gettingBrowserLocation");
        } else {
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
          browserLocationRef.current = res.coordinates;
          transitionToState("usingBrowserLocation");
        } else {
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

  // Using browser location → update URL
  useEffect(() => {
    if (locationState !== "usingBrowserLocation") return;

    const coords = browserLocationRef.current;
    if (!coords) {
      transitionToState("usingDbLocation");
      return;
    }

    if (urlUpdateAppliedRef.current) {
      setInternalLocation(coords);
      transitionToState("readyToQuery");
      return;
    }

    const router = routerRef.current;
    const pathname = pathnameRef.current;

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("userLat", coords.latitude.toString());
    currentParams.set("userLon", coords.longitude.toString());
    currentParams.set("sortByDistance", "true");

    urlUpdateAppliedRef.current = true;

    router.replace(`${pathname}?${currentParams.toString()}`, {
      scroll: false,
    });

    setInternalLocation(coords);
    transitionToState("readyToQuery");
  }, [locationState, searchParams]);

  // Using DB location → update URL
  useEffect(() => {
    if (locationState !== "usingDbLocation") return;

    const dbLoc = dbLocationRef.current;

    if (!dbLoc?.coordinates) {
      transitionToState("noLocationAvailable");
      return;
    }

    const coords = dbLoc.coordinates;

    if (urlUpdateAppliedRef.current) {
      setInternalLocation(coords);
      transitionToState("readyToQuery");
      return;
    }

    const router = routerRef.current;
    const pathname = pathnameRef.current;

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("userLat", coords.latitude.toString());
    currentParams.set("userLon", coords.longitude.toString());
    currentParams.set("sortByDistance", "true");

    urlUpdateAppliedRef.current = true;

    router.replace(`${pathname}?${currentParams.toString()}`, {
      scroll: false,
    });

    setInternalLocation(coords);
    transitionToState("readyToQuery");
  }, [locationState, searchParams]);

  // Show modal
  useEffect(() => {
    if (locationState !== "noLocationAvailable") return;

    setShowLocationModal(true);
    transitionToState("readyToQuery");
  }, [locationState]);

  const handleLocationGranted = (coordinates: LocationData) => {
    const router = routerRef.current;
    const pathname = pathnameRef.current;

    const params = new URLSearchParams(searchParams.toString());
    params.set("userLat", coordinates.latitude.toString());
    params.set("userLon", coordinates.longitude.toString());
    params.set("sortByDistance", "true");
    params.delete("requestLocation");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowLocationModal(false);
    setInternalLocation(coordinates);

    urlUpdateAppliedRef.current = true;
  };

  return {
    locationState,
    showLocationModal,
    setShowLocationModal,
    handleLocationGranted,
    stableParams,
    internalLocation,
  };
}
