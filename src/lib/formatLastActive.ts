export function formatLastActive(date: Date | null | undefined): string {
  if (!date) return "";

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return `🕒 פעיל לפני ${minutes} דקות`;
  if (hours === 1) return "🕒 פעיל לפני שעה";
  if (hours < 24) return `🕒 פעיל לפני ${hours} שעות`;
  if (days === 1) return "🕒 פעיל לפני יום";
  return `🕒 פעיל לפני ${days} ימים`;
}
