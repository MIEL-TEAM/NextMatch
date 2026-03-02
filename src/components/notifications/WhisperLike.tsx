"use client";

import Link from "next/link";
import { Image } from "@nextui-org/react";
import { transformImageUrl } from "@/lib/util";
import type { NotificationDto } from "@/types/notifications";

// ─── WhisperLike ──────────────────────────────────────────────────────────────

interface WhisperLikeProps {
  notification: NotificationDto;
  onDismiss: () => void;
}

export default function WhisperLike({ notification, onDismiss }: WhisperLikeProps) {
  const href = notification.actorId
    ? `/members/${notification.actorId}`
    : (notification.linkUrl ?? "/members");

  const actorName = notification.actorName ?? "מישהו";
  const actorImage = notification.actorImage ?? null;

  return (
    <Link
      href={href}
      onClick={onDismiss}
      className="flex items-center gap-3 w-full max-w-[420px] min-h-[88px] bg-white rounded-[24px] px-4 py-2.5 border border-white/60 active:opacity-80 transition-opacity"
      style={{
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={transformImageUrl(actorImage) ?? "/images/user.png"}
          height={40}
          width={40}
          alt={actorName}
          className="object-cover rounded-full"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-semibold text-[15px] text-gray-900 leading-tight truncate flex items-center gap-1.5">
          <span>❤️</span>
          <span>{actorName}</span>
        </div>
        <div className="text-[14px] text-gray-700 mt-0.5">אהב את הפרופיל שלך</div>
      </div>

      {/* CTA chip */}
      <div className="flex-shrink-0 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 transition rounded-full px-4 py-1 whitespace-nowrap">
        צפה בפרופיל
      </div>
    </Link>
  );
}
