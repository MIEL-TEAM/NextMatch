"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getMobileAuthRedirect,
  getDesktopAuthRedirect,
} from "@/lib/deviceDetection";

type UseDeviceRoutingOptions = {
  enabled?: boolean;
  mobileThreshold?: number;
  debounceMs?: number;
};

export function useDeviceRouting({
  enabled = true,
  mobileThreshold = 768,
  debounceMs = 100,
}: UseDeviceRoutingOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setIsReady(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let isFirstCheck = true;

    const handleDeviceRouting = () => {
      clearTimeout(timeoutId);

      const delay = isFirstCheck ? 0 : debounceMs;

      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < mobileThreshold;

        if (isMobile) {
          const mobileRoute = getMobileAuthRedirect(pathname);
          if (mobileRoute && pathname !== mobileRoute) {
            router.replace(mobileRoute);
            return;
          }
        } else {
          const desktopRoute = getDesktopAuthRedirect(pathname);
          if (desktopRoute && pathname !== desktopRoute) {
            router.replace(desktopRoute);
            return;
          }
        }

        setIsReady(true);
        isFirstCheck = false;
      }, delay);
    };

    handleDeviceRouting();

    window.addEventListener("resize", handleDeviceRouting);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleDeviceRouting);
    };
  }, [enabled, pathname, router, mobileThreshold, debounceMs]);

  return isReady;
}
