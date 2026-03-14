"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VIBES } from "@/lib/vibes";
import { VibeBubble } from "./VibeBubble";
import {
  getActiveVibes,
  getMyActiveVibe,
  setUserVibe,
  clearUserVibe,
} from "@/app/actions/vibeActions";

interface VibesContainerProps {
  currentUserId: string;
}

// Emoji used in signal text (plain strings — not icon component names)
const SIGNAL_EMOJI: Record<string, string> = {
  flirty: "🔥",
  coffee: "☕",
  chat: "💬",
  drinks: "🍷",
  music: "🎧",
  browse: "✨",
};

const VIBE_LABEL: Record<string, string> = {
  flirty: "פלרטט",
  coffee: "קפה מישהו",
  chat: "לדבר",
  drinks: "דרינק הערב",
  music: "מוזיקה",
  browse: "מסתכל",
};

// Defined outside the component — no recreation on every render
function getSignalText(
  vibeKey: string,
  othersCount: number,
  isMe: boolean
): string {
  const emoji = SIGNAL_EMOJI[vibeKey] ?? "✨";
  const label = VIBE_LABEL[vibeKey] ?? vibeKey;

  if (isMe) {
    if (othersCount === 0) return `${emoji} אתה במוד ${label} עכשיו`;
    if (othersCount === 1) return `${emoji} אתה ועוד מישהו אחד`;
    return `${emoji} אתה ועוד ${othersCount} אנשים`;
  }

  if (othersCount === 1) return `${emoji} מישהו אחד במוד ${label}`;
  return `${emoji} ${othersCount} אנשים במוד ${label}`;
}

export function VibesContainer({ currentUserId: _currentUserId }: VibesContainerProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const [vibeRows, myVibe] = await Promise.all([
        getActiveVibes(),
        getMyActiveVibe(),
      ]);
      if (!alive) return;
      const map: Record<string, number> = {};
      for (const row of vibeRows) map[row.vibeKey] = row.count;
      setCounts(map);
      setActiveVibe(myVibe);
      setIsLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  const handleVibeTap = (vibeKey: string) => {
    if (isPending) return;

    const isSame = activeVibe === vibeKey;

    setCounts((prev) => {
      const next = { ...prev };
      if (isSame) {
        next[vibeKey] = Math.max(0, (next[vibeKey] ?? 1) - 1);
      } else {
        if (activeVibe) next[activeVibe] = Math.max(0, (next[activeVibe] ?? 0) - 1);
        next[vibeKey] = (next[vibeKey] ?? 0) + 1;
      }
      return next;
    });
    setActiveVibe(isSame ? null : vibeKey);

    startTransition(async () => {
      if (isSame) {
        await clearUserVibe();
      } else {
        await setUserVibe(vibeKey);
      }
      const rows = await getActiveVibes();
      const map: Record<string, number> = {};
      for (const row of rows) map[row.vibeKey] = row.count;
      setCounts(map);
    });
  };

  // Signal: show user's active vibe first; otherwise show the most popular one
  const signalKey =
    activeVibe ??
    (VIBES.find((v) => (counts[v.key] ?? 0) > 0)?.key ?? null);
  const signalCount = signalKey ? (counts[signalKey] ?? 0) : 0;
  const isMySignal = activeVibe !== null && signalKey === activeVibe;
  const signalOthersCount = Math.max(0, isMySignal ? signalCount - 1 : signalCount);
  const signalText =
    signalKey && (isMySignal || signalOthersCount > 0)
      ? getSignalText(signalKey, signalOthersCount, isMySignal)
      : "";

  return (
    <div className="relative" dir="rtl">
      {/* Header */}
      <h3 className="text-center text-xl font-bold text-gray-800 mb-4">
        היום אני
      </h3>

      {/* Signal line */}
      <div className="mb-4 h-5 text-center">
        <AnimatePresence mode="wait">
          {signalText ? (
            <motion.p
              key={signalText}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.22 }}
              className="text-xs font-medium text-gray-500"
            >
              {signalText}
            </motion.p>
          ) : (
            <span key="empty" className="text-xs text-transparent select-none">
              &nbsp;
            </span>
          )}
        </AnimatePresence>
      </div>

      {/* Vibes row — fixed order, no sorting */}
      <div
        ref={scrollRef}
        className="flex flex-row-reverse justify-center gap-4 overflow-x-auto pb-2 px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading
          ? VIBES.map((vibe) => (
              <div
                key={vibe.key}
                className="flex flex-col items-center gap-2 animate-pulse"
              >
                <div className="rounded-full bg-gray-100" style={{ width: 76, height: 76 }} />
                <div className="h-1.5 w-10 rounded-full bg-gray-100" />
                <div className="h-5 w-16 rounded-full bg-gray-100" />
              </div>
            ))
          : VIBES.map((vibe) => (
              <VibeBubble
                key={vibe.key}
                vibeKey={vibe.key}
                count={counts[vibe.key] ?? 0}
                active={activeVibe === vibe.key}
                isPending={isPending}
                onClick={() => handleVibeTap(vibe.key)}
              />
            ))}
      </div>
    </div>
  );
}
