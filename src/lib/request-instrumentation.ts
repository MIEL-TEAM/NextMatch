/**
 * Request-level instrumentation
 *
 * Tracks API requests and sets context for Prisma query logging
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requestContext,
  prismaInstrumentation,
} from "./prisma-instrumentation";
import { nanoid } from "nanoid";

export interface RequestLog {
  requestId: string;
  endpoint: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  queriesCount?: number;
  totalQueryTime?: number;
}

class RequestInstrumentation {
  private requests: RequestLog[] = [];
  private enabled = process.env.PRISMA_INSTRUMENTATION === "true";

  logRequest(log: RequestLog) {
    if (!this.enabled) return;
    this.requests.push(log);
  }

  getRequests() {
    return [...this.requests];
  }

  reset() {
    this.requests = [];
  }

  printSummary() {
    if (!this.enabled) return;

    console.log("\n" + "=".repeat(80));
    console.log("🌐 API REQUEST SUMMARY");
    console.log("=".repeat(80));

    const sortedByDuration = [...this.requests]
      .filter((r) => r.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 20);

    console.log(`\n⏱️  SLOWEST ENDPOINTS (Top 20)`);
    sortedByDuration.forEach((req, idx) => {
      console.log(`   ${idx + 1}. ${req.method} ${req.endpoint}`);
      console.log(`      Duration: ${req.duration}ms`);
      console.log(`      Queries: ${req.queriesCount || 0}`);
      console.log(`      Query Time: ${req.totalQueryTime || 0}ms`);
      if (req.totalQueryTime && req.duration) {
        const percentage = ((req.totalQueryTime / req.duration) * 100).toFixed(
          1
        );
        console.log(`      Query %: ${percentage}%`);
      }
    });

    console.log("\n" + "=".repeat(80) + "\n");
  }
}

export const requestInstrumentation = new RequestInstrumentation();

/**
 * Wrapper for API route handlers that adds instrumentation
 */
export function instrumentApiRoute<T>(
  handler: (req: NextRequest, context?: T) => Promise<NextResponse>,
  endpoint: string
) {
  return async (req: NextRequest, context?: T) => {
    const requestId = nanoid();
    const startTime = Date.now();

    // Set request context for Prisma queries
    requestContext.set(requestId, endpoint);

    const requestLog: RequestLog = {
      requestId,
      endpoint,
      method: req.method,
      startTime,
    };

    try {
      const response = await handler(req, context);

      const endTime = Date.now();
      const queries = prismaInstrumentation.getRequestQueries(requestId);

      requestLog.endTime = endTime;
      requestLog.duration = endTime - startTime;
      requestLog.queriesCount = queries.length;
      requestLog.totalQueryTime = queries.reduce(
        (sum, q) => sum + q.executionTime,
        0
      );

      requestInstrumentation.logRequest(requestLog);

      if (process.env.NODE_ENV === "development" && queries.length > 0) {
        console.log(`\n📦 Request ${requestId} completed:`);
        console.log(`   Endpoint: ${endpoint}`);
        console.log(`   Duration: ${requestLog.duration}ms`);
        console.log(`   Queries: ${requestLog.queriesCount}`);
        console.log(`   Query Time: ${requestLog.totalQueryTime}ms`);
      }

      // Clean up
      prismaInstrumentation.clearRequest(requestId);
      requestContext.clear();

      return response;
    } catch (error) {
      const endTime = Date.now();
      const queries = prismaInstrumentation.getRequestQueries(requestId);

      requestLog.endTime = endTime;
      requestLog.duration = endTime - startTime;
      requestLog.queriesCount = queries.length;
      requestLog.totalQueryTime = queries.reduce(
        (sum, q) => sum + q.executionTime,
        0
      );

      requestInstrumentation.logRequest(requestLog);

      // Clean up
      prismaInstrumentation.clearRequest(requestId);
      requestContext.clear();

      throw error;
    }
  };
}

/**
 * Helper for Server Actions
 */
export async function instrumentServerAction<T>(
  action: () => Promise<T>,
  actionName: string
): Promise<T> {
  const requestId = nanoid();
  const startTime = Date.now();

  // Set request context
  requestContext.set(requestId, `[Action] ${actionName}`);

  const requestLog: RequestLog = {
    requestId,
    endpoint: `[Action] ${actionName}`,
    method: "SERVER_ACTION",
    startTime,
  };

  try {
    const result = await action();

    const endTime = Date.now();
    const queries = prismaInstrumentation.getRequestQueries(requestId);

    requestLog.endTime = endTime;
    requestLog.duration = endTime - startTime;
    requestLog.queriesCount = queries.length;
    requestLog.totalQueryTime = queries.reduce(
      (sum, q) => sum + q.executionTime,
      0
    );

    requestInstrumentation.logRequest(requestLog);

    if (process.env.NODE_ENV === "development" && queries.length > 0) {
      console.log(`\n🎬 Server Action ${actionName} completed:`);
      console.log(`   Duration: ${requestLog.duration}ms`);
      console.log(`   Queries: ${requestLog.queriesCount}`);
      console.log(`   Query Time: ${requestLog.totalQueryTime}ms`);
    }

    // Clean up
    prismaInstrumentation.clearRequest(requestId);
    requestContext.clear();

    return result;
  } catch (error) {
    const endTime = Date.now();
    const queries = prismaInstrumentation.getRequestQueries(requestId);

    requestLog.endTime = endTime;
    requestLog.duration = endTime - startTime;
    requestLog.queriesCount = queries.length;
    requestLog.totalQueryTime = queries.reduce(
      (sum, q) => sum + q.executionTime,
      0
    );

    requestInstrumentation.logRequest(requestLog);

    // Clean up
    prismaInstrumentation.clearRequest(requestId);
    requestContext.clear();

    throw error;
  }
}
