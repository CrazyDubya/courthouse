/**
 * Backend Configuration for Courthouse Simulator
 *
 * This file contains configuration for backend services, including:
 * - Backend API server settings
 * - WebSocket connection settings
 * - Multi-Ollama instance configuration
 * - LLM provider settings
 * - Performance optimization settings
 */

export interface OllamaInstanceConfig {
  port: number;
  models: string[];
  description: string;
  maxConcurrentRequests?: number;
}

export interface BackendServerConfig {
  url: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface LLMProviderConfig {
  defaultProvider: 'ollama' | 'openai' | 'anthropic' | 'groq' | 'openrouter';
  preferBackend: boolean;
  fallbackToLocal: boolean;
  cacheEnabled: boolean;
  cacheTTL: number; // milliseconds
  batchSize: number;
  streamingEnabled: boolean;
}

export interface PerformanceConfig {
  enableMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxQueueSize: number;
  requestTimeout: number;
  healthCheckInterval: number; // milliseconds
}

export interface BackendConfig {
  server: BackendServerConfig;
  ollama: {
    instances: OllamaInstanceConfig[];
    loadBalancing: 'round-robin' | 'least-connections' | 'model-specific';
  };
  llm: LLMProviderConfig;
  performance: PerformanceConfig;
}

/**
 * Default Configuration
 *
 * Multi-Ollama Setup:
 * - Instance 1 (11434): Primary instance with general models
 * - Instance 2 (11435): Secondary instance for specialized models
 * - Instance 3 (11436): Tertiary instance for additional capacity
 *
 * To enable multi-Ollama setup, run in separate terminals:
 *
 * Terminal 1: ollama serve --port 11434
 * Terminal 2: OLLAMA_PORT=11435 ollama serve
 * Terminal 3: OLLAMA_PORT=11436 ollama serve
 *
 * Or use the provided script: ./scripts/start-multi-ollama.sh
 */
export const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  server: {
    url: process.env.BACKEND_URL || 'http://localhost:3001',
    timeout: 120000, // 2 minutes
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
  },
  ollama: {
    instances: [
      {
        port: 11434,
        models: ['llama3:latest', 'llama3.2:3b', 'smollm2:1.7b'],
        description: 'Primary instance - Fast general-purpose models',
        maxConcurrentRequests: 3,
      },
      {
        port: 11435,
        models: ['mistral:7b', 'gemma2:9b'],
        description: 'Secondary instance - Specialized models',
        maxConcurrentRequests: 2,
      },
      {
        port: 11436,
        models: ['llama3:latest', 'mistral:7b'],
        description: 'Tertiary instance - Load balancing',
        maxConcurrentRequests: 2,
      },
    ],
    loadBalancing: 'round-robin',
  },
  llm: {
    defaultProvider: 'ollama',
    preferBackend: true,
    fallbackToLocal: true,
    cacheEnabled: true,
    cacheTTL: 300000, // 5 minutes
    batchSize: 5,
    streamingEnabled: false,
  },
  performance: {
    enableMonitoring: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    maxQueueSize: 100,
    requestTimeout: 120000,
    healthCheckInterval: 30000, // 30 seconds
  },
};

/**
 * Model to Participant Role Mapping
 *
 * Assigns specific models to different courtroom roles for personality variety
 * while maintaining consistent performance.
 */
export const ROLE_MODEL_MAPPING: Record<string, string> = {
  'judge': 'llama3:latest',
  'prosecutor': 'mistral:7b',
  'defense-attorney': 'gemma2:9b',
  'plaintiff-attorney': 'llama3:latest',
  'witness': 'llama3.2:3b',
  'jury-member': 'llama3.2:3b',
  'defendant': 'llama3:latest',
  'plaintiff': 'llama3:latest',
  'bailiff': 'smollm2:1.7b',
  'court-clerk': 'smollm2:1.7b',
  'observer': 'smollm2:1.7b',
};

/**
 * Development Configuration
 * Optimized for local development with minimal resource usage
 */
