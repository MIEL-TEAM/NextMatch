"use client";

import { useLocationFlow } from "@/hooks/useLocationFlow";
import MembersData from "./MembersData";
import MembersPageSkeleton from "@/components/memberStyles/MembersPageSkeleton";
import LocationPermissionBanner from "@/components/LocationPermissionBanner";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function MembersLocationGate() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const {
        locationState,
        internalLocation,
        showLocationBanner,
        handleLocationGranted,
        handleLocationDismissed,
        stableParams,
    } = useLocationFlow();

    return (
        <>
            {locationState !== "readyToQuery" ? (
                <MembersPageSkeleton />
            ) : (
                <MembersData
                    location={internalLocation}
                    locationState={locationState}
                />
            )}

            <LocationPermissionBanner
                isVisible={showLocationBanner}
                onClose={() => {
                    handleLocationDismissed();
                    if (stableParams.forceLocationPrompt) {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("requestLocation");
                        router.replace(`${pathname}?${params.toString()}`, {
                            scroll: false,
                        });
                    }
                }}
                onLocationGranted={handleLocationGranted}
            />
        </>
    );
}
