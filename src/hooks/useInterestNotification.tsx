"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { hasUserAddedInterests } from "@/app/actions/interestsAction";

export default function InterestNotification({
  userId,
}: {
  userId: string | null;
}) {
  const router = useRouter();
  const hasShownNotificationRef = useRef(false);
  const [hasCheckedInterests, setHasCheckedInterests] = useState(false);
  const [hasInterests, setHasInterests] = useState(true);

  useEffect(() => {
    if (!userId || hasCheckedInterests) return;

    async function checkInterests() {
      try {
        const userHasInterests = await hasUserAddedInterests();
        setHasInterests(userHasInterests);
        setHasCheckedInterests(true);
      } catch (error) {
        console.error("Failed to check interests:", error);
      }
    }

    checkInterests();
  }, [userId, hasCheckedInterests]);

  useEffect(() => {
    if (!userId || !hasCheckedInterests || hasShownNotificationRef.current)
      return;

    if (hasInterests) {
      return;
    }

    const timer = setTimeout(() => {
      hasShownNotificationRef.current = true;

      toast.custom(
        (t) => (
          <div
            className="bg-white border border-amber-300 rounded-lg shadow-lg p-4 max-w-md"
            dir="rtl"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">השלם את הפרופיל שלך</h3>
                <p className="text-sm text-gray-600 mb-3">
                  הוסף תחומי עניין כדי שנוכל לחבר אותך עם אנשים מתאימים
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    color="default"
                    onPress={() => toast.dismiss(t)}
                  >
                    אחר כך
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
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
