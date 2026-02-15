/**
 * Example unit tests for the Smart Match Debug System
 *
 * These are example tests to demonstrate how to test the debug system.
 * Copy to debug.test.ts and run with your test framework.
 */

// Uncomment if using Jest:
// import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

import {
  isDebugEnabled,
  isJsonMode,
  createTrace,
  calculateSummary,
  SmartMatchTrace,
} from "./debug";
import { MatchScore } from "./scoring";
import { InsightSignals, MatchInsight } from "./insights";

describe("Smart Match Debug System", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment after each test
    process.env = originalEnv;
  });

  describe("isDebugEnabled", () => {
    test("returns false in production", () => {
      process.env.NODE_ENV = "production";
      process.env.SMART_MATCH_DEBUG = "true";

      expect(isDebugEnabled()).toBe(false);
    });

    test("returns true in development with SMART_MATCH_DEBUG=true", () => {
      process.env.NODE_ENV = "development";
      process.env.SMART_MATCH_DEBUG = "true";

      expect(isDebugEnabled()).toBe(true);
    });

    test("returns true in development with SMART_MATCH_DEBUG=json", () => {
      process.env.NODE_ENV = "development";
      process.env.SMART_MATCH_DEBUG = "json";

      expect(isDebugEnabled()).toBe(true);
    });

    test("returns false when SMART_MATCH_DEBUG is not set", () => {
      process.env.NODE_ENV = "development";
      delete process.env.SMART_MATCH_DEBUG;

      expect(isDebugEnabled()).toBe(false);
    });
  });

  describe("isJsonMode", () => {
    test("returns true when SMART_MATCH_DEBUG=json", () => {
      process.env.SMART_MATCH_DEBUG = "json";

      expect(isJsonMode()).toBe(true);
    });

    test("returns false when SMART_MATCH_DEBUG=true", () => {
      process.env.SMART_MATCH_DEBUG = "true";

      expect(isJsonMode()).toBe(false);
    });
  });

  describe("createTrace", () => {
    test("creates a valid trace object", () => {
      const score: MatchScore = {
        total: 78,
        factors: {
          age: 20,
          location: 15,
          interest: 25,
          personality: 8,
          behavior: 10,
        },
      };

      const features = {
        ageDiff: 2,
        preferredAgeRangeHit: true,
        mutualInterests: ["hiking", "tech"],
        distanceKm: 3,
        sameCity: true,
        isVerified: true,
        lastActiveHours: 0,
        interactionCount: 5,
      };

      const signals: InsightSignals = {
        mutualInterests: ["hiking", "tech"],
        distanceKm: 3,
        ageDiff: 2,
        lastActiveHours: 0,
        isVerified: true,
        matchScore: 78,
      };

      const insights: MatchInsight[] = [
        {
          type: "mutual_interest_count",
          text: "2 shared interests detected",
          weight: 1.0,
          metadata: { count: 2, items: ["hiking", "tech"] },
        },
        {
          type: "location_exact",
          text: "Within 5km radius",
          weight: 0.8,
        },
      ];

      const trace = createTrace(
        "cm2abc123",
        score,
        features,
        signals,
        insights,
        5,
      );

      expect(trace.candidateId).toBe("cm2abc123");
      expect(trace.total).toBe(78);
      expect(trace.topFactor).toBe("interest"); // Highest score
      expect(trace.features.mutualInterests).toEqual(["hiking", "tech"]);
      expect(trace.signals).toEqual([
        "mutual_interest_count",
        "location_exact",
      ]);
      expect(trace.selectedInsight).toBe("2 shared interests detected");
    });

    test("identifies correct top factor", () => {
      const score: MatchScore = {
        total: 60,
        factors: {
          age: 25, // Highest
          location: 10,
          interest: 15,
          personality: 5,
          behavior: 5,
        },
      };

      const trace = createTrace(
        "test-user",
        score,
        {
          ageDiff: 0,
          preferredAgeRangeHit: true,
          mutualInterests: [],
          distanceKm: 100,
          sameCity: false,
          isVerified: false,
          lastActiveHours: 24,
          interactionCount: 0,
        },
        {} as InsightSignals,
        [],
        0,
      );

      expect(trace.topFactor).toBe("age");
    });
  });

  describe("calculateSummary", () => {
    test("calculates correct summary statistics", () => {
      const traces: SmartMatchTrace[] = [
        {
          candidateId: "user1",
          total: 89,
          breakdown: {
            age: 20,
            location: 20,
            interest: 25,
            personality: 14,
            behavior: 10,
          },
          topFactor: "interest",
          features: {} as any,
          signals: [],
        },
        {
          candidateId: "user2",
          total: 65,
          breakdown: {
            age: 15,
            location: 20,
            interest: 15,
            personality: 10,
            behavior: 5,
          },
          topFactor: "location",
          features: {} as any,
          signals: [],
        },
        {
          candidateId: "user3",
          total: 42,
          breakdown: {
            age: 10,
            location: 8,
            interest: 12,
            personality: 7,
            behavior: 5,
          },
          topFactor: "interest",
          features: {} as any,
          signals: [],
        },
      ];

      const summary = calculateSummary(traces);

      expect(summary.avgScore).toBe(65); // (89 + 65 + 42) / 3 = 65.33 → 65
      expect(summary.maxScore).toBe(89);
      expect(summary.minScore).toBe(42);
      expect(summary.top3Candidates).toHaveLength(3);
      expect(summary.top3Candidates[0]).toEqual({
        candidateId: "user1",
        score: 89,
      });
      expect(summary.top3Candidates[1]).toEqual({
        candidateId: "user2",
        score: 65,
      });
      expect(summary.top3Candidates[2]).toEqual({
        candidateId: "user3",
        score: 42,
      });
    });

    test("handles empty traces array", () => {
      const summary = calculateSummary([]);

      expect(summary.avgScore).toBe(0);
      expect(summary.maxScore).toBe(0);
      expect(summary.minScore).toBe(0);
      expect(summary.top3Candidates).toHaveLength(0);
    });

    test("limits to top 3 candidates even with more traces", () => {
      const traces: SmartMatchTrace[] = Array.from({ length: 10 }, (_, i) => ({
        candidateId: `user${i}`,
        total: 100 - i * 10,
        breakdown: {
          age: 20,
          location: 20,
          interest: 20,
          personality: 20,
          behavior: 20,
        },
        topFactor: "age",
        features: {} as any,
        signals: [],
      }));

      const summary = calculateSummary(traces);

      expect(summary.top3Candidates).toHaveLength(3);
      expect(summary.top3Candidates[0].candidateId).toBe("user0");
      expect(summary.top3Candidates[0].score).toBe(100);
      expect(summary.top3Candidates[2].candidateId).toBe("user2");
      expect(summary.top3Candidates[2].score).toBe(80);
    });
  });

  describe("Production Safety", () => {
    test("debug functions are safe to call in production", () => {
      process.env.NODE_ENV = "production";
      process.env.SMART_MATCH_DEBUG = "true";

      // These should all be safe no-ops
      expect(() => {
        isDebugEnabled(); // Should return false
        isJsonMode(); // Should return false
      }).not.toThrow();
    });
  });
});

// Example of how to test console output (if needed)
describe("Console Output", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.SMART_MATCH_DEBUG = "true";
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("logSmartMatchTrace outputs formatted trace", async () => {
    // Dynamic import after setting env vars
    const { logSmartMatchTrace } = await import("./debug");

    const trace: SmartMatchTrace = {
      candidateId: "cm2abc123",
      total: 78,
      breakdown: {
        age: 20,
        location: 15,
        interest: 25,
        personality: 8,
        behavior: 10,
      },
      topFactor: "interest",
      features: {
        ageDiff: 2,
        preferredAgeRangeHit: true,
        mutualInterests: ["hiking", "tech"],
        distanceKm: 3,
        sameCity: true,
        isVerified: true,
        lastActiveHours: 0,
        interactionCount: 5,
      },
      signals: ["mutual_interest_count", "location_exact"],
      selectedInsight: "2 shared interests detected",
    };

    logSmartMatchTrace(trace);

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("[SmartMatch Trace]");
    expect(consoleSpy).toHaveBeenCalledWith("candidate: cm2abc123");
    expect(consoleSpy).toHaveBeenCalledWith("total: 78");
  });
});
