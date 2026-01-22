/**
 * Performance Monitoring Utilities
 * 
 * Provides tools for measuring and tracking performance of key operations
 * in the Courthouse application.
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  category: 'llm' | 'render' | 'engine' | 'network' | 'user-interaction';
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  totalMetrics: number;
  categories: Record<string, {
    count: number;
    totalDuration: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p50: number;
    p95: number;
    p99: number;
  }>;
  slowestOperations: PerformanceMetric[];
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private enabled: boolean = true;

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start measuring an operation
   */
  mark(name: string): void {
    if (!this.enabled) return;
    
    this.marks.set(name, performance.now());
  }

  /**
   * End measurement and record the metric
   */
  measure(
    name: string, 
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled) return;
    
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No mark found for: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      category,
      metadata,
    });

    this.marks.delete(name);
  }

  /**
   * Measure a function execution time
   */
  async measureAsync<T>(
    name: string,
    category: PerformanceMetric['category'],
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) return fn();
    
    this.mark(name);
    try {
      const result = await fn();
      this.measure(name, category, metadata);
      return result;
    } catch (error) {
      this.measure(name, category, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution
   */
  measureSync<T>(
    name: string,
    category: PerformanceMetric['category'],
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    if (!this.enabled) return fn();
    
    this.mark(name);
    try {
      const result = fn();
      this.measure(name, category, metadata);
      return result;
    } catch (error) {
      this.measure(name, category, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const categories: PerformanceReport['categories'] = {};
    const categoryMetrics: Record<string, number[]> = {};

    // Group metrics by category
    for (const metric of this.metrics) {
      if (!categoryMetrics[metric.category]) {
        categoryMetrics[metric.category] = [];
      }
      categoryMetrics[metric.category].push(metric.duration);
    }

    // Calculate statistics for each category
    for (const [category, durations] of Object.entries(categoryMetrics)) {
      const sorted = [...durations].sort((a, b) => a - b);
      const total = durations.reduce((sum, d) => sum + d, 0);

      categories[category] = {
        count: durations.length,
        totalDuration: total,
        avgDuration: total / durations.length,
        minDuration: sorted[0],
        maxDuration: sorted[sorted.length - 1],
        p50: this.percentile(sorted, 50),
        p95: this.percentile(sorted, 95),
        p99: this.percentile(sorted, 99),
      };
    }

    // Find slowest operations
    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateRecommendations(categories, slowestOperations);

    return {
      totalMetrics: this.metrics.length,
      categories,
      slowestOperations,
      recommendations,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    categories: PerformanceReport['categories'],
    slowest: PerformanceMetric[]
  ): string[] {
    const recommendations: string[] = [];

    // Check LLM performance
    const llm = categories['llm'];
    if (llm && llm.avgDuration > 2000) {
      recommendations.push(
        `LLM calls are averaging ${llm.avgDuration.toFixed(0)}ms. Consider:\n` +
        '  - Using streaming responses\n' +
        '  - Caching common responses\n' +
        '  - Reducing prompt complexity'
      );
    }

    if (llm && llm.p95 > 5000) {
      recommendations.push(
        `95th percentile LLM latency is ${llm.p95.toFixed(0)}ms. Consider:\n` +
        '  - Implementing timeout and retry logic\n' +
        '  - Using fallback responses for slow calls'
      );
    }

    // Check rendering performance
    const render = categories['render'];
    if (render && render.avgDuration > 16.67) {
      recommendations.push(
        `Rendering is averaging ${render.avgDuration.toFixed(2)}ms (>60fps threshold). Consider:\n` +
        '  - Using React.memo for expensive components\n' +
        '  - Implementing virtualization for long lists\n' +
        '  - Reducing re-renders with proper state management'
      );
    }

    // Check engine performance
    const engine = categories['engine'];
    if (engine && engine.avgDuration > 100) {
      recommendations.push(
        `ProceedingsEngine operations averaging ${engine.avgDuration.toFixed(0)}ms. Consider:\n` +
        '  - Breaking down complex phase handlers\n' +
        '  - Parallelizing independent operations\n' +
        '  - Using Web Workers for heavy computation'
      );
    }

    // Check for slow operations
    const criticalSlow = slowest.filter(m => m.duration > 1000);
    if (criticalSlow.length > 0) {
      recommendations.push(
        `${criticalSlow.length} operations took >1s:\n` +
        criticalSlow.map(m => `  - ${m.name}: ${m.duration.toFixed(0)}ms`).join('\n')
      );
    }

    return recommendations;
  }

  /**
   * Export metrics to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      metrics: this.metrics,
      report: this.generateReport(),
      timestamp: Date.now(),
    }, null, 2);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Make it available globally for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).perfMonitor = performanceMonitor;
}
