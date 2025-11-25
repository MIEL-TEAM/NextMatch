/**
 * Generate Performance Report
 *
 * This script generates a comprehensive performance report from
 * the instrumented Prisma queries
 */

import { prismaInstrumentation } from "../src/lib/prisma-instrumentation.js";
import { requestInstrumentation } from "../src/lib/request-instrumentation.js";
import * as fs from "fs";
import * as path from "path";

interface DetailedReport {
  generatedAt: string;
  summary: {
    totalQueries: number;
    totalRequests: number;
    totalQueryTime: number;
    averageQueryTime: number;
    slowestQuery: number;
  };
  queryBreakdown: {
    byModel: Record<
      string,
      { count: number; totalTime: number; avgTime: number }
    >;
    byOperation: Record<
      string,
      { count: number; totalTime: number; avgTime: number }
    >;
    byEndpoint: Record<
      string,
      { count: number; totalTime: number; avgTime: number; queries: number }
    >;
  };
  slowQueries: Array<{
    model: string;
    operation: string;
    time: number;
    endpoint: string;
    origin: string;
  }>;
  repeatedQueries: Array<{
    query: string;
    count: number;
    totalTime: number;
    avgTime: number;
  }>;
  n1Patterns: Array<{
    endpoint: string;
    pattern: string;
    count: number;
    totalTime: number;
  }>;
  recommendations: string[];
}

