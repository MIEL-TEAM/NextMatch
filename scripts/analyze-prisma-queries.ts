/**
 * Prisma Query Analysis Script
 *
 * This script analyzes all Prisma queries in the codebase and generates:
 * 1. A map of all query locations
 * 2. Query complexity analysis
 * 3. Potential optimization opportunities
 * 4. N+1 pattern detection
 */

import * as fs from "fs";
import * as path from "path";

interface QueryPattern {
  file: string;
  line: number;
  method: string; // findMany, findUnique, etc.
  model: string; // User, Member, Like, etc.
  hasInclude: boolean;
  hasSelect: boolean;
  hasWhere: boolean;
  hasOrderBy: boolean;
  hasTake: boolean;
  hasSkip: boolean;
  complexity: "low" | "medium" | "high" | "very-high";
  context: string; // function name
  code: string; // actual query code
}

interface FileAnalysis {
  filePath: string;
  totalQueries: number;
  queries: QueryPattern[];
  functions: Map<string, QueryPattern[]>;
  potentialIssues: string[];
}

interface AnalysisReport {
  totalFiles: number;
  totalQueries: number;
  queryByType: Record<string, number>;
  queryByModel: Record<string, number>;
  complexQueries: QueryPattern[];
  filesWithMostQueries: Array<{ file: string; count: number }>;
  potentialN1Patterns: Array<{ file: string; issue: string }>;
  sequentialQueryPatterns: Array<{ file: string; pattern: string }>;
  recommendations: string[];
}

const PRISMA_METHODS = [
  "findMany",
  "findUnique",
  "findFirst",
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
];

const PRISMA_MODELS = [
  "user",
  "member",
  "like",
  "message",
  "photo",
  "video",
  "interest",
  "userInteraction",
  "userPreference",
  "profileView",
  "smartMatchCache",
  "story",
  "storyView",
  "storyReaction",
  "storyReply",
  "aiConversation",
  "aiMessage",
  "aiUsageLog",
  "transaction",
  "adminAuditLog",
];

class PrismaQueryAnalyzer {
  private fileAnalyses: FileAnalysis[] = [];
  private srcPath: string;

  constructor(srcPath: string) {
    this.srcPath = srcPath;
  }

