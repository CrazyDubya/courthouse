import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LLMService } from '../../services/LLMService.js';
import { QueueService } from '../../services/QueueService.js';
import { LLMRequest } from '../../types/index.js';

describe('LLM Service Integration', () => {
  let llmService: LLMService;
  let queueService: QueueService;

  beforeEach(() => {
    llmService = new LLMService();
    queueService = new QueueService(llmService);
  });

  afterEach(async () => {
    await queueService.clearCompletedJobs();
    await queueService.clearFailedJobs();
  });

  describe('LLM Request Flow', () => {
    it('should queue and process an LLM request', async () => {
      const request: LLMRequest = {
        id: 'req-test-1',
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello' }
        ],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434',
          temperature: 0.7,
          maxTokens: 100
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending',
        priority: 5
      };

      await queueService.addLLMRequest(request);

      const position = await queueService.getQueuePosition(request.id);
      expect(position).toBeGreaterThanOrEqual(0);

      const stats = await queueService.getQueueStats();
      expect(stats.pending + stats.active).toBeGreaterThan(0);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests: LLMRequest[] = Array.from({ length: 5 }, (_, i) => ({
        id: `req-test-${i}`,
        messages: [
          { role: 'user', content: `Test message ${i}` }
        ],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending'
      }));

      await Promise.all(requests.map(req => queueService.addLLMRequest(req)));

      const stats = await queueService.getQueueStats();
      expect(stats.pending + stats.active + stats.completed).toBeGreaterThanOrEqual(5);
    });

    it('should handle request cancellation', async () => {
      const request: LLMRequest = {
        id: 'req-cancel-test',
        messages: [{ role: 'user', content: 'Test' }],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending'
      };

      await queueService.addLLMRequest(request);
      const cancelled = await queueService.cancelJob(request.id);

      expect(cancelled).toBe(true);
    });

    it('should respect priority ordering', async () => {
      const lowPriority: LLMRequest = {
        id: 'req-low',
        messages: [{ role: 'user', content: 'Low priority' }],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending',
        priority: 0
      };

      const highPriority: LLMRequest = {
        id: 'req-high',
        messages: [{ role: 'user', content: 'High priority' }],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending',
        priority: 10
      };

      await queueService.addLLMRequest(lowPriority);
      await queueService.addLLMRequest(highPriority);

      const highPosition = await queueService.getQueuePosition('req-high');
      const lowPosition = await queueService.getQueuePosition('req-low');

      expect(highPosition).toBeLessThan(lowPosition);
    });
  });

  describe('Provider Management', () => {
    it('should return provider status', async () => {
      const status = await llmService.getProviderStatus();
      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
    });

    it('should create provider instances', () => {
      const config = {
        provider: 'ollama',
        model: 'llama2',
        endpoint: 'http://localhost:11434'
      };

      const provider = llmService.createProvider(config);
      expect(provider).toBeDefined();
    });

    it('should validate provider configurations', async () => {
      const config = {
        provider: 'ollama',
        model: 'llama2',
        endpoint: 'http://localhost:11434'
      };

      const provider = llmService.createProvider(config);
      const isValid = await provider.validateConfig();

      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('Queue Management', () => {
    it('should track active jobs', async () => {
      const request: LLMRequest = {
        id: 'req-active-test',
        messages: [{ role: 'user', content: 'Test' }],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending'
      };

      await queueService.addLLMRequest(request);

      const activeJobs = queueService.getActiveJobIds();
      expect(Array.isArray(activeJobs)).toBe(true);
    });

    it('should track pending jobs', async () => {
      const request: LLMRequest = {
        id: 'req-pending-test',
        messages: [{ role: 'user', content: 'Test' }],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending'
      };

      await queueService.addLLMRequest(request);

      const pendingJobs = queueService.getPendingJobIds();
      expect(Array.isArray(pendingJobs)).toBe(true);
    });

    it('should clear completed jobs', async () => {
      const initialCount = await queueService.clearCompletedJobs();
      expect(typeof initialCount).toBe('number');
      expect(initialCount).toBeGreaterThanOrEqual(0);
    });

    it('should clear failed jobs', async () => {
      const initialCount = await queueService.clearFailedJobs();
      expect(typeof initialCount).toBe('number');
      expect(initialCount).toBeGreaterThanOrEqual(0);
    });

    it('should get queue statistics', async () => {
      const stats = await queueService.getQueueStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(typeof stats.pending).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(typeof stats.failed).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid provider gracefully', () => {
      expect(() => {
        llmService.createProvider({
          provider: 'invalid-provider' as any,
          model: 'test'
        });
      }).toThrow();
    });

    it('should handle failed requests with retry', async () => {
      const request: LLMRequest = {
        id: 'req-retry-test',
        messages: [{ role: 'user', content: 'Test' }],
        config: {
          provider: 'ollama',
          model: 'invalid-model',
          endpoint: 'http://localhost:11434'
        },
        userId: 'test-user',
        timestamp: new Date(),
        status: 'pending'
      };

      await queueService.addLLMRequest(request);

      const retried = await queueService.retryFailedJob(request.id);
      expect(typeof retried).toBe('boolean');
    });
  });
});
