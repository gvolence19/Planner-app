// src/lib/performance-monitor.ts
export class PerformanceMonitor {
  static measureSuggestionGeneration<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = performance.now();
    
    return operation().then(result => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`${operationName} took ${duration.toFixed(2)}ms`);
      
      // Log slow operations
      if (duration > 500) {
        console.warn(`Slow suggestion generation: ${operationName} (${duration}ms)`);
      }
      
      return result;
    });
  }
}