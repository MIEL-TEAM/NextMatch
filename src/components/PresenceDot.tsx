"use client";

import { Member } from "@prisma/client";
import { GoDot, GoDotFill } from "react-icons/go";
import { usePresence } from "@/hooks/usePresence";
import { getPresenceClasses } from "@/lib/presence";

type PresenceProps = {
  member: Member & {
    user?: {
      lastActiveAt?: Date | null;
    } | null;
  };
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZE_CONFIG = {
  sm: { dot: 24, dotBg: 28 },
  md: { dot: 32, dotBg: 36 },
  lg: { dot: 40, dotBg: 44 },
};

export default function PresenceDot({
  member,
  showLabel = false,
  size = "md",
}: PresenceProps) {
  const presence = usePresence(member.userId, member.user?.lastActiveAt);
  const classes = getPresenceClasses(presence.status);
  const sizeConfig = SIZE_CONFIG[size];

  if (presence.status === "offline" && !showLabel) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="relative flex-shrink-0"
        title={presence.label || "לא פעיל/ה"}
        aria-label={presence.status}
      >
        {/* White background for contrast */}
        <GoDot
          size={sizeConfig.dotBg}
          className="fill-white z-10 absolute -top-[2px] -right-[2px] drop-shadow-sm"
        />
        {/* Main status dot with beautiful green glow when online */}
        <GoDotFill
          size={sizeConfig.dot}
          className={`${classes.dot} ${
            presence.isOnline
              ? "animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"
              : ""
          } border-2 border-white rounded-full z-20 transition-all duration-300`}
        />
      </div>

      {showLabel && presence.label && (
        <span className={`text-xs ${classes.text} whitespace-nowrap`}>
          {presence.label}
        </span>
      )}
    </div>
  );
}
