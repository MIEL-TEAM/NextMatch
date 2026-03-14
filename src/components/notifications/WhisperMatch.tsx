"use client";

import Link from "next/link";
import { Image } from "@nextui-org/react";
import { transformImageUrl } from "@/lib/util";
import type { NotificationDto } from "@/types/notifications";
import { gt } from "@/lib/gender";

// ─── WhisperMatch ─────────────────────────────────────────────────────────────
// Handles MUTUAL_MATCH and MATCH_ONLINE notification types.

interface WhisperMatchProps {
  notification: NotificationDto;
  onDismiss: () => void;
}

export default function WhisperMatch({ notification, onDismiss }: WhisperMatchProps) {
  const isMutualMatch = notification.type === "MUTUAL_MATCH";

  const href = notification.actorId
    ? isMutualMatch
      ? `/members/${notification.actorId}`
      : `/members/${notification.actorId}/chat`
    : (notification.linkUrl ?? "/lists");

  const actorName = notification.actorName ?? "מישהו";
  const actorImage = notification.actorImage ?? null;
  const actorGender = notification.data?.actorGender ?? null;

  const ctaLabel = isMutualMatch ? "צפה בהתאמה" : "שלח הודעה";
  const emoji = isMutualMatch ? "💛" : "🟢";
  const subtext = isMutualMatch
    ? "התאמה הדדית! התחילו לשוחח"
    : `${gt("activeNow", actorGender)} — שלח הודעה`;

  return (
    <Link
      href={href}
      onClick={onDismiss}
      className="flex items-center gap-3 w-full max-w-[420px] min-h-[88px] rounded-[24px] px-4 py-3 border active:opacity-80 transition-opacity"
      style={{
        background:
          "linear-gradient(135deg, rgba(246,211,101,0.22) 0%, rgba(253,160,133,0.18) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(246,211,101,0.35)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      }}
    >
      {/* Avatar with emoji badge */}
      <div className="relative flex-shrink-0">
        <Image
          src={transformImageUrl(actorImage) ?? "/images/user.png"}
          height={44}
          width={44}
          alt={actorName}
          className="object-cover rounded-full"
        />
        <span className="absolute -bottom-1 -right-1 text-base leading-none">
          {emoji}
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-semibold text-[15px] text-gray-900 leading-tight truncate">
          {actorName}
        </div>
        <div className="text-[13px] text-gray-600 mt-0.5 truncate">{subtext}</div>
      </div>

      {/* CTA chip */}
      <div className="flex-shrink-0 text-xs font-medium text-white bg-gradient-to-r from-[#FFB547] to-[#E37B27] rounded-full px-4 py-1 whitespace-nowrap shadow-sm">
        {ctaLabel}
      </div>
    </Link>
  );
}