export const DEVELOPMENT_CONFIG: BackendConfig = {
  ...DEFAULT_BACKEND_CONFIG,
  server: {
    ...DEFAULT_BACKEND_CONFIG.server,
    url: 'http://localhost:3001',
  },
  ollama: {
    instances: [
      {
        port: 11434,
        models: ['llama3.2:3b', 'smollm2:1.7b'],
        description: 'Development instance - Small fast models',
        maxConcurrentRequests: 2,
      },
    ],
    loadBalancing: 'round-robin',
  },
  llm: {
    ...DEFAULT_BACKEND_CONFIG.llm,
    cacheEnabled: true, // Enable cache to speed up development
    streamingEnabled: true, // Enable streaming for better dev experience
  },
  performance: {
    ...DEFAULT_BACKEND_CONFIG.performance,
    logLevel: 'debug',
    enableMonitoring: true,
  },
};

/**
 * Production Configuration
 * Optimized for performance and reliability
 */
export const PRODUCTION_CONFIG: BackendConfig = {
  ...DEFAULT_BACKEND_CONFIG,
  server: {
    ...DEFAULT_BACKEND_CONFIG.server,
    url: process.env.BACKEND_URL || 'http://localhost:3001',
    timeout: 180000, // 3 minutes
  },
  ollama: {
    instances: [
      {
        port: 11434,
        models: ['llama3:latest'],
        description: 'Production primary',
        maxConcurrentRequests: 5,
      },
      {
        port: 11435,
        models: ['mistral:7b'],
        description: 'Production secondary',
        maxConcurrentRequests: 5,
      },
      {
        port: 11436,
        models: ['gemma2:9b'],
        description: 'Production tertiary',
        maxConcurrentRequests: 5,
      },
    ],
    loadBalancing: 'least-connections',
  },
  llm: {
    ...DEFAULT_BACKEND_CONFIG.llm,
    cacheEnabled: true,
    cacheTTL: 600000, // 10 minutes in production
    streamingEnabled: false, // Disable streaming for production stability
  },
  performance: {
    ...DEFAULT_BACKEND_CONFIG.performance,
    logLevel: 'warn',
    enableMonitoring: true,
    maxQueueSize: 200,
  },
};

/**
 * Get configuration based on environment
 */
export function getBackendConfig(): BackendConfig {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'development':
    default:
      return DEVELOPMENT_CONFIG;
  }
}

/**
 * Get model for participant role
 */
export function getModelForRole(role: string): string {
  return ROLE_MODEL_MAPPING[role] || 'llama3.2:3b';
}

/**
 * Validate backend configuration
 */
export function validateBackendConfig(config: BackendConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate server config
  if (!config.server.url) {
    errors.push('Server URL is required');
  }
  if (config.server.timeout < 1000) {
    errors.push('Server timeout must be at least 1000ms');
  }

  // Validate Ollama instances
  if (config.ollama.instances.length === 0) {
    errors.push('At least one Ollama instance is required');
  }

  config.ollama.instances.forEach((instance, index) => {
    if (instance.port < 1024 || instance.port > 65535) {
      errors.push(`Instance ${index}: Invalid port ${instance.port}`);
    }
    if (instance.models.length === 0) {
      errors.push(`Instance ${index}: At least one model is required`);
    }
  });

  // Validate LLM config
  if (config.llm.cacheTTL < 0) {
    errors.push('Cache TTL must be non-negative');
  }
  if (config.llm.batchSize < 1) {
    errors.push('Batch size must be at least 1');
  }

  // Validate performance config
  if (config.performance.maxQueueSize < 1) {
    errors.push('Max queue size must be at least 1');
  }
  if (config.performance.requestTimeout < 1000) {
    errors.push('Request timeout must be at least 1000ms');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export configuration helper
 */
export default {
  DEFAULT: DEFAULT_BACKEND_CONFIG,
  DEVELOPMENT: DEVELOPMENT_CONFIG,
  PRODUCTION: PRODUCTION_CONFIG,
  get: getBackendConfig,
  getModelForRole,
  validate: validateBackendConfig,
};
