/**
 * Smart Matches Debug & Trace System
 * 
 * Provides full explainability for candidate scoring.
 * Only runs in development or when SMART_MATCH_DEBUG is enabled.
 * Zero production performance impact.
 */

import { MatchScore } from "./scoring";
import { InsightSignals, MatchInsight } from "./insights";

export interface SmartMatchTrace {
  candidateId: string;
  total: number;
  breakdown: MatchScore["factors"];
  topFactor: string;
  features: {
    ageDiff: number;
    preferredAgeRangeHit: boolean;
    mutualInterests: string[];
    distanceKm: number;
    interactionCount: number;
    candidateCity?: string;
    sameCity: boolean;
    isVerified: boolean;
    lastActiveHours: number;
  };
  signals: string[];
  selectedInsight?: string;
}

export interface SmartMatchDebugSession {
  userId: string;
  generatedAt: string;
  totalCandidates: number;
  candidates: SmartMatchTrace[];
  summary: {
    avgScore: number;
    maxScore: number;
    minScore: number;
    top3Candidates: Array<{ candidateId: string; score: number }>;
  };
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.SMART_MATCH_DEBUG === "true" || process.env.SMART_MATCH_DEBUG === "json";
}

/**
 * Check if JSON export mode is enabled
 */
export function isJsonMode(): boolean {
  return process.env.SMART_MATCH_DEBUG === "json";
}

/**
 * Create a trace object for a candidate
 */
export function createTrace(
  candidateId: string,
  score: MatchScore,
  features: SmartMatchTrace["features"],
  signals: InsightSignals,
  insights: MatchInsight[],
  interactionCount: number
): SmartMatchTrace {
  // Find top contributing factor
  const factorEntries = Object.entries(score.factors) as [string, number][];
  const topFactor = factorEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  return {
    candidateId,
    total: score.total,
    breakdown: score.factors,
    topFactor,
    features: {
      ...features,
      interactionCount,
    },
    signals: insights.map((i) => i.type),
    selectedInsight: insights[0]?.text,
  };
}

/**
 * Log a single trace to console (development mode)
 */
export function logSmartMatchTrace(trace: SmartMatchTrace): void {
  if (!isDebugEnabled() || isJsonMode()) {
    return;
  }

  console.log("==============================");
  console.log("[SmartMatch Trace]");
  console.log(`candidate: ${trace.candidateId}`);
  console.log(`total: ${trace.total}`);
  console.log("breakdown:");
  console.log(`  age: ${trace.breakdown.age}`);
  console.log(`  location: ${trace.breakdown.location}`);
  console.log(`  interest: ${trace.breakdown.interest}`);
  console.log(`  personality: ${trace.breakdown.personality}`);
  console.log(`  behavior: ${trace.breakdown.behavior}`);
  console.log(`topFactor: ${trace.topFactor}`);
  console.log("features:");
  console.log(`  ageDiff: ${trace.features.ageDiff}`);
  console.log(`  preferredAgeRangeHit: ${trace.features.preferredAgeRangeHit}`);
  console.log(`  mutualInterests: [${trace.features.mutualInterests.map(i => `"${i}"`).join(", ")}]`);
  console.log(`  distanceKm: ${trace.features.distanceKm}`);
  console.log(`  sameCity: ${trace.features.sameCity}`);
  console.log(`  interactionCount: ${trace.features.interactionCount}`);
  console.log(`  isVerified: ${trace.features.isVerified}`);
  console.log(`  lastActiveHours: ${trace.features.lastActiveHours}`);
  console.log("signals:");
  trace.signals.forEach((s) => console.log(`  - ${s}`));
  if (trace.selectedInsight) {
    console.log(`selectedInsight: "${trace.selectedInsight}"`);
  }
  console.log("==============================\n");
}

/**
 * Calculate summary statistics from traces
 */
export function calculateSummary(traces: SmartMatchTrace[]): SmartMatchDebugSession["summary"] {
  if (traces.length === 0) {
    return {
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      top3Candidates: [],
    };
  }

  const scores = traces.map((t) => t.total);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const maxScore = Math.round(Math.max(...scores));
  const minScore = Math.round(Math.min(...scores));

  const sorted = [...traces].sort((a, b) => b.total - a.total);
  const top3Candidates = sorted.slice(0, 3).map((t) => ({
    candidateId: t.candidateId,
    score: Math.round(t.total),
  }));

  return {
    avgScore,
    maxScore,
    minScore,
    top3Candidates,
  };
}

/**
 * Export debug session as JSON (when SMART_MATCH_DEBUG=json)
 */
export function exportDebugSession(
  userId: string,
  traces: SmartMatchTrace[]
): void {
  if (!isDebugEnabled() || !isJsonMode()) {
    return;
  }

  const session: SmartMatchDebugSession = {
    userId,
    generatedAt: new Date().toISOString(),
    totalCandidates: traces.length,
    candidates: traces,
    summary: calculateSummary(traces),
  };

  console.log("\n========== SMART MATCH DEBUG SESSION (JSON) ==========");
  console.log(JSON.stringify(session, null, 2));
  console.log("======================================================\n");
}

/**
 * Log summary statistics to console
 */
export function logSummary(userId: string, traces: SmartMatchTrace[]): void {
  if (!isDebugEnabled() || isJsonMode()) {
    return;
  }

  const summary = calculateSummary(traces);

  console.log("\n========== SMART MATCH SUMMARY ==========");
  console.log(`User: ${userId}`);
  console.log(`Total Candidates Scored: ${traces.length}`);
  console.log(`Average Score: ${summary.avgScore}`);
  console.log(`Max Score: ${summary.maxScore}`);
  console.log(`Min Score: ${summary.minScore}`);
  console.log("\nTop 3 Candidates:");
  summary.top3Candidates.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.candidateId} - Score: ${c.score}`);
  });
  console.log("=========================================\n");
}
