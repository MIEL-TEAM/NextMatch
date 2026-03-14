"use client";

import { motion } from "framer-motion";
import Icon, { IconNames } from "@/lib/table/Icon";

const VIBE_UI: Record<string, {
  iconName: IconNames;
  iconType: "lit" | "reg" | "sol";
  text: string;
  color: string;
  activeBg: string;
}> = {
  flirty: {
    iconName: "fire",
    iconType: "sol",
    text: "במוד פלרטט",
    color: "#e63462",
    activeBg: "#fde8ef",
  },
  coffee: {
    iconName: "mug-hot",
    iconType: "sol",
    text: "קפה מישהו?",
    color: "#d97706",
    activeBg: "#fef3c7",
  },
  chat: {
    iconName: "comment-dots",
    iconType: "sol",
    text: "בא לי לדבר",
    color: "#3b82f6",
    activeBg: "#dbeafe",
  },
  drinks: {
    iconName: "wine-glass",
    iconType: "sol",
    text: "דרינק הערב",
    color: "#7c3aed",
    activeBg: "#ede9fe",
  },
  music: {
    iconName: "headphones",
    iconType: "sol",
    text: "במוזיקה עכשיו",
    color: "#0d9488",
    activeBg: "#ccfbf1",
  },
  browse: {
    iconName: "sparkle",
    iconType: "sol",
    text: "רק מסתכל",
    color: "#94a3b8",
    activeBg: "#f1f5f9",
  },
};

const FALLBACK_UI = {
  iconName: "sparkle" as IconNames,
  iconType: "sol" as const,
  text: "",
  color: "#94a3b8",
  activeBg: "#f1f5f9",
};

interface VibeBubbleProps {
  vibeKey: string;
  count: number;
  active: boolean;
  isPending: boolean;
  onClick: () => void;
}

function getPillLabel(text: string, othersCount: number, active: boolean): string {
  if (active && othersCount > 1) return `${text} • ${othersCount}`;
  if (active && othersCount === 1) return `${text} • 1`;
  if (active) return text;
  if (othersCount === 0) return text;
  if (othersCount === 1) return `${text} (1)`;
  return `${text} (${othersCount})`;
}

export function VibeBubble({ vibeKey, count, active, isPending, onClick }: VibeBubbleProps) {
  const ui = VIBE_UI[vibeKey] ?? FALLBACK_UI;

  const othersCount = Math.max(0, active ? count - 1 : count);

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer select-none"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.18 }}
      style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}
    >
      {/* Circle */}
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          background: active ? ui.activeBg : "#ffffff",
          border: `2px solid ${ui.color}`,
          boxShadow: active
            ? `0 0 0 4px ${ui.color}22, 0 4px 16px ${ui.color}33`
            : "0 2px 8px rgba(0,0,0,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
      >
        <Icon
          name={ui.iconName}
          type={ui.iconType}
          className="size-8"
          style={{ background: ui.color }}
        />
      </div>

      {/* Dotted connector */}
      <div
        style={{
          width: 1,
          height: 18,
          borderLeft: `2px dashed ${ui.color}66`,
          margin: "0 auto",
        }}
      />

      {/* Pill label */}
      <div
        style={{
          border: `1.5px solid ${ui.color}`,
          borderRadius: 999,
          padding: "3px 10px",
          background: active ? ui.activeBg : "#ffffff",
          transition: "all 0.2s ease",
        }}
      >
        <span
          className="text-[11px] font-semibold whitespace-nowrap"
          style={{ color: ui.color }}
        >
          {getPillLabel(ui.text, othersCount, active)}
        </span>
      </div>
    </motion.div>
  );
}
