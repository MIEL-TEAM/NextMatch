import { useEffect, useRef } from "react";
import { batcher } from "@/lib/interactionBatcher";

// Configuration
const VISIBILITY_THRESHOLD = 0.5; // 50% visible
const VIEW_DURATION_MS = 800; // Must be visible for 800ms to count

export function useVisibilityTracking(targetUserId: string) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!targetUserId || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    // Started viewing
                    if (!timerRef.current) {
                        timerRef.current = setTimeout(() => {
                            // Still viewing after delay -> count as view
                            batcher.add(targetUserId);
                            timerRef.current = null;
                            // Optional: disconnect observer if we only care about first view
                            // observer.disconnect();
                        }, VIEW_DURATION_MS);
                    }
                } else {
                    // Stopped viewing
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                        timerRef.current = null;
                    }
                }
            },
            {
                threshold: VISIBILITY_THRESHOLD,
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            observer.disconnect();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [targetUserId]);

    return elementRef;
}
