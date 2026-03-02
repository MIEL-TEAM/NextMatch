"use client";

import type { NotificationDto } from "@/types/notifications";

// ─── WhisperAchievement ───────────────────────────────────────────────────────

interface WhisperAchievementProps {
  notification: NotificationDto;
  onDismiss: () => void;
}

export default function WhisperAchievement({
  notification,
  onDismiss,
}: WhisperAchievementProps) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      className="flex items-center gap-3 w-full max-w-[360px] rounded-[24px] px-4 py-3 shadow-2xl active:opacity-80 transition-opacity text-right"
      style={{
        background:
          "linear-gradient(135deg, rgba(234,179,8,0.20) 0%, rgba(234,179,8,0.08) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(250,204,21,0.28)",
        boxShadow:
          "0 8px 32px rgba(161,120,0,0.20), 0 1.5px 0 rgba(253,224,71,0.18) inset",
      }}
    >
      {/* Star icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-300/30 flex items-center justify-center text-xl">
        ⭐
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-semibold text-yellow-100 text-sm leading-tight truncate">
          {notification.title}
        </div>
        <div className="text-xs text-yellow-200/70 mt-0.5 truncate">
          {notification.message}
        </div>
      </div>
    </button>
  );
}
