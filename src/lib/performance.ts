// Track the performance of an operation
export const trackPerformance = (operationName: string) => {
  const start = performance.now();

  return {
    // Call this at the end of the operation to log its duration
    end: () => {
      const duration = performance.now() - start;

      // Only log slow operations (over 100ms)
      if (duration > 100) {
        // Use warn to make it stand out in the console
        console.warn(
          `Slow operation: ${operationName} took ${duration.toFixed(2)}ms`
        );

        // In development, provide more detailed info including a stack trace
        if (process.env.NODE_ENV === "development") {
          console.warn(new Error().stack);
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
  if (!enabled) return;

  // Track page load performance
  if (typeof window !== "undefined") {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.info(`Page load time: ${pageLoadTime}ms`);

        // Report other important metrics
        const fcp = performance.getEntriesByName("first-contentful-paint");
        if (fcp.length > 0) {
          console.info(
            `First Contentful Paint: ${fcp[0].startTime.toFixed(2)}ms`
          );
        }
      }, 0);
    });
  }
};
