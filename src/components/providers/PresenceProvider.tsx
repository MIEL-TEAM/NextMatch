"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { updateUserPresence } from "@/app/actions/presenceActions";

const HEARTBEAT_INTERVAL = 60 * 1000;

export default function PresenceProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!userId) return;

        const heartbeat = async () => {
            if (typeof navigator !== "undefined" && !navigator.onLine) return;

            try {
                await updateUserPresence();
            } catch (err) {
                console.error("Heartbeat failed silently", err);
            }
        };

        heartbeat();

        intervalRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);

        // 3. Handle visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                heartbeat();
                // Reset interval to avoid double-firing if user comes back right before interval
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [userId]);

    return <>{children}</>;
}
