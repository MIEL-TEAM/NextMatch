"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  useNotificationController,
  type VisibleNotification,
} from "./NotificationController";
import WhisperMessage from "./WhisperMessage";
import WhisperLike from "./WhisperLike";
import WhisperProfileView from "./WhisperProfileView";
import WhisperAchievement from "./WhisperAchievement";

// ─── Animation constants ───────────────────────────────────────────────────────

const SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

const VARIANTS = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.98 },
} as const;

// ─── NotificationLayer ────────────────────────────────────────────────────────

export default function NotificationLayer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<WhisperPortal />, document.body);
}

// ─── WhisperPortal ────────────────────────────────────────────────────────────

function WhisperPortal() {
  const { visibleNotification, dismiss } = useNotificationController();

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100002] pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {visibleNotification && (
          <motion.div
            key={visibleNotification.notification.id}
            initial={VARIANTS.initial}
            animate={VARIANTS.animate}
            exit={VARIANTS.exit}
            transition={SPRING}
            className="pointer-events-auto"
          >
            {renderWhisper(visibleNotification, dismiss)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Type-driven render switch ────────────────────────────────────────────────

function renderWhisper(
  visibleNotification: VisibleNotification,
  dismiss: () => void,
) {
  const { notification, batchCount } = visibleNotification;

  switch (notification.type) {
    case "NEW_MESSAGE":
      return (
        <WhisperMessage
          notification={notification}
          batchCount={batchCount}
          onDismiss={dismiss}
        />
      );

    case "NEW_LIKE":
      return <WhisperLike notification={notification} onDismiss={dismiss} />;

    case "PROFILE_VIEW":
      return (
        <WhisperProfileView notification={notification} onDismiss={dismiss} />
      );

    case "ACHIEVEMENT":
      return (
        <WhisperAchievement notification={notification} onDismiss={dismiss} />
      );

    default:
      return null;
  }
}
