"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { hasUserAddedInterests } from "@/app/actions/interestsAction";

export default function InterestNotification({
  userId,
  profileComplete,
}: {
  userId: string;
  profileComplete: boolean;
}) {
  const router = useRouter();
  const [hasCheckedInterests, setHasCheckedInterests] = useState(false);
  const [hasInterests, setHasInterests] = useState(true);

  // Check if user has interests (runs once on mount)
  useEffect(() => {
    if (!userId || !profileComplete || hasCheckedInterests) return;

    async function checkInterests() {
      try {
        const userHasInterests = await hasUserAddedInterests();
        setHasInterests(userHasInterests);
        setHasCheckedInterests(true);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to check interests:", error);
        }
        setHasCheckedInterests(true);
      }
    }

    checkInterests();
  }, [userId, profileComplete, hasCheckedInterests]);

  // Show toast if eligible (runs after interests check completes)
  useEffect(() => {
    // Wait for interests check to complete
    if (!hasCheckedInterests || hasInterests) return;

    // Session storage: only show once per session
    const sessionKey = `interestsNudgeShown_${userId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    // Local storage: respect "dismiss for 30 minutes"
    const dismissedUntil = localStorage.getItem(
      `interestsDismissedUntil_${userId}`
    );
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    // Show toast after 10-second delay
    const timer = setTimeout(() => {
      // Mark as shown in session
      sessionStorage.setItem(sessionKey, "true");

      toast.custom(
        (t) => (
          <div
            className="bg-white border-2 border-amber-300 rounded-2xl sm:rounded-xl shadow-2xl p-4 sm:p-3 max-w-[400px] w-full mx-auto"
            dir="rtl"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl sm:text-xl flex-shrink-0">✨</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight mb-1.5">
                  השלם את הפרופיל שלך
                </h3>
                <p className="text-xs sm:text-[11px] text-gray-600 mb-3 leading-relaxed">
                  הוסף תחומי עניין כדי שנוכל לחבר אותך עם אנשים מתאימים
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    color="default"
                    className="min-w-0 text-xs h-8"
                    onPress={() => {
                      const THIRTY_MIN = 30 * 60 * 1000;
                      localStorage.setItem(
                        `interestsDismissedUntil_${userId}`,
                        (Date.now() + THIRTY_MIN).toString()
                      );
                      toast.dismiss(t);
                    }}
                  >
                    אחר כך
                  </Button>

                  <Button
                    size="sm"
                    color="warning"
                    className="min-w-0 text-xs h-8"
                    onPress={() => {
                      router.push(`/interests`);
                      toast.dismiss(t);
                    }}
                  >
                    הוסף עכשיו
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: 30000,
          position: "top-center",
          id: "interests-reminder",
        }
      );
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [userId, hasCheckedInterests, hasInterests, router]);

  return null;
}
