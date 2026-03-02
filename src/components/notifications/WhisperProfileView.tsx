"use client";

import Link from "next/link";
import { Image } from "@nextui-org/react";
import { transformImageUrl } from "@/lib/util";
import type { NotificationDto } from "@/types/notifications";

// ─── WhisperProfileView ───────────────────────────────────────────────────────

interface WhisperProfileViewProps {
  notification: NotificationDto;
  onDismiss: () => void;
}

export default function WhisperProfileView({
  notification,
  onDismiss,
}: WhisperProfileViewProps) {
  const href = notification.actorId
    ? `/members/${notification.actorId}`
    : (notification.linkUrl ?? "/members");

  const actorName = notification.actorName ?? "מישהו";
  const actorImage = notification.actorImage ?? null;

  return (
    <Link
      href={href}
      onClick={onDismiss}
      className="flex items-center gap-3 w-full max-w-[360px] rounded-[24px] px-4 py-2.5 shadow-2xl active:opacity-80 transition-opacity"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.10) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(129,140,248,0.30)",
        boxShadow:
          "0 8px 32px rgba(79,70,229,0.18), 0 1.5px 0 rgba(165,180,252,0.15) inset",
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={transformImageUrl(actorImage) ?? "/images/user.png"}
          height={40}
          width={40}
          alt={actorName}
          className="object-cover rounded-full border-2 border-indigo-300/30"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-semibold text-white text-sm leading-tight truncate flex items-center gap-1.5">
          <span>👀</span>
          <span>{actorName}</span>
        </div>
        <div className="text-xs text-white/75 mt-0.5">צפה בפרופיל שלך</div>
      </div>

      {/* CTA chip */}
      <div className="flex-shrink-0 text-xs font-medium text-indigo-200/90 bg-indigo-500/20 border border-indigo-400/20 rounded-full px-3 py-1 whitespace-nowrap">
        בדוק
      </div>
    </Link>
  );
}
