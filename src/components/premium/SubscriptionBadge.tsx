const BADGE_CONFIG = {
  ACTIVE: { dot: "bg-amber-700", text: "text-amber-700", label: "פעיל" },
  CANCELED: { dot: "bg-stone-400", text: "text-stone-500", label: "יסתיים בקרוב" },
  PAST_DUE: { dot: "bg-red-600", text: "text-red-600", label: "בעיה בחיוב" },
} as const;

interface SubscriptionBadgeProps {
  status: keyof typeof BADGE_CONFIG;
}

export function SubscriptionBadge({ status }: SubscriptionBadgeProps) {
  const { dot, text, label } = BADGE_CONFIG[status];
  return (
    <span className={`flex items-center gap-1.5 text-[12px] font-medium ${text}`}>
      <span className={`w-2 h-2 rounded-full inline-block ${dot}`} />
      {label}
    </span>
  );
}
