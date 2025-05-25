"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
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
  const [modalOpen, setModalOpen] = useState(false);
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
        toast.custom(() => (
          <div className="max-w-sm w-full bg-white border border-orange-200 rounded-xl shadow-xl pointer-events-auto px-4 py-3 animate-enter">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-orange-700">
                מישהו בדיוק הציץ בפרופיל שלך ✨
              </p>
              <p className="text-xs text-orange-500 mt-1">
                נשמע מסקרן? בוא לראות מי זה
              </p>
            </div>
          </div>
        ));
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
    async (userId: string) => {
      setLoadingUserId(userId);
      setModalOpen(false);
      await fetch("/api/views/seen", { method: "POST" }).catch(() => {});
      markAllSeen();
      router.push(`/members/${userId}`);
      setLoadingUserId(null);
    },
    [router, markAllSeen]
  );

  return (
    <>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

      <motion.button
        onClick={() => setModalOpen(true)}
        className="relative bg-gradient-to-br from-white to-amber-50 border border-orange-300/70 backdrop-blur-xl shadow-lg rounded-full p-2.5 hover:shadow-orange-200/50 hover:scale-105 transition duration-300"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-orange-600" />
        <AnimatePresence>
          {unseenCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-md border border-white/30"
            >
              {unseenCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <Modal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        placement="top-center"
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: { duration: 0.3, ease: "easeOut" },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: { duration: 0.2, ease: "easeIn" },
            },
          },
        }}
      >
        <ModalContent className="rounded-2xl border border-orange-300/50 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
          <ModalHeader className="text-center bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-100 py-4">
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-5 h-5 text-orange-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                מי צפה בפרופיל שלך
              </span>
            </div>
          </ModalHeader>
          <ModalBody className="px-4 py-5">
            {views.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="p-3 bg-orange-50 rounded-full">
                  <Eye className="w-8 h-8 text-orange-300" />
                </div>
                <p className="text-gray-500 text-center font-medium">
                  אף אחד לא צפה בפרופיל שלך עדיין
                </p>
                <p className="text-xs text-gray-400 text-center max-w-xs">
                  כשמישהו יצפה בפרופיל שלך, תראה אותו כאן
                </p>
              </div>
            ) : (
              <motion.ul
                className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {views.map((user, index) => (
                  <motion.li
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 bg-gradient-to-r from-white to-orange-50/30 border border-orange-100/80 shadow-sm rounded-xl px-4 py-3 hover:shadow-md hover:border-orange-200/80 transition-all duration-200"
                  >
                    <button
                      onClick={() => handleAvatarClick(user.id)}
                      className="flex-shrink-0 relative group"
                    >
                      <Avatar
                        src={user.image}
                        alt={user.name}
                        size="md"
                        className="border-2 border-orange-100 shadow-sm transition-transform group-hover:scale-105"
                        isBordered
                        color="warning"
                      />
                      {loadingUserId === user.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                          <Spinner size="sm" color="warning" />
                        </div>
                      )}
                    </button>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-gray-800 text-md truncate">
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
                        <span className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {user.member.description.slice(0, 100)}...
                        </span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