function generateDetailedReport(): DetailedReport {
  const report = prismaInstrumentation.exportReport();
  const requests = requestInstrumentation.getRequests();

  const summary = {
    totalQueries: report.totalQueries,
    totalRequests: requests.length,
    totalQueryTime: report.totalTime,
    averageQueryTime:
      report.totalQueries > 0 ? report.totalTime / report.totalQueries : 0,
    slowestQuery:
      report.slowQueries.length > 0 ? report.slowQueries[0].executionTime : 0,
  };

  // Query breakdown by model
  const byModel: Record<
    string,
    { count: number; totalTime: number; avgTime: number }
  > = {};
  Object.entries(report.byModel).forEach(([model, stats]) => {
    byModel[model] = {
      count: stats.count,
      totalTime: stats.totalTime,
      avgTime: stats.totalTime / stats.count,
    };
  });

  // Query breakdown by operation
  const byOperation: Record<
    string,
    { count: number; totalTime: number; avgTime: number }
  > = {};
  report.slowQueries.forEach((query) => {
    if (!byOperation[query.operation]) {
      byOperation[query.operation] = { count: 0, totalTime: 0, avgTime: 0 };
    }
    byOperation[query.operation].count++;
    byOperation[query.operation].totalTime += query.executionTime;
  });
  Object.keys(byOperation).forEach((op) => {
    byOperation[op].avgTime = byOperation[op].totalTime / byOperation[op].count;
  });

  // Query breakdown by endpoint
  const byEndpoint: Record<
    string,
    { count: number; totalTime: number; avgTime: number; queries: number }
  > = {};
  Object.entries(report.byEndpoint).forEach(([endpoint, stats]) => {
    byEndpoint[endpoint] = {
      count: stats.count,
      totalTime: stats.totalTime,
      avgTime: stats.totalTime / stats.count,
      queries: stats.queries.length,
    };
  });

  // Slow queries
  const slowQueries = report.slowQueries.slice(0, 20).map((q) => ({
    model: q.model,
    operation: q.operation,
    time: q.executionTime,
    endpoint: q.endpoint || "unknown",
    origin: q.callOrigin,
  }));

  // Repeated queries
  const repeatedQueries = report.repeatedQueries.slice(0, 20).map((r) => ({
    query: r.query,
    count: r.count,
    totalTime: r.queries.reduce((sum, q) => sum + q.executionTime, 0),
    avgTime: r.queries.reduce((sum, q) => sum + q.executionTime, 0) / r.count,
  }));

  // N+1 patterns detection
  const n1Patterns: Array<{
    endpoint: string;
    pattern: string;
    count: number;
    totalTime: number;
  }> = [];

  Object.entries(report.byEndpoint).forEach(([endpoint, stats]) => {
    const queryGroups = new Map<string, number>();
    stats.queries.forEach((q) => {
      const key = `${q.model}.${q.operation}`;
      queryGroups.set(key, (queryGroups.get(key) || 0) + 1);
    });

    queryGroups.forEach((count, pattern) => {
      if (count > 3) {
        const patternQueries = stats.queries.filter(
          (q) => `${q.model}.${q.operation}` === pattern
        );
        const totalTime = patternQueries.reduce(
          (sum, q) => sum + q.executionTime,
          0
        );

        n1Patterns.push({
          endpoint,
          pattern,
          count,
          totalTime,
        });
      }
    });
  });

  // Sort N+1 patterns by count
  n1Patterns.sort((a, b) => b.count - a.count);

  // Generate recommendations
  const recommendations: string[] = [];

  if (slowQueries.length > 5) {
    recommendations.push(
      `🐢 Found ${slowQueries.length} slow queries (>100ms). Review and optimize these queries first.`
    );
  }

  if (n1Patterns.length > 0) {
    recommendations.push(
      `⚠️  Detected ${n1Patterns.length} potential N+1 patterns. Use 'include' or 'select' to fetch related data in a single query.`
    );
  }

  if (repeatedQueries.length > 10) {
    recommendations.push(
      `🔄 Found ${repeatedQueries.length} repeated queries. Consider caching or batching these queries.`
    );
  }

  const avgQueriesPerRequest =
    summary.totalRequests > 0
      ? summary.totalQueries / summary.totalRequests
      : 0;
  if (avgQueriesPerRequest > 5) {
    recommendations.push(
      `📊 Average ${avgQueriesPerRequest.toFixed(1)} queries per request. Consider reducing query count through better data fetching strategies.`
    );
  }

  if (summary.averageQueryTime > 50) {
    recommendations.push(
      `⏱️  Average query time is ${summary.averageQueryTime.toFixed(2)}ms. Add database indexes for frequently queried fields.`
    );
  }

  // Check for missing indexes
  const modelWithHighCount = Object.entries(byModel)
    .filter(([, stats]) => stats.count > 20)
    .map(([model]) => model);

  if (modelWithHighCount.length > 0) {
    recommendations.push(
      `📈 Models with high query count: ${modelWithHighCount.join(", ")}. Ensure proper indexes exist.`
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    summary,
    queryBreakdown: {
      byModel,
      byOperation,
      byEndpoint,
    },
    slowQueries,
    repeatedQueries,
    n1Patterns: n1Patterns.slice(0, 15),
    recommendations,
  };
}

function printReport(report: DetailedReport) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 PRISMA PERFORMANCE REPORT");
  console.log("=".repeat(80));
  console.log(`Generated at: ${report.generatedAt}`);

  console.log("\n📈 SUMMARY");
  console.log(`   Total Queries: ${report.summary.totalQueries}`);
  console.log(`   Total Requests: ${report.summary.totalRequests}`);
  console.log(
    `   Total Query Time: ${report.summary.totalQueryTime.toFixed(2)}ms`
  );
  console.log(
    `   Average Query Time: ${report.summary.averageQueryTime.toFixed(2)}ms`
  );
  console.log(`   Slowest Query: ${report.summary.slowestQuery.toFixed(2)}ms`);
  if (report.summary.totalRequests > 0) {
    console.log(
      `   Avg Queries/Request: ${(report.summary.totalQueries / report.summary.totalRequests).toFixed(1)}`
    );
  }

  console.log("\n📦 BY MODEL (Top 10)");
  Object.entries(report.queryBreakdown.byModel)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .forEach(([model, stats]) => {
      console.log(`   ${model}:`);
      console.log(`      Count: ${stats.count}`);
      console.log(`      Total Time: ${stats.totalTime.toFixed(2)}ms`);
      console.log(`      Avg Time: ${stats.avgTime.toFixed(2)}ms`);
    });

  console.log("\n🎯 BY ENDPOINT (Top 15)");
  Object.entries(report.queryBreakdown.byEndpoint)
    .sort((a, b) => b[1].totalTime - a[1].totalTime)
    .slice(0, 15)
    .forEach(([endpoint, stats]) => {
      console.log(`   ${endpoint}:`);
      console.log(`      Queries: ${stats.queries}`);
      console.log(`      Total Time: ${stats.totalTime.toFixed(2)}ms`);
      console.log(`      Avg Time: ${stats.avgTime.toFixed(2)}ms`);
    });

  console.log("\n⚡ SLOWEST QUERIES (Top 15)");
  report.slowQueries.slice(0, 15).forEach((query, idx) => {
    console.log(
      `   ${idx + 1}. ${query.model}.${query.operation} - ${query.time.toFixed(2)}ms`
    );
    console.log(`      Endpoint: ${query.endpoint}`);
    console.log(`      Origin: ${query.origin}`);
  });

  console.log("\n🔄 MOST REPEATED QUERIES (Top 10)");
  report.repeatedQueries.slice(0, 10).forEach((query, idx) => {
    console.log(`   ${idx + 1}. ${query.query} - ${query.count} times`);
    console.log(`      Total Time: ${query.totalTime.toFixed(2)}ms`);
    console.log(`      Avg Time: ${query.avgTime.toFixed(2)}ms`);
  });

  if (report.n1Patterns.length > 0) {
    console.log("\n🚨 POTENTIAL N+1 PATTERNS");
    report.n1Patterns.forEach((pattern, idx) => {
      console.log(`   ${idx + 1}. ${pattern.endpoint}`);
      console.log(
        `      Pattern: ${pattern.pattern} called ${pattern.count} times`
      );
      console.log(`      Total Time: ${pattern.totalTime.toFixed(2)}ms`);
    });
  }

  console.log("\n💡 RECOMMENDATIONS");
  report.recommendations.forEach((rec, idx) => {
    console.log(`   ${idx + 1}. ${rec}`);
  });

  console.log("\n" + "=".repeat(80) + "\n");
}

function exportReport(report: DetailedReport) {
  const outputPath = path.join(process.cwd(), "prisma-performance-report.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report exported to: ${outputPath}\n`);
}

// Generate and print report
console.log(
  "\n🔍 Generating performance report from instrumentation data...\n"
);

const report = generateDetailedReport();
printReport(report);
exportReport(report);

// Also print the original reports
console.log("\n" + "=".repeat(80));
console.log("ADDITIONAL DETAILS FROM INSTRUMENTATION");
console.log("=".repeat(80) + "\n");

prismaInstrumentation.printReport();
requestInstrumentation.printSummary();
