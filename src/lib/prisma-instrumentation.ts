/**
 * Prisma Query Instrumentation & Performance Monitoring
 *
 * This module instruments all Prisma queries to:
 * - Track execution time
 * - Log query parameters
 * - Identify call origin (file + function)
 * - Detect N+1 patterns
 * - Group queries by endpoint/request
 */

interface QueryLog {
  timestamp: number;
  method: string;
  model: string;
  operation: string;
  executionTime: number;
  params: unknown;
  callOrigin: string;
  endpoint?: string;
  requestId?: string;
}

interface PerformanceReport {
  totalQueries: number;
  totalTime: number;
  byEndpoint: Record<
    string,
    {
      count: number;
      totalTime: number;
      queries: QueryLog[];
    }
  >;
  byModel: Record<
    string,
    {
      count: number;
      totalTime: number;
    }
  >;
  slowQueries: QueryLog[];
  repeatedQueries: Array<{
    query: string;
    count: number;
    queries: QueryLog[];
  }>;
}

class PrismaInstrumentation {
  private queryLogs: QueryLog[] = [];
  private requestQueries: Map<string, QueryLog[]> = new Map();
  private enabled = process.env.PRISMA_INSTRUMENTATION === "true";

  logQuery(log: QueryLog) {
    if (!this.enabled) return;

    this.queryLogs.push(log);

    // Group by request ID
    if (log.requestId) {
      const existing = this.requestQueries.get(log.requestId) || [];
      existing.push(log);
      this.requestQueries.set(log.requestId, existing);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`\n🔍 PRISMA QUERY [${log.requestId || "no-request-id"}]`);
      console.log(`   Endpoint: ${log.endpoint || "unknown"}`);
      console.log(`   Model: ${log.model}`);
      console.log(`   Operation: ${log.operation}`);
      console.log(`   Method: ${log.method}`);
      console.log(`   Time: ${log.executionTime}ms`);
      console.log(`   Origin: ${log.callOrigin}`);
      console.log(`   Params:`, this.sanitizeParams(log.params));
    }
  }

  getRequestQueries(requestId: string): QueryLog[] {
    return this.requestQueries.get(requestId) || [];
  }

  clearRequest(requestId: string) {
    this.requestQueries.delete(requestId);
  }

  getAllQueries(): QueryLog[] {
    return [...this.queryLogs];
  }

  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      totalQueries: this.queryLogs.length,
      totalTime: 0,
      byEndpoint: {},
      byModel: {},
      slowQueries: [],
      repeatedQueries: [],
    };

    // Aggregate by endpoint
    this.queryLogs.forEach((log) => {
      report.totalTime += log.executionTime;

      // By endpoint
      const endpoint = log.endpoint || "unknown";
      if (!report.byEndpoint[endpoint]) {
        report.byEndpoint[endpoint] = { count: 0, totalTime: 0, queries: [] };
      }
      report.byEndpoint[endpoint].count++;
      report.byEndpoint[endpoint].totalTime += log.executionTime;
      report.byEndpoint[endpoint].queries.push(log);

      // By model
      if (!report.byModel[log.model]) {
        report.byModel[log.model] = { count: 0, totalTime: 0 };
      }
      report.byModel[log.model].count++;
      report.byModel[log.model].totalTime += log.executionTime;

      // Slow queries (>100ms)
      if (log.executionTime > 100) {
        report.slowQueries.push(log);
      }
    });

    // Sort slow queries by execution time
    report.slowQueries.sort((a, b) => b.executionTime - a.executionTime);

    // Detect repeated queries
    const querySignatures = new Map<string, QueryLog[]>();
    this.queryLogs.forEach((log) => {
      const signature = `${log.model}.${log.operation}`;
      const existing = querySignatures.get(signature) || [];
      existing.push(log);
      querySignatures.set(signature, existing);
    });

    querySignatures.forEach((logs, signature) => {
      if (logs.length > 1) {
        report.repeatedQueries.push({
          query: signature,
          count: logs.length,
          queries: logs,
        });
      }
    });

    // Sort repeated queries by count
    report.repeatedQueries.sort((a, b) => b.count - a.count);

    return report;
  }

  printReport() {
    if (!this.enabled) {
      console.log(
        "❌ Prisma instrumentation is not enabled. Set PRISMA_INSTRUMENTATION=true"
      );
      return;
    }

    const report = this.generateReport();

    console.log("\n\n" + "=".repeat(80));
    console.log("📊 PRISMA PERFORMANCE REPORT");
    console.log("=".repeat(80));

    console.log(`\n📈 OVERVIEW`);
    console.log(`   Total Queries: ${report.totalQueries}`);
    console.log(`   Total Time: ${report.totalTime.toFixed(2)}ms`);
    console.log(
      `   Average Time: ${(report.totalTime / report.totalQueries).toFixed(2)}ms`
    );

    console.log(`\n⚡ SLOWEST QUERIES (Top 10)`);
    report.slowQueries.slice(0, 10).forEach((log, idx) => {
      console.log(
        `   ${idx + 1}. ${log.model}.${log.operation} - ${log.executionTime}ms`
      );
      console.log(`      Endpoint: ${log.endpoint || "unknown"}`);
      console.log(`      Origin: ${log.callOrigin}`);
    });

    console.log(`\n🔄 MOST REPEATED QUERIES (Top 10)`);
    report.repeatedQueries.slice(0, 10).forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.query} - ${item.count} times`);
      const totalTime = item.queries.reduce(
        (sum, q) => sum + q.executionTime,
        0
      );
      console.log(`      Total Time: ${totalTime.toFixed(2)}ms`);
      console.log(`      Avg Time: ${(totalTime / item.count).toFixed(2)}ms`);
    });

    console.log(`\n🎯 BY ENDPOINT`);
    const sortedEndpoints = Object.entries(report.byEndpoint)
      .sort((a, b) => b[1].totalTime - a[1].totalTime)
      .slice(0, 15);

    sortedEndpoints.forEach(([endpoint, stats]) => {
      console.log(`   ${endpoint}`);
      console.log(`      Queries: ${stats.count}`);
      console.log(`      Total Time: ${stats.totalTime.toFixed(2)}ms`);
      console.log(
        `      Avg Time: ${(stats.totalTime / stats.count).toFixed(2)}ms`
      );
    });

    console.log(`\n📦 BY MODEL`);
    const sortedModels = Object.entries(report.byModel).sort(
      (a, b) => b[1].count - a[1].count
    );

    sortedModels.forEach(([model, stats]) => {
      console.log(`   ${model}`);
      console.log(`      Queries: ${stats.count}`);
      console.log(`      Total Time: ${stats.totalTime.toFixed(2)}ms`);
      console.log(
        `      Avg Time: ${(stats.totalTime / stats.count).toFixed(2)}ms`
      );
    });

    // Detect N+1 patterns
    console.log(`\n🚨 POTENTIAL N+1 PATTERNS`);
    this.requestQueries.forEach((queries, requestId) => {
      const groupedByModel = new Map<string, QueryLog[]>();
      queries.forEach((q) => {
        const key = `${q.model}.${q.operation}`;
        const existing = groupedByModel.get(key) || [];
        existing.push(q);
        groupedByModel.set(key, existing);
      });

      groupedByModel.forEach((logs, key) => {
        if (logs.length > 3) {
          // More than 3 similar queries in one request
          console.log(
            `   ⚠️  ${key} called ${logs.length} times in request ${requestId}`
          );
          console.log(`      Endpoint: ${logs[0].endpoint || "unknown"}`);
          console.log(
            `      Total Time: ${logs.reduce((sum, l) => sum + l.executionTime, 0).toFixed(2)}ms`
          );
        }
      });
    });

    console.log("\n" + "=".repeat(80) + "\n");
  }

  reset() {
    this.queryLogs = [];
    this.requestQueries.clear();
  }

  exportReport(): PerformanceReport {
    return this.generateReport();
  }

  private sanitizeParams(params: unknown): unknown {
    if (typeof params !== "object" || params === null) return params;

    const sanitized = { ...(params as Record<string, unknown>) };

    // Remove sensitive fields
    const sensitiveFields = ["password", "passwordHash", "token", "secret"];
    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }
}

// Singleton instance
export const prismaInstrumentation = new PrismaInstrumentation();

// Helper to get call stack origin
export function getCallOrigin(): string {
  const stack = new Error().stack;
  if (!stack) return "unknown";

  const lines = stack.split("\n");
  // Skip first 3 lines (Error, getCallOrigin, caller)
  for (let i = 3; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    // Look for app code (not node_modules)
    if (line.includes("/app/") || line.includes("/lib/")) {
      const match = line.match(/\((.+):(\d+):(\d+)\)/);
      if (match) {
        const [, filepath, lineNum] = match;
        const shortPath =
          filepath.split("/app/").pop() ||
          filepath.split("/lib/").pop() ||
          filepath;
        return `${shortPath}:${lineNum}`;
      }
    }
  }

  return "unknown";
}

// Request context tracking
export const requestContext = {
  current: null as { requestId: string; endpoint: string } | null,

  set(requestId: string, endpoint: string) {
    this.current = { requestId, endpoint };
  },

  clear() {
    this.current = null;
  },

  get() {
    return this.current;
  },
};
