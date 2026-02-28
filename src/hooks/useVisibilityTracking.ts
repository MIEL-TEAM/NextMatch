import { useEffect, useRef } from "react";
import { batcher } from "@/lib/interactionBatcher";

const VISIBILITY_THRESHOLD = 0.5;
const VIEW_DURATION_MS = 800;

export function useVisibilityTracking(targetUserId: string) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!targetUserId || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    if (!timerRef.current) {
                        timerRef.current = setTimeout(() => {
                            batcher.add(targetUserId);
                            timerRef.current = null;
                        }, VIEW_DURATION_MS);
                    }
                } else {
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
