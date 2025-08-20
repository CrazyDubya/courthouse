interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitterRange: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export class RetryableError extends Error {
  constructor(message: string, public isRetryable: boolean = true) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private successCount = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN. Service failed ${this.failureCount} times.`
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.options.resetTimeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (
      this.state === CircuitState.HALF_OPEN ||
      this.failureCount >= this.options.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): { state: string; failureCount: number; lastFailureTime?: Date } {
    return {
      state: CircuitState[this.state],
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    this.successCount = 0;
  }
}

export class RetryService {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      jitterRange: 0.1,
      retryCondition: this.defaultRetryCondition,
      ...options
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === config.maxAttempts) {
          throw lastError;
        }

        if (config.retryCondition && !config.retryCondition(lastError)) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt - 1, config);
        
        if (config.onRetry) {
          config.onRetry(attempt, lastError, delay);
        }

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  async executeWithCircuitBreaker<T>(
    key: string,
    operation: () => Promise<T>,
    circuitOptions: Partial<CircuitBreakerOptions> = {},
    retryOptions: Partial<RetryOptions> = {}
  ): Promise<T> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(key, circuitOptions);

    return circuitBreaker.execute(async () => {
      return this.executeWithRetry(operation, retryOptions);
    });
  }

  private getOrCreateCircuitBreaker(
    key: string,
    options: Partial<CircuitBreakerOptions>
  ): CircuitBreaker {
    if (!this.circuitBreakers.has(key)) {
      const config: CircuitBreakerOptions = {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
        ...options
      };
      
      this.circuitBreakers.set(key, new CircuitBreaker(config));
    }

    return this.circuitBreakers.get(key)!;
  }

  private calculateDelay(attempt: number, options: RetryOptions): number {
    let delay = options.baseDelay * Math.pow(options.backoffFactor, attempt);
    delay = Math.min(delay, options.maxDelay);

    const jitter = delay * options.jitterRange * (Math.random() - 0.5) * 2;
    return Math.max(0, delay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private defaultRetryCondition(error: Error): boolean {
    if (error instanceof RetryableError) {
      return error.isRetryable;
    }

    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED', 
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
      'EPIPE',
      'socket hang up',
      'timeout'
    ];

    const errorMessage = error.message.toLowerCase();
    const isRetryableError = retryableErrors.some(err => 
      errorMessage.includes(err.toLowerCase())
    );

    const isRateLimitError = errorMessage.includes('rate limit') || 
                            errorMessage.includes('too many requests');
    
    const isServerError = error.message.includes('5') && 
                         error.message.includes('0');

    return isRetryableError || isRateLimitError || isServerError;
  }

  getCircuitBreakerStatus(key: string): any {
    const circuitBreaker = this.circuitBreakers.get(key);
    return circuitBreaker ? circuitBreaker.getState() : null;
  }

  resetCircuitBreaker(key: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(key);
    if (circuitBreaker) {
      circuitBreaker.reset();
      return true;
    }
    return false;
  }

  getAllCircuitBreakers(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [key, circuitBreaker] of this.circuitBreakers.entries()) {
      status[key] = circuitBreaker.getState();
    }
    
    return status;
  }
}

export const retryService = new RetryService();

export function withRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: Partial<RetryOptions> = {}
) {
  return async (...args: T): Promise<R> => {
    return retryService.executeWithRetry(() => fn(...args), options);
  };
}

export function withCircuitBreaker<T extends any[], R>(
  key: string,
  fn: (...args: T) => Promise<R>,
  circuitOptions: Partial<CircuitBreakerOptions> = {},
  retryOptions: Partial<RetryOptions> = {}
) {
  return async (...args: T): Promise<R> => {
    return retryService.executeWithCircuitBreaker(
      key,
      () => fn(...args),
      circuitOptions,
      retryOptions
    );
  };
}