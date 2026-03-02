"use client";

import Link from "next/link";
import { Image } from "@nextui-org/react";
import { transformImageUrl } from "@/lib/util";
import type { NotificationDto } from "@/types/notifications";

// ─── WhisperMessage ───────────────────────────────────────────────────────────

interface WhisperMessageProps {
  notification: NotificationDto;
  batchCount: number;
  onDismiss: () => void;
}

export default function WhisperMessage({
  notification,
  batchCount,
  onDismiss,
}: WhisperMessageProps) {
  const href = notification.actorId
    ? `/members/${notification.actorId}/chat`
    : (notification.linkUrl ?? "/messages");

  const senderName = notification.actorName ?? "מישהו";
  const senderImage = notification.actorImage ?? null;

  // Batched: "3 הודעות חדשות מדינה 💛" — aggregated preview line.
  const preview =
    batchCount > 1
      ? `${batchCount} הודעות חדשות מ${senderName} 💛`
      : notification.message;

  return (
    <Link
      href={href}
      onClick={onDismiss}
      className="flex items-center gap-3 w-full max-w-[420px] min-h-[88px] bg-white rounded-[24px] px-4 py-3 border border-white/60 active:opacity-80 transition-opacity"
      style={{
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={transformImageUrl(senderImage) ?? "/images/user.png"}
          height={44}
          width={44}
          alt={senderName}
          className="object-cover rounded-full"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-semibold text-[15px] text-gray-900 leading-tight truncate">
          {senderName}
        </div>
        <div className="text-[14px] text-gray-700 mt-0.5 truncate">{preview}</div>
      </div>

      {/* CTA chip */}
      <div className="flex-shrink-0 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 transition rounded-full px-4 py-1 whitespace-nowrap">
        הגב
      </div>
    </Link>
  );
}
