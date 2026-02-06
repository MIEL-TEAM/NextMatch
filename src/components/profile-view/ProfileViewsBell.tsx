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
  Button,
} from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getUserNotifications,
  getUnseenNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsSeen,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/db/notificationActions";
import { useNewNotificationListener } from "@/hooks/useNotificationChannel";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string | null;
  isRead: boolean;
  isSeen: boolean;
  linkUrl: string | null;
  createdAt: Date;
  actor?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export default function ProfileViewsBell({ userId }: { userId: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingNotificationId, setLoadingNotificationId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const result = await getUserNotifications(20, 0);
    if (result.success && result.notifications) {
      setNotifications(result.notifications as any);
    }
  }, []);

  // Fetch unseen count
  const fetchUnseenCount = useCallback(async () => {
    const result = await getUnseenNotificationCount();
    if (result.success) {
      setUnseenCount(result.count);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnseenCount();
  }, [fetchNotifications, fetchUnseenCount]);

  // Listen for new notifications via Pusher
  const handleNewNotification = useCallback((notification: any) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 20));
    setUnseenCount((prev) => prev + 1);
    audioRef.current?.play().catch(() => {});
  }, []);

  useNewNotificationListener(userId, handleNewNotification);

  // Mark all as seen when dropdown opens
  useEffect(() => {
    if (dropdownOpen && unseenCount > 0) {
      markAllNotificationsAsSeen().then(() => {
        setUnseenCount(0);
        fetchNotifications();
      });
    }
  }, [dropdownOpen, unseenCount, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    setLoadingNotificationId(notification.id);
    setDropdownOpen(false);

    // Mark as read
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate to link
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }

    setLoadingNotificationId(null);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    await markAllNotificationsAsRead();
    await fetchNotifications();
    setLoading(false);
  };

  const handleDeleteNotification = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    const icons: Record<string, string> = {
      NEW_MESSAGE: "💬",
      NEW_LIKE: "❤️",
      MUTUAL_MATCH: "💕",
      PROFILE_VIEW: "👁️",
      STORY_VIEW: "📸",
      STORY_REPLY: "💬",
      MATCH_ONLINE: "🟢",
      SMART_MATCH: "✨",
      ACHIEVEMENT: "🏆",
      PROFILE_BOOST: "⭐",
      SYSTEM: "ℹ️",
    };

    return icons[notification.type] || "🔔";
  };

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
            aria-label={`Notifications${unseenCount > 0 ? ` (${unseenCount} new)` : ""}`}
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
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-bold rounded-full px-1 shadow-lg border border-white/30"
                >
                  {unseenCount > 99 ? "99+" : unseenCount}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Notifications"
          className="w-[360px] sm:w-[420px] max-h-[70vh] sm:max-h-[500px] overflow-y-auto"
          variant="flat"
          classNames={{
            base: "p-0",
            list: "p-2 gap-1",
          }}
        >
          {/* Header section */}
          <DropdownSection showDivider>
            <DropdownItem
              key="header"
              isReadOnly
              className="cursor-default hover:bg-transparent"
              textValue="Notifications header"
            >
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    התראות
                  </span>
                </div>
                {notifications.some((n) => !n.isRead) && (
                  <Button
                    size="sm"
                    variant="light"
                    onPress={handleMarkAllAsRead}
                    isLoading={loading}
                    className="h-7 text-xs"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    סמן הכל
                  </Button>
                )}
              </div>
            </DropdownItem>
          </DropdownSection>

          {/* Notifications section */}
          <DropdownSection>
            {notifications.length === 0 ? (
              <DropdownItem
                key="empty"
                isReadOnly
                className="cursor-default"
                textValue="No notifications"
              >
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="p-3 bg-pink-50 rounded-full">
                    <Bell className="w-6 h-6 text-pink-300" />
                  </div>
                  <p className="text-gray-500 text-center text-sm font-medium">
                    אין התראות חדשות
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    כשיהיו התראות חדשות, תראה אותן כאן
                  </p>
                </div>
              </DropdownItem>
            ) : (
              <>
                {notifications.map((notification) => (
                  <DropdownItem
                    key={notification.id}
                    textValue={notification.title}
                    className={`data-[hover=true]:bg-pink-50/50 ${
                      !notification.isRead ? "bg-pink-50/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3 items-start py-2 relative">
                      {/* Icon/Avatar */}
                      <div className="relative flex-shrink-0">
                        {notification.actor?.image ? (
                          <Avatar
                            src={notification.actor.image}
                            alt={notification.actor.name || "User"}
                            size="md"
                            className="border-2 border-pink-100"
                            isBordered
                            color="danger"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100 rounded-full text-xl">
                            {getNotificationIcon(notification)}
                          </div>
                        )}
                        {loadingNotificationId === notification.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                            <Spinner size="sm" color="danger" />
                          </div>
                        )}
                        {!notification.isRead && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold text-gray-800 text-sm leading-tight">
                          {notification.title}
                        </span>
                        <span className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </span>
                        <span className="text-xs text-pink-500 font-medium mt-1">
                          לפני{" "}
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: false,
                            locale: he,
                          })}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) =>
                          handleDeleteNotification(notification.id, e)
                        }
                        className="flex-shrink-0 p-1 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
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
