import { prisma } from "@/lib/prisma";
import { BUILD_FINGERPRINT } from "@/lib/buildFingerprint";

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
  const now = new Date();
  const resultTier = user.isPremium && user.premiumUntil && user.premiumUntil > now
    ? "premium"
    : "free";

  // INVESTIGATION — TIER_RUNTIME
  console.log("TIER_RUNTIME", {
    build: BUILD_FINGERPRINT,
    isPremium: user.isPremium,
    premiumUntil: user.premiumUntil,
    now,
    resultTier,
  });

  return resultTier;
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

    // Use <= to ensure reset triggers when aiResetAt equals today's midnight.
    // nextMidnightIsrael() from the previous day equals todayMidnightIsrael()
    // exactly — strict < would skip the reset on day boundaries.
    if (quota.aiResetAt <= todayMidnight) {
      quota = await tx.userQuota.update({
        where: { userId },
        data: { aiUsageToday: 0, aiResetAt: nextMidnightIsrael() },
        select: { aiUsageToday: true, aiResetAt: true },
      });
    }

    // INVESTIGATION — QUOTA_WRITE_BEFORE
    console.log("QUOTA_WRITE_BEFORE", {
      build: BUILD_FINGERPRINT,
      userId,
      aiUsageToday: quota.aiUsageToday,
      aiResetAt: quota.aiResetAt,
      todayMidnight,
      limit,
      tier,
      willBlock: quota.aiUsageToday >= limit,
    });

    if (quota.aiUsageToday >= limit) {
      console.info("[ai/quota] blocked", { userId, usage: quota.aiUsageToday, limit, tier });
      return { allowed: false, remaining: 0, limit, tier };
    }

    const newUsage = quota.aiUsageToday + 1;
    const updated = await tx.userQuota.update({
      where: { userId },
      data: { aiUsageToday: newUsage },
      select: { aiUsageToday: true },
    });

    // INVESTIGATION — QUOTA_WRITE_AFTER
    console.log("QUOTA_WRITE_AFTER", {
      build: BUILD_FINGERPRINT,
      userId,
      newUsage: updated.aiUsageToday,
      limit,
      remaining: limit - updated.aiUsageToday,
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

  // INVESTIGATION — QUOTA_READ
  console.log("QUOTA_READ", {
    build: BUILD_FINGERPRINT,
    userId,
    aiUsageToday: quota?.aiUsageToday ?? null,
    aiResetAt: quota?.aiResetAt ?? null,
    todayMidnight,
    limit,
    tier,
    noQuotaRow: !quota,
    resetCondition: quota
      ? `${quota.aiResetAt.toISOString()} <= ${todayMidnight.toISOString()} → ${quota.aiResetAt <= todayMidnight}`
      : "no row",
  });

  // Use <= (not <) to match checkAndIncrementAIQuota semantics.
  // When aiResetAt equals todayMidnight exactly (the normal day-boundary case),
  // strict < would report yesterday's exhausted count as if it were today's —
  // locking the UI before the write path ever gets a chance to reset.
  if (!quota || quota.aiResetAt <= todayMidnight) {
    return { allowed: true, remaining: limit, limit, tier };
  }

  const remaining = Math.max(0, limit - quota.aiUsageToday);
  return { allowed: remaining > 0, remaining, limit, tier };
}
