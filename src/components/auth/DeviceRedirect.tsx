"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMobileAuthRedirect } from "@/lib/deviceDetection";

type DeviceRedirectProps = {
  enabled?: boolean;

  mobileThreshold?: number;
};

export default function DeviceRedirect({
  enabled = false,
  mobileThreshold = 768,
}: DeviceRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    const checkAndRedirect = () => {
      if (typeof window === "undefined") return;

      const isMobile = window.innerWidth < mobileThreshold;

      if (isMobile) {
        const mobileRoute = getMobileAuthRedirect(pathname);
        if (mobileRoute && pathname !== mobileRoute) {
          router.replace(mobileRoute);
        }
      }
    };

    checkAndRedirect();

    window.addEventListener("resize", checkAndRedirect);

    return () => {
      window.removeEventListener("resize", checkAndRedirect);
    };
  }, [enabled, pathname, router, mobileThreshold]);

  return null;
}
