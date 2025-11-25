/**
 * Instrumented Prisma Client
 *
 * This wraps the Prisma client with performance monitoring.
 * Use this instead of the regular prisma client when instrumentation is needed.
 */

import { PrismaClient } from "@prisma/client";
import {
  prismaInstrumentation,
  getCallOrigin,
  requestContext,
} from "./prisma-instrumentation";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  instrumentedPrisma: PrismaClient;
};

function createInstrumentedPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

  // Add Prisma middleware to track queries
  client.$use(async (params, next) => {
    const start = Date.now();
    const callOrigin = getCallOrigin();
    const context = requestContext.get();

    try {
      const result = await next(params);
      const executionTime = Date.now() - start;

      // Log the query
      prismaInstrumentation.logQuery({
        timestamp: start,
        method: params.action,
        model: params.model || "unknown",
        operation: params.action,
        executionTime,
        params: params.args,
        callOrigin,
        endpoint: context?.endpoint,
        requestId: context?.requestId,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - start;

      // Log failed query
      prismaInstrumentation.logQuery({
        timestamp: start,
        method: params.action,
        model: params.model || "unknown",
        operation: `${params.action} [FAILED]`,
        executionTime,
        params: params.args,
        callOrigin,
        endpoint: context?.endpoint,
        requestId: context?.requestId,
      });

      throw error;
    }
  });

  return client;
}

// Use instrumented client if enabled, otherwise use regular client
export const prismaInstrumented =
  globalForPrisma.instrumentedPrisma ||
  (process.env.PRISMA_INSTRUMENTATION === "true"
    ? createInstrumentedPrismaClient()
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query"] : [],
      }));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.instrumentedPrisma = prismaInstrumented;
}
