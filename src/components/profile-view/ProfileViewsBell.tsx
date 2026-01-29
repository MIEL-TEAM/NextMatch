"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Spinner,
} from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { Bell, Eye } from "lucide-react";
import { useViewsStore } from "@/hooks/useViewsStore";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileViewsRealtime } from "@/hooks/useNotificationChannel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfileViewsBell({ userId }: { userId: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { views, unseenCount, setViews, markAllSeen } = useViewsStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCountRef = useRef(0);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const router = useRouter();

  const fetchAndUpdateViews = useCallback(async () => {
    try {
      const res = await fetch("/api/views");
      if (!res.ok) throw new Error("שגיאה בטעינת צפיות");
      const data = await res.json();
      const viewsData = data.views || data;

      const previousCount = previousCountRef.current;
      previousCountRef.current = viewsData.length;
      setViews(viewsData);

      if (viewsData.length > previousCount) {
        audioRef.current?.play().catch(() => {});
        toast.custom(
          () => (
            <div className="max-w-[400px] w-full bg-white border-2 border-orange-200 rounded-2xl sm:rounded-xl shadow-2xl pointer-events-auto p-4 sm:p-3 mx-auto">
              <div className="flex flex-col items-center text-center gap-1">
                <p className="text-sm sm:text-[13px] font-semibold text-orange-700 leading-tight">
                  מישהו בדיוק הציץ בפרופיל שלך ✨
                </p>
                <p className="text-xs text-orange-500">
                  נשמע מסקרן? בוא לראות מי זה
                </p>
              </div>
            </div>
          ),
          {
            duration: 4000,
            position: "top-center",
          }
        );
      }
    } catch (error) {
      console.error("שגיאה בהבאת צפיות:", error);
    }
  }, [setViews]);

  useEffect(() => {
    const fetchInitialViews = async () => {
      try {
        const res = await fetch("/api/views");
        if (!res.ok) throw new Error("שגיאה בטעינת צפיות");
        const data = await res.json();
        const viewsData = data.views || data;
        previousCountRef.current = viewsData.length;
        setViews(viewsData);
      } catch (error) {
        console.error("שגיאה בהבאת צפיות:", error);
      }
    };
    fetchInitialViews();
  }, [setViews]);

  useProfileViewsRealtime(userId, fetchAndUpdateViews);

  const handleAvatarClick = useCallback(
    async (clickedUserId: string) => {
      setLoadingUserId(clickedUserId);
      setDropdownOpen(false);
      await fetch("/api/views/seen", { method: "POST" }).catch(() => {});
      markAllSeen();
      router.push(`/members/${clickedUserId}`);
      setLoadingUserId(null);
    },
    [router, markAllSeen]
  );

  return (
    <>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

      <Dropdown
        placement="bottom-end"
        isOpen={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <DropdownTrigger>
          <button
            className="relative flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/20 sm:hover:bg-white/30 backdrop-blur-md shadow-md border border-white/20 sm:transition-all sm:duration-200 sm:hover:scale-105 sm:active:scale-95"
            aria-label={`Profile views${unseenCount > 0 ? ` (${unseenCount} new)` : ""}`}
          >
            <Bell className="w-5 h-5 sm:w-4.5 sm:h-4.5 text-white/90" strokeWidth={2} />
            <AnimatePresence mode="wait">
              {unseenCount > 0 && (
                <motion.div
                  key={unseenCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-r from-orange-500 to-rose-600 text-white text-[10px] font-bold rounded-full px-1 shadow-lg border border-white/30"
                >
                  {unseenCount > 99 ? "99+" : unseenCount}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Profile views"
          className="w-[360px] sm:w-[420px] max-h-[70vh] sm:max-h-[500px] overflow-y-auto"
          variant="flat"
          classNames={{
            base: "p-0",
            list: "p-2 gap-2",
          }}
        >
          {/* Header section */}
          <DropdownSection showDivider>
            <DropdownItem
              key="header"
              isReadOnly
              className="cursor-default hover:bg-transparent"
              textValue="Profile views header"
            >
              <div className="flex items-center gap-2 px-2 py-1">
                <Eye className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  מי צפה בפרופיל שלך
                </span>
              </div>
            </DropdownItem>
          </DropdownSection>

          {/* Views section */}
          <DropdownSection>
            {views.length === 0 ? (
              <DropdownItem
                key="empty"
                isReadOnly
                className="cursor-default"
                textValue="No views"
              >
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <div className="p-2 bg-orange-50 rounded-full">
                    <Eye className="w-6 h-6 text-orange-300" />
                  </div>
                  <p className="text-gray-500 text-center text-sm font-medium">
                    אף אחד לא צפה בפרופיל שלך עדיין
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    כשמישהו יצפה בפרופיל שלך, תראה אותו כאן
                  </p>
                </div>
              </DropdownItem>
            ) : (
              <>
                {views.map((user) => (
                  <DropdownItem
                    key={user.id}
                    textValue={user.name}
                    className="data-[hover=true]:bg-orange-50/50"
                    onClick={() => handleAvatarClick(user.id)}
                  >
                    <div className="flex gap-3 items-center py-1">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={user.image}
                          alt={user.name}
                          size="md"
                          className="border-2 border-orange-100 shadow-sm"
                          isBordered
                          color="warning"
                        />
                        {loadingUserId === user.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                            <Spinner size="sm" color="warning" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden flex-1">
                        <span className="font-semibold text-gray-800 text-sm truncate">
                          {user.name || "משתמש אנונימי"}
                        </span>
                        <span className="text-xs text-orange-500 font-medium">
                          לפני{" "}
                          {formatDistanceToNow(new Date(user.viewedAt), {
                            addSuffix: false,
                            locale: he,
                          })}
                        </span>
                        {user.member?.description && (
                          <span className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                            {user.member.description.slice(0, 80)}
                            {user.member.description.length > 80 ? "..." : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownItem>
                ))}
              </>
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
