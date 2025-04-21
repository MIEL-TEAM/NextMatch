// Track the performance of an operation
export const trackPerformance = (operationName: string) => {
  const start = performance.now();

  return {
    // Call this at the end of the operation to log its duration
    end: () => {
      const duration = performance.now() - start;

      // Only log extremely slow operations in production (over 500ms)
      if (duration > 500 && process.env.NODE_ENV === "production") {
        // Log to monitoring service if available, otherwise silent in production
        if (typeof window !== "undefined" && window.performance) {
          // Record performance entry for monitoring tools to collect
          performance.mark(`${operationName}-end`);
        }
      }

      return duration;
    },
  };
};

// Wrap an async function to track its performance
export const trackAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T => {
  return (async (...args: Parameters<T>) => {
    const tracker = trackPerformance(operationName);
    try {
      const result = await fn(...args);
      tracker.end();
      return result;
    } catch (error) {
      tracker.end();
      throw error;
    }
  }) as T;
};

// Use this to identify the most impactful performance improvements
export const usePerformanceMonitoring = (
  enabled = process.env.NODE_ENV === "production"
) => {
  if (!enabled || typeof window === "undefined") return;

  // Track page load performance silently for monitoring tools
  window.addEventListener("load", () => {
    setTimeout(() => {
      // Record performance entry instead of logging
      performance.mark("page-load-complete");
      performance.measure(
        "page-load-time",
        "navigationStart",
        "page-load-complete"
      );

      // First Contentful Paint - important UX metric
      const fcp = performance.getEntriesByName("first-contentful-paint");
      if (fcp.length > 0) {
        performance.measure("first-contentful-paint", {
          detail: fcp[0].startTime,
        });
      }
    }, 0);
  });
};
