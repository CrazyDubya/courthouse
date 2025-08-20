export interface PerformanceMetrics {
  timestamp: number;
  instanceId: string;
  model: string;
  port: number;
  responseTime: number;
  tokensPerSecond?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  isHealthy: boolean;
}

export interface SystemMetrics {
  timestamp: number;
  totalMemory: number;
  availableMemory: number;
  cpuUsage: number;
  activeInstances: number;
  totalRequests: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private maxHistorySize = 1000;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor system metrics every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.cleanupOldMetrics();
    }, 10000);
  }

  public recordResponse(instanceId: string, model: string, port: number, startTime: number): void {
    const responseTime = Date.now() - startTime;
    
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      instanceId,
      model,
      port,
      responseTime,
      isHealthy: true
    };

    this.metrics.push(metric);
    console.log(`📊 Response recorded: ${model} (${responseTime}ms)`);
  }

  public recordError(instanceId: string, model: string, port: number, startTime: number): void {
    const responseTime = Date.now() - startTime;
    
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      instanceId,
      model,
      port,
      responseTime,
      isHealthy: false
    };

    this.metrics.push(metric);
    console.warn(`⚠️ Error recorded: ${model} (${responseTime}ms)`);
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // In a browser environment, we can't get true system metrics
      // This is a simplified version for demonstration
      const metric: SystemMetrics = {
        timestamp: Date.now(),
        totalMemory: this.estimateSystemMemory(),
        availableMemory: this.estimateAvailableMemory(),
        cpuUsage: this.estimateCpuUsage(),
        activeInstances: this.getActiveInstanceCount(),
        totalRequests: this.metrics.length
      };

      this.systemMetrics.push(metric);
    } catch (error) {
      console.warn('Failed to collect system metrics:', error);
    }
  }

  private estimateSystemMemory(): number {
    // Estimate based on browser capabilities
    // In a real implementation, this would come from system APIs
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.jsHeapSizeLimit || 4000000000; // 4GB default
    }
    return 8000000000; // 8GB default estimate
  }

  private estimateAvailableMemory(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.jsHeapSizeLimit || 4000000000) - (memory.usedJSHeapSize || 0);
    }
    return 6000000000; // 6GB default estimate
  }

  private estimateCpuUsage(): number {
    // Simplified CPU usage estimation based on response times
    const recentMetrics = this.getRecentMetrics(60000); // Last minute
    if (recentMetrics.length === 0) return 0;

    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    
    // Higher response times suggest higher CPU usage (simplified)
    if (avgResponseTime > 10000) return 90; // Very high
    if (avgResponseTime > 5000) return 70;  // High
    if (avgResponseTime > 2000) return 50;  // Medium
    if (avgResponseTime > 1000) return 30;  // Low-medium
    return 15; // Low
  }

  private getActiveInstanceCount(): number {
    const recentMetrics = this.getRecentMetrics(30000); // Last 30 seconds
    const uniqueInstances = new Set(recentMetrics.map(m => m.instanceId));
    return uniqueInstances.size;
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoffTime);

    // Also limit by max history size
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics = this.metrics.slice(-this.maxHistorySize);
    }
    
    if (this.systemMetrics.length > this.maxHistorySize) {
      this.systemMetrics = this.systemMetrics.slice(-this.maxHistorySize);
    }
  }

  public getRecentMetrics(timeWindowMs: number = 300000): PerformanceMetrics[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  public getRecentSystemMetrics(timeWindowMs: number = 300000): SystemMetrics[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.systemMetrics.filter(m => m.timestamp > cutoff);
  }

  public getAverageResponseTime(model?: string, timeWindowMs: number = 300000): number {
    let metrics = this.getRecentMetrics(timeWindowMs).filter(m => m.isHealthy);
    
    if (model) {
      metrics = metrics.filter(m => m.model === model);
    }

    if (metrics.length === 0) return 0;
    
    return metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
  }

  public getModelPerformanceStats(model: string, timeWindowMs: number = 300000): {
    avgResponseTime: number;
    requestCount: number;
    errorRate: number;
    successRate: number;
  } {
    const metrics = this.getRecentMetrics(timeWindowMs).filter(m => m.model === model);
    const successfulRequests = metrics.filter(m => m.isHealthy);
    const failedRequests = metrics.filter(m => !m.isHealthy);

    return {
      avgResponseTime: successfulRequests.length > 0 
        ? successfulRequests.reduce((sum, m) => sum + m.responseTime, 0) / successfulRequests.length
        : 0,
      requestCount: metrics.length,
      errorRate: metrics.length > 0 ? (failedRequests.length / metrics.length) * 100 : 0,
      successRate: metrics.length > 0 ? (successfulRequests.length / metrics.length) * 100 : 0
    };
  }

  public getTopPerformingModels(limit: number = 5): Array<{
    model: string;
    avgResponseTime: number;
    requestCount: number;
  }> {
    const modelGroups = new Map<string, PerformanceMetrics[]>();
    
    // Group metrics by model
    this.getRecentMetrics().filter(m => m.isHealthy).forEach(metric => {
      const existing = modelGroups.get(metric.model) || [];
      existing.push(metric);
      modelGroups.set(metric.model, existing);
    });

    // Calculate averages and sort
    return Array.from(modelGroups.entries())
      .map(([model, metrics]) => ({
        model,
        avgResponseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
        requestCount: metrics.length
      }))
      .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
      .slice(0, limit);
  }

  public getCurrentSystemStatus(): {
    memoryUsage: number;
    cpuUsage: number;
    activeInstances: number;
    totalRequests: number;
    avgResponseTime: number;
  } {
    const recentSystemMetrics = this.getRecentSystemMetrics(60000); // Last minute
    const recentMetrics = this.getRecentMetrics(60000);

    const latestSystemMetric = recentSystemMetrics[recentSystemMetrics.length - 1];
    
    return {
      memoryUsage: latestSystemMetric ? 
        ((latestSystemMetric.totalMemory - latestSystemMetric.availableMemory) / latestSystemMetric.totalMemory) * 100 : 0,
      cpuUsage: latestSystemMetric ? latestSystemMetric.cpuUsage : 0,
      activeInstances: latestSystemMetric ? latestSystemMetric.activeInstances : 0,
      totalRequests: recentMetrics.length,
      avgResponseTime: this.getAverageResponseTime(undefined, 60000)
    };
  }

  public exportMetrics(): {
    performanceMetrics: PerformanceMetrics[];
    systemMetrics: SystemMetrics[];
  } {
    return {
      performanceMetrics: [...this.metrics],
      systemMetrics: [...this.systemMetrics]
    };
  }

  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();