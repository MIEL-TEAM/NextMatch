"use client";

import { Member } from "@prisma/client";
import { GoDotFill } from "react-icons/go";
import { usePresence } from "@/hooks/usePresence";

type PresenceProps = {
  member: Member & {
    user?: {
      lastActiveAt?: Date | null;
    } | null;
  };
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CONFIG = {
  sm: { dot: 12, text: "text-xs", padding: "px-2 py-0.5" },
  md: { dot: 14, text: "text-sm", padding: "px-2.5 py-1" },
  lg: { dot: 16, text: "text-base", padding: "px-3 py-1.5" },
};

export default function PresenceDot({
  member,
  showLabel = true,
  size = "md",
  className = "",
}: PresenceProps) {
  const presence = usePresence(member.userId, member.user?.lastActiveAt);
  const sizeConfig = SIZE_CONFIG[size];

  // Only show when online
  if (presence.status !== "online") {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full ${sizeConfig.padding} shadow-md ${className}`}>
      {/* Green online dot */}
      <GoDotFill
        size={sizeConfig.dot}
        className="fill-green-500 animate-pulse"
      />
      
      {showLabel && (
        <span className={`${sizeConfig.text} font-medium text-gray-700 whitespace-nowrap`}>
          מחובר/ת
        </span>
      )}
    </div>
  );
}
