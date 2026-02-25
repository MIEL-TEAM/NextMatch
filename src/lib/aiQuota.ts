import { prisma } from "@/lib/prisma";

const AI_QUOTA_FREE = 5;
const AI_QUOTA_PREMIUM = 30;

function todayMidnightIsrael(): Date {
  const now = new Date();
  const tz = "Asia/Jerusalem";

  const toMinutes = (parts: Intl.DateTimeFormatPart[]) => {
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return (h === 24 ? 0 : h) * 60 + m;
  };

  const opts = { hour: "numeric", minute: "numeric", hour12: false } as const;
  const ilMin = toMinutes(new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).formatToParts(now));
  const utcMin = toMinutes(new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).formatToParts(now));

  let offsetMin = ilMin - utcMin;
  if (offsetMin < -720) offsetMin += 1440;
  if (offsetMin > 720) offsetMin -= 1440;

  const dateStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  const [y, mo, d] = dateStr.split("-").map(Number);

  return new Date(Date.UTC(y, mo - 1, d) - offsetMin * 60 * 1000);
}

function nextMidnightIsrael(): Date {
  return new Date(todayMidnightIsrael().getTime() + 24 * 60 * 60 * 1000);
}

function resolveTier(user: { isPremium: boolean; premiumUntil: Date | null }): "free" | "premium" {
  if (user.isPremium && user.premiumUntil && user.premiumUntil > new Date()) {
    return "premium";
  }
  return "free";
}

export interface AIQuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  tier: "free" | "premium";
}

export async function checkAndIncrementAIQuota(
  userId: string,
  user: { isPremium: boolean; premiumUntil: Date | null }
): Promise<AIQuotaResult> {
  const tier = resolveTier(user);
  const limit = tier === "premium" ? AI_QUOTA_PREMIUM : AI_QUOTA_FREE;
  const todayMidnight = todayMidnightIsrael();

  return prisma.$transaction(async (tx) => {
    let quota = await tx.userQuota.upsert({
      where: { userId },
      create: { userId, aiUsageToday: 0, aiResetAt: nextMidnightIsrael() },
      update: {},
      select: { aiUsageToday: true, aiResetAt: true },
    });

    if (quota.aiResetAt < todayMidnight) {
      quota = await tx.userQuota.update({
        where: { userId },
        data: { aiUsageToday: 0, aiResetAt: nextMidnightIsrael() },
        select: { aiUsageToday: true, aiResetAt: true },
      });
    }

    if (quota.aiUsageToday >= limit) {
      console.info("[ai/quota] blocked", { userId, usage: quota.aiUsageToday, limit, tier });
      return { allowed: false, remaining: 0, limit, tier };
    }

    const newUsage = quota.aiUsageToday + 1;
    await tx.userQuota.update({
      where: { userId },
      data: { aiUsageToday: newUsage },
    });

    console.info("[ai/quota] allowed", { userId, usage: newUsage, limit, tier });
    return { allowed: true, remaining: limit - newUsage, limit, tier };
  });
}

export async function getAIQuotaStatus(userId: string): Promise<AIQuotaResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumUntil: true },
  });

  if (!user) {
    return { allowed: false, remaining: 0, limit: AI_QUOTA_FREE, tier: "free" };
  }

  const tier = resolveTier(user);
  const limit = tier === "premium" ? AI_QUOTA_PREMIUM : AI_QUOTA_FREE;
  const todayMidnight = todayMidnightIsrael();

  const quota = await prisma.userQuota.findUnique({
    where: { userId },
    select: { aiUsageToday: true, aiResetAt: true },
  });

  if (!quota || quota.aiResetAt < todayMidnight) {
    return { allowed: true, remaining: limit, limit, tier };
  }

  const remaining = Math.max(0, limit - quota.aiUsageToday);
  return { allowed: remaining > 0, remaining, limit, tier };
}
