export type PresenceStatus = "online" | "recently-active" | "offline";

export interface PresenceResult {
  status: PresenceStatus;
  label: string;
  isOnline: boolean;
}

const PRESENCE_THRESHOLDS = {
  RECENTLY_ACTIVE: 5 * 60 * 1000,
  ACTIVE_TODAY: 24 * 60 * 60 * 1000,
} as const;

export function resolvePresenceStatus(
  userId: string,
  isInPresenceChannel: boolean,
  lastActiveAt: Date | null | undefined
): PresenceResult {
  if (isInPresenceChannel) {
    return {
      status: "online",
      label: "מחובר/ת",
      isOnline: true,
    };
  }

  if (!lastActiveAt) {
    return {
      status: "offline",
      label: "",
      isOnline: false,
    };
  }

  const now = Date.now();
  const lastActiveTime = new Date(lastActiveAt).getTime();
  const timeDiff = now - lastActiveTime;

  if (timeDiff < PRESENCE_THRESHOLDS.RECENTLY_ACTIVE) {
    const minutesAgo = Math.floor(timeDiff / (60 * 1000));

    if (minutesAgo < 1) {
      return {
        status: "recently-active",
        label: "פעיל/ה כעת",
        isOnline: false,
      };
    }

    return {
      status: "recently-active",
      label: `פעיל/ה לפני ${minutesAgo} דק'`,
      isOnline: false,
    };
  }

  if (timeDiff < PRESENCE_THRESHOLDS.ACTIVE_TODAY) {
    const hoursAgo = Math.floor(timeDiff / (60 * 60 * 1000));

    if (hoursAgo < 1) {
      return {
        status: "recently-active",
        label: "פעיל/ה היום",
        isOnline: false,
      };
    }

    return {
      status: "recently-active",
      label: `פעיל/ה לפני ${hoursAgo} שעות`,
      isOnline: false,
    };
  }

  return {
    status: "offline",
    label: "",
    isOnline: false,
  };
}

export function getPresenceClasses(status: PresenceStatus): {
  dot: string;
  text: string;
} {
  switch (status) {
    case "online":
      return {
        dot: "fill-emerald-500",
        text: "text-emerald-600 font-semibold",
      };

    case "recently-active":
      return {
        dot: "fill-amber-400",
        text: "text-gray-500 font-normal",
      };

    case "offline":
      return {
        dot: "fill-gray-300",
        text: "text-gray-400 font-normal",
      };
  }
}