  async analyzeDirectory(dir: string): Promise<void> {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (
          !file.name.startsWith(".") &&
          file.name !== "node_modules" &&
          file.name !== "__tests__"
        ) {
          await this.analyzeDirectory(fullPath);
        }
      } else if (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) {
        await this.analyzeFile(fullPath);
      }
    }
  }

  private async analyzeFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, "utf-8");

    // Skip files that don't import prisma
    if (
      !content.includes("prisma.") &&
      !content.includes('from "@/lib/prisma"')
    ) {
      return;
    }

    const queries: QueryPattern[] = [];
    const lines = content.split("\n");

    let currentFunction = "global";
    const functionStack: string[] = [];

    lines.forEach((line, index) => {
      // Detect function context
      const functionMatch = line.match(
        /(?:async\s+)?function\s+(\w+)|(?:export\s+)?(?:async\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/
      );
      if (functionMatch) {
        currentFunction = functionMatch[1] || functionMatch[2] || "anonymous";
        functionStack.push(currentFunction);
      }

      // Detect Prisma queries
      for (const method of PRISMA_METHODS) {
        const methodPattern = new RegExp(
          `prisma\\.(\\w+)\\.${method}\\s*\\(`,
          "g"
        );
        const matches = line.matchAll(methodPattern);

        for (const match of matches) {
          const model = match[1];
          if (PRISMA_MODELS.includes(model.toLowerCase())) {
            const query = this.extractQuery(content, index, lines);
            const complexity = this.calculateComplexity(query);

            queries.push({
              file: filePath.replace(this.srcPath, ""),
              line: index + 1,
              method,
              model,
              hasInclude: query.includes("include:"),
              hasSelect: query.includes("select:"),
              hasWhere: query.includes("where:"),
              hasOrderBy: query.includes("orderBy:"),
              hasTake: query.includes("take:"),
              hasSkip: query.includes("skip:"),
              complexity,
              context: currentFunction,
              code: query,
            });
          }
        }
      }
    });

    if (queries.length > 0) {
      const functions = new Map<string, QueryPattern[]>();
      queries.forEach((q) => {
        const existing = functions.get(q.context) || [];
        existing.push(q);
        functions.set(q.context, existing);
      });

      const potentialIssues = this.detectIssues(queries, content);

      this.fileAnalyses.push({
        filePath: filePath.replace(this.srcPath, ""),
        totalQueries: queries.length,
        queries,
        functions,
        potentialIssues,
      });
    }
  }

  private extractQuery(
    content: string,
    lineIndex: number,
    lines: string[]
  ): string {
    // Extract the full query (handle multi-line)
    let query = lines[lineIndex];
    let openBraces = (query.match(/\{/g) || []).length;
    let closeBraces = (query.match(/\}/g) || []).length;
    let openParens = (query.match(/\(/g) || []).length;
    let closeParens = (query.match(/\)/g) || []).length;

    let i = lineIndex + 1;
    while (
      i < lines.length &&
      (openBraces !== closeBraces || openParens !== closeParens)
    ) {
      query += "\n" + lines[i];
      openBraces += (lines[i].match(/\{/g) || []).length;
      closeBraces += (lines[i].match(/\}/g) || []).length;
      openParens += (lines[i].match(/\(/g) || []).length;
      closeParens += (lines[i].match(/\)/g) || []).length;
      i++;

      // Safety limit
      if (i - lineIndex > 100) break;
    }

    return query.trim();
  }

  private calculateComplexity(
    query: string
  ): "low" | "medium" | "high" | "very-high" {
    let score = 0;

    if (query.includes("include:")) score += 2;
    if (query.includes("select:")) score += 1;
    if (query.includes("where:")) score += 1;
    if (query.includes("orderBy:")) score += 1;
    if ((query.match(/include:/g) || []).length > 2) score += 3;
    if (query.includes("AND:") || query.includes("OR:")) score += 2;

    // Count nested includes
    const includeDepth = (query.match(/include:\s*{[^}]*include:/g) || [])
      .length;
    score += includeDepth * 3;

    if (score <= 2) return "low";
    if (score <= 5) return "medium";
    if (score <= 8) return "high";
    return "very-high";
  }

  private detectIssues(queries: QueryPattern[], fileContent: string): string[] {
    const issues: string[] = [];

    // Check for sequential queries (potential N+1)
    const queryGroups = new Map<string, QueryPattern[]>();
    queries.forEach((q) => {
      const key = `${q.context}`;
      const existing = queryGroups.get(key) || [];
      existing.push(q);
      queryGroups.set(key, existing);
    });

    queryGroups.forEach((queries, context) => {
      if (queries.length > 3) {
        issues.push(
          `Function '${context}' has ${queries.length} queries - potential N+1 or sequential query issue`
        );
      }

      // Check for same model queried multiple times
      const modelCounts = new Map<string, number>();
      queries.forEach((q) => {
        modelCounts.set(q.model, (modelCounts.get(q.model) || 0) + 1);
      });

      modelCounts.forEach((count, model) => {
        if (count > 2) {
          issues.push(
            `Model '${model}' queried ${count} times in '${context}' - possible optimization opportunity`
          );
        }
      });
    });

    // Check for missing includes (fetching related data separately)
    if (
      fileContent.includes(".findMany") &&
      fileContent.includes(".findUnique")
    ) {
      const findManyCount = (fileContent.match(/\.findMany/g) || []).length;
      const findUniqueCount = (fileContent.match(/\.findUnique/g) || []).length;

      if (findManyCount > 0 && findUniqueCount > 3) {
        issues.push(
          `File has ${findManyCount} findMany and ${findUniqueCount} findUnique - check for N+1 patterns`
        );
      }
    }

    // Check for missing parallel queries
    if (
      fileContent.includes("await prisma.") &&
      !fileContent.includes("Promise.all")
    ) {
      const awaitCount = (fileContent.match(/await prisma\./g) || []).length;
      if (awaitCount > 2) {
        issues.push(
          `${awaitCount} sequential await prisma calls - consider Promise.all for parallel execution`
        );
      }
    }

    return issues;
  }

  generateReport(): AnalysisReport {
    const report: AnalysisReport = {
      totalFiles: this.fileAnalyses.length,
      totalQueries: 0,
      queryByType: {},
      queryByModel: {},
      complexQueries: [],
      filesWithMostQueries: [],
      potentialN1Patterns: [],
      sequentialQueryPatterns: [],
      recommendations: [],
    };

    // Aggregate data
    this.fileAnalyses.forEach((analysis) => {
      report.totalQueries += analysis.totalQueries;

      analysis.queries.forEach((query) => {
        // By type
        report.queryByType[query.method] =
          (report.queryByType[query.method] || 0) + 1;

        // By model
        report.queryByModel[query.model] =
          (report.queryByModel[query.model] || 0) + 1;

        // Complex queries
        if (query.complexity === "very-high" || query.complexity === "high") {
          report.complexQueries.push(query);
        }
      });

      // Files with most queries
      report.filesWithMostQueries.push({
        file: analysis.filePath,
        count: analysis.totalQueries,
      });

      // Potential issues
      analysis.potentialIssues.forEach((issue) => {
        if (issue.includes("N+1") || issue.includes("sequential")) {
          report.potentialN1Patterns.push({
            file: analysis.filePath,
            issue,
          });
        } else if (issue.includes("Promise.all")) {
          report.sequentialQueryPatterns.push({
            file: analysis.filePath,
            pattern: issue,
          });
        }
      });
    });

    // Sort files by query count
    report.filesWithMostQueries.sort((a, b) => b.count - a.count);
    report.filesWithMostQueries = report.filesWithMostQueries.slice(0, 20);

    // Sort complex queries by complexity
    report.complexQueries.sort((a, b) => {
      const order = { "very-high": 4, high: 3, medium: 2, low: 1 };
      return order[b.complexity] - order[a.complexity];
    });

    // Generate recommendations
    this.generateRecommendations(report);

    return report;
  }

  private generateRecommendations(report: AnalysisReport) {
    if (report.complexQueries.length > 10) {
      report.recommendations.push(
        `Found ${report.complexQueries.length} complex queries. Review and optimize queries with deep includes.`
      );
    }

    if (report.potentialN1Patterns.length > 0) {
      report.recommendations.push(
        `Detected ${report.potentialN1Patterns.length} potential N+1 patterns. Use include/select to fetch related data in single queries.`
      );
    }

    if (report.sequentialQueryPatterns.length > 5) {
      report.recommendations.push(
        `Found ${report.sequentialQueryPatterns.length} files with sequential queries. Use Promise.all() for parallel execution.`
      );
    }

    const findManyCount = report.queryByType["findMany"] || 0;
    const countQueries = report.queryByType["count"] || 0;
    if (findManyCount > 50 && countQueries > 20) {
      report.recommendations.push(
        `High number of findMany (${findManyCount}) and count (${countQueries}) queries. Consider pagination cursors and caching.`
      );
    }

    const updateManyCount = report.queryByType["updateMany"] || 0;
    if (updateManyCount > 10) {
      report.recommendations.push(
        `${updateManyCount} updateMany operations detected. Ensure these are optimized with proper indexes.`
      );
    }
  }

  printReport() {
    const report = this.generateReport();

    console.log("\n" + "=".repeat(80));
    console.log("📊 PRISMA QUERY ANALYSIS REPORT");
    console.log("=".repeat(80));

    console.log(`\n📈 OVERVIEW`);
    console.log(`   Total Files with Queries: ${report.totalFiles}`);
    console.log(`   Total Queries: ${report.totalQueries}`);

    console.log(`\n📦 QUERIES BY TYPE`);
    Object.entries(report.queryByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    console.log(`\n🗄️  QUERIES BY MODEL`);
    Object.entries(report.queryByModel)
      .sort((a, b) => b[1] - a[1])
      .forEach(([model, count]) => {
        console.log(`   ${model}: ${count}`);
      });

    console.log(`\n📁 FILES WITH MOST QUERIES (Top 20)`);
    report.filesWithMostQueries.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file.file}: ${file.count} queries`);
    });

    console.log(`\n⚠️  COMPLEX QUERIES (Top 15)`);
    report.complexQueries.slice(0, 15).forEach((query, idx) => {
      console.log(`   ${idx + 1}. ${query.file}:${query.line}`);
      console.log(`      Model: ${query.model}.${query.method}`);
      console.log(`      Function: ${query.context}`);
      console.log(`      Complexity: ${query.complexity}`);
      console.log(
        `      Features: ${[
          query.hasInclude && "include",
          query.hasSelect && "select",
          query.hasWhere && "where",
          query.hasOrderBy && "orderBy",
        ]
          .filter(Boolean)
          .join(", ")}`
      );
    });

    console.log(`\n🚨 POTENTIAL N+1 PATTERNS`);
    report.potentialN1Patterns.slice(0, 15).forEach((pattern, idx) => {
      console.log(`   ${idx + 1}. ${pattern.file}`);
      console.log(`      ${pattern.issue}`);
    });

    console.log(`\n🔄 SEQUENTIAL QUERY PATTERNS`);
    report.sequentialQueryPatterns.slice(0, 15).forEach((pattern, idx) => {
      console.log(`   ${idx + 1}. ${pattern.file}`);
      console.log(`      ${pattern.pattern}`);
    });

    console.log(`\n💡 RECOMMENDATIONS`);
    report.recommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });

    console.log("\n" + "=".repeat(80) + "\n");

    // Export detailed report
    this.exportDetailedReport(report);
  }

  private exportDetailedReport(report: AnalysisReport) {
    const detailedReport = {
      summary: {
        totalFiles: report.totalFiles,
        totalQueries: report.totalQueries,
        queryByType: report.queryByType,
        queryByModel: report.queryByModel,
      },
      filesWithMostQueries: report.filesWithMostQueries,
      complexQueries: report.complexQueries.map((q) => ({
        file: q.file,
        line: q.line,
        model: q.model,
        method: q.method,
        context: q.context,
        complexity: q.complexity,
        features: {
          include: q.hasInclude,
          select: q.hasSelect,
          where: q.hasWhere,
          orderBy: q.hasOrderBy,
          take: q.hasTake,
          skip: q.hasSkip,
        },
      })),
      potentialN1Patterns: report.potentialN1Patterns,
      sequentialQueryPatterns: report.sequentialQueryPatterns,
      recommendations: report.recommendations,
      detailedFileAnalyses: this.fileAnalyses.map((analysis) => ({
        file: analysis.filePath,
        totalQueries: analysis.totalQueries,
        potentialIssues: analysis.potentialIssues,
        functionBreakdown: Array.from(analysis.functions.entries()).map(
          ([fn, queries]) => ({
            function: fn,
            queryCount: queries.length,
            queries: queries.map((q) => ({
              line: q.line,
              model: q.model,
              method: q.method,
              complexity: q.complexity,
            })),
          })
        ),
      })),
    };

    const outputPath = path.join(process.cwd(), "prisma-analysis-report.json");
    fs.writeFileSync(outputPath, JSON.stringify(detailedReport, null, 2));
    console.log(`\n📄 Detailed report exported to: ${outputPath}`);
  }
}

// Run analysis
const srcPath = path.join(process.cwd(), "src");
const analyzer = new PrismaQueryAnalyzer(srcPath);

console.log("🔍 Analyzing Prisma queries in the codebase...\n");
analyzer.analyzeDirectory(srcPath).then(() => {
  analyzer.printReport();
});
