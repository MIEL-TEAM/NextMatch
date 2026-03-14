export const VIBES = [
  { key: "flirty", label: "🔥 במוד פלרטט" },
  { key: "coffee", label: "☕ קפה מישהו?" },
  { key: "chat", label: "💬 בא לי לדבר" },
  { key: "drinks", label: "🍷 דרינק הערב" },
  { key: "music", label: "🎧 במוזיקה עכשיו" },
  { key: "browse", label: "✨ רק מסתכל" },
] as const;

export type VibeKey = (typeof VIBES)[number]["key"];

export const VIBE_LABEL: Record<string, string> = Object.fromEntries(
  VIBES.map((v) => [v.key, v.label])
);

export const VIBE_EXPIRY_HOURS = 3;
