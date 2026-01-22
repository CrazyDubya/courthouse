import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import express from 'express';
import request from 'supertest';
import createLLMRoutes from '../llm.js';
import { LLMService } from '../../services/LLMService.js';
import { QueueService } from '../../services/QueueService.js';

describe('LLM Routes', () => {
  let app: express.Application;
  let mockLLMService: LLMService;
  let mockQueueService: QueueService;

  beforeEach(() => {
    mockLLMService = {
      getProviderStatus: vi.fn(),
      createProvider: vi.fn()
    } as unknown as LLMService;

    mockQueueService = {
      addLLMRequest: vi.fn(),
      getQueuePosition: vi.fn(),
      getJobStatus: vi.fn(),
      cancelJob: vi.fn(),
      retryFailedJob: vi.fn(),
      getQueueStats: vi.fn(),
      getActiveJobIds: vi.fn(),
      getPendingJobIds: vi.fn(),
      clearCompletedJobs: vi.fn(),
      clearFailedJobs: vi.fn()
    } as unknown as QueueService;

    app = express();
    app.use(express.json());
    app.use('/api/llm', createLLMRoutes(mockLLMService, mockQueueService));
  });

  describe('POST /api/llm/request', () => {
    const validRequest = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' }
      ],
      config: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      },
      priority: 5
    };

    it('should queue a valid LLM request', async () => {
      (mockQueueService.addLLMRequest as MockedFunction<typeof mockQueueService.addLLMRequest>).mockResolvedValue(undefined);
      (mockQueueService.getQueuePosition as MockedFunction<typeof mockQueueService.getQueuePosition>).mockResolvedValue(3);

      const response = await request(app)
        .post('/api/llm/request')
        .set('x-user-id', 'user-123')
        .send(validRequest);

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('requestId');
      expect(response.body.status).toBe('queued');
      expect(response.body.position).toBe(3);
      expect(response.body.estimatedWaitTime).toBe(15);
      expect(mockQueueService.addLLMRequest).toHaveBeenCalled();
    });

    it('should reject request with missing messages', async () => {
      const invalidRequest = { ...validRequest, messages: undefined };

      const response = await request(app)
        .post('/api/llm/request')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject request with empty messages array', async () => {
      const invalidRequest = { ...validRequest, messages: [] };

      const response = await request(app)
        .post('/api/llm/request')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject request with invalid message role', async () => {
      const invalidRequest = {
        ...validRequest,
        messages: [{ role: 'invalid', content: 'test' }]
      };

      const response = await request(app)
        .post('/api/llm/request')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject request with missing config', async () => {
      const invalidRequest = { ...validRequest, config: undefined };

      const response = await request(app)
        .post('/api/llm/request')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject request with invalid provider', async () => {
      const invalidRequest = {
        ...validRequest,
        config: { ...validRequest.config, provider: 'invalid-provider' }
      };

      const response = await request(app)
        .post('/api/llm/request')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject request with invalid temperature', async () => {
      const invalidRequest = {
        ...validRequest,
        config: { ...validRequest.config, temperature: 3 }
      };

      const response = await request(app)
        .post('/api/llm/request')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject request with invalid maxTokens', async () => {
      const invalidRequest = {
        ...validRequest,
        config: { ...validRequest.config, maxTokens: 0 }
      };

      const response = await request(app)
        .post('/api/llm/request')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should accept valid providers', async () => {
      (mockQueueService.addLLMRequest as MockedFunction<typeof mockQueueService.addLLMRequest>).mockResolvedValue(undefined);
      (mockQueueService.getQueuePosition as MockedFunction<typeof mockQueueService.getQueuePosition>).mockResolvedValue(1);

      const providers = ['openai', 'anthropic', 'ollama', 'openrouter', 'groq'];

      for (const provider of providers) {
        const req = {
          ...validRequest,
          config: { ...validRequest.config, provider }
        };

        const response = await request(app)
          .post('/api/llm/request')
          .send(req);

        expect(response.status).toBe(202);
      }
    });

    it('should handle queue service errors', async () => {
      (mockQueueService.addLLMRequest as MockedFunction<typeof mockQueueService.addLLMRequest>).mockRejectedValue(new Error('Queue error'));

      const response = await request(app)
        .post('/api/llm/request')
        .send(validRequest);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });

    it('should default priority to 0 if not provided', async () => {
      (mockQueueService.addLLMRequest as MockedFunction<typeof mockQueueService.addLLMRequest>).mockResolvedValue(undefined);
      (mockQueueService.getQueuePosition as MockedFunction<typeof mockQueueService.getQueuePosition>).mockResolvedValue(1);

      const requestNoPriority = { ...validRequest };
      delete requestNoPriority.priority;

      const response = await request(app)
        .post('/api/llm/request')
        .send(requestNoPriority);

      expect(response.status).toBe(202);
    });
  });

  describe('GET /api/llm/request/:requestId/status', () => {
    it('should return status of pending request', async () => {
      const jobStatus = {
        status: 'pending' as const,
        timestamp: new Date(),
        result: null,
        error: null
      };
      (mockQueueService.getJobStatus as MockedFunction<typeof mockQueueService.getJobStatus>).mockResolvedValue(jobStatus);
      (mockQueueService.getQueuePosition as MockedFunction<typeof mockQueueService.getQueuePosition>).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/llm/request/req-123/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('pending');
      expect(response.body.position).toBe(2);
    });

    it('should return status of completed request', async () => {
      const jobStatus = {
        status: 'completed' as const,
        timestamp: new Date(),
        result: { text: 'Generated response' },
        error: null
      };
      (mockQueueService.getJobStatus as MockedFunction<typeof mockQueueService.getJobStatus>).mockResolvedValue(jobStatus);

      const response = await request(app)
        .get('/api/llm/request/req-123/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.result).toEqual({ text: 'Generated response' });
      expect(response.body.position).toBeUndefined();
    });

    it('should return status of failed request', async () => {
      const jobStatus = {
        status: 'failed' as const,
        timestamp: new Date(),
        result: null,
        error: 'API rate limit exceeded'
      };
      (mockQueueService.getJobStatus as MockedFunction<typeof mockQueueService.getJobStatus>).mockResolvedValue(jobStatus);

      const response = await request(app)
        .get('/api/llm/request/req-123/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error).toBe('API rate limit exceeded');
    });

    it('should return 404 if request not found', async () => {
      (mockQueueService.getJobStatus as MockedFunction<typeof mockQueueService.getJobStatus>).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/llm/request/nonexistent/status');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Request not found');
    });

    it('should handle service errors', async () => {
      (mockQueueService.getJobStatus as MockedFunction<typeof mockQueueService.getJobStatus>).mockRejectedValue(new Error('Queue error'));

      const response = await request(app)
        .get('/api/llm/request/req-123/status');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });
  });

  describe('POST /api/llm/request/:requestId/cancel', () => {
    it('should cancel a request', async () => {
      (mockQueueService.cancelJob as MockedFunction<typeof mockQueueService.cancelJob>).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/llm/request/req-123/cancel');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Request cancelled successfully');
      expect(mockQueueService.cancelJob).toHaveBeenCalledWith('req-123');
    });

    it('should return 404 if request not found', async () => {
      (mockQueueService.cancelJob as MockedFunction<typeof mockQueueService.cancelJob>).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/llm/request/nonexistent/cancel');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Request not found or cannot be cancelled');
    });

    it('should handle service errors', async () => {
      (mockQueueService.cancelJob as MockedFunction<typeof mockQueueService.cancelJob>).mockRejectedValue(new Error('Queue error'));

      const response = await request(app)
        .post('/api/llm/request/req-123/cancel');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });
  });

  describe('POST /api/llm/request/:requestId/retry', () => {
    it('should retry a failed request', async () => {
      (mockQueueService.retryFailedJob as MockedFunction<typeof mockQueueService.retryFailedJob>).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/llm/request/req-123/retry');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Request queued for retry');
      expect(mockQueueService.retryFailedJob).toHaveBeenCalledWith('req-123');
    });

    it('should return 404 if request not found', async () => {
      (mockQueueService.retryFailedJob as MockedFunction<typeof mockQueueService.retryFailedJob>).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/llm/request/nonexistent/retry');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Request not found or cannot be retried');
    });

    it('should handle service errors', async () => {
      (mockQueueService.retryFailedJob as MockedFunction<typeof mockQueueService.retryFailedJob>).mockRejectedValue(new Error('Queue error'));

      const response = await request(app)
        .post('/api/llm/request/req-123/retry');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });
  });

  describe('GET /api/llm/providers', () => {
    it('should return provider status', async () => {
      const providerStatus = {
        openai: { available: true, models: ['gpt-4', 'gpt-3.5-turbo'] },
        anthropic: { available: false, models: [] }
      };
      (mockLLMService.getProviderStatus as MockedFunction<typeof mockLLMService.getProviderStatus>).mockResolvedValue(providerStatus);

      const response = await request(app)
        .get('/api/llm/providers');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(providerStatus);
    });

    it('should handle service errors', async () => {
      (mockLLMService.getProviderStatus as MockedFunction<typeof mockLLMService.getProviderStatus>).mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/api/llm/providers');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Service error');
    });
  });

  describe('POST /api/llm/providers/:provider/test', () => {
    it('should test provider configuration', async () => {
      const mockProvider = { validateConfig: vi.fn().mockResolvedValue(true) };
      (mockLLMService.createProvider as MockedFunction<typeof mockLLMService.createProvider>).mockReturnValue(mockProvider);

      const config = { apiKey: 'test-key', model: 'gpt-4' };

      const response = await request(app)
        .post('/api/llm/providers/openai/test')
        .send({ config });

      expect(response.status).toBe(200);
      expect(response.body.provider).toBe('openai');
      expect(response.body.valid).toBe(true);
      expect(mockLLMService.createProvider).toHaveBeenCalledWith({
        provider: 'openai',
        ...config
      });
    });

    it('should return invalid if provider config fails', async () => {
      const mockProvider = { validateConfig: vi.fn().mockResolvedValue(false) };
      (mockLLMService.createProvider as MockedFunction<typeof mockLLMService.createProvider>).mockReturnValue(mockProvider);

      const config = { apiKey: 'invalid-key', model: 'gpt-4' };

      const response = await request(app)
        .post('/api/llm/providers/openai/test')
        .send({ config });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
    });

    it('should return 400 if config is missing', async () => {
      const response = await request(app)
        .post('/api/llm/providers/openai/test')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Provider config is required');
    });

    it('should handle service errors', async () => {
      (mockLLMService.createProvider as MockedFunction<typeof mockLLMService.createProvider>).mockImplementation(() => {
        throw new Error('Invalid provider');
      });

      const response = await request(app)
        .post('/api/llm/providers/invalid/test')
        .send({ config: {} });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Invalid provider');
    });
  });

  describe('GET /api/llm/queue/stats', () => {
    it('should return queue statistics', async () => {
      const stats = {
        pending: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 0
      };
      (mockQueueService.getQueueStats as MockedFunction<typeof mockQueueService.getQueueStats>).mockResolvedValue(stats);

      const response = await request(app)
        .get('/api/llm/queue/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(stats);
    });

    it('should handle service errors', async () => {
      (mockQueueService.getQueueStats as MockedFunction<typeof mockQueueService.getQueueStats>).mockRejectedValue(new Error('Queue error'));

      const response = await request(app)
        .get('/api/llm/queue/stats');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });
  });

  describe('GET /api/llm/queue/jobs/active', () => {
    it('should return active job IDs', async () => {
      const activeJobs = ['job-1', 'job-2', 'job-3'];
      (mockQueueService.getActiveJobIds as MockedFunction<typeof mockQueueService.getActiveJobIds>).mockReturnValue(activeJobs);

      const response = await request(app)
        .get('/api/llm/queue/jobs/active');

      expect(response.status).toBe(200);
      expect(response.body.activeJobs).toEqual(activeJobs);
      expect(response.body.count).toBe(3);
    });

    it('should handle service errors', async () => {
      (mockQueueService.getActiveJobIds as MockedFunction<typeof mockQueueService.getActiveJobIds>).mockImplementation(() => {
        throw new Error('Queue error');
      });

      const response = await request(app)
        .get('/api/llm/queue/jobs/active');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });
  });

  describe('GET /api/llm/queue/jobs/pending', () => {
    it('should return pending job IDs', async () => {
      const pendingJobs = ['job-4', 'job-5'];
      (mockQueueService.getPendingJobIds as MockedFunction<typeof mockQueueService.getPendingJobIds>).mockReturnValue(pendingJobs);

      const response = await request(app)
        .get('/api/llm/queue/jobs/pending');

      expect(response.status).toBe(200);
      expect(response.body.pendingJobs).toEqual(pendingJobs);
      expect(response.body.count).toBe(2);
    });

    it('should handle service errors', async () => {
      (mockQueueService.getPendingJobIds as MockedFunction<typeof mockQueueService.getPendingJobIds>).mockImplementation(() => {
        throw new Error('Queue error');
      });

      const response = await request(app)
        .get('/api/llm/queue/jobs/pending');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });
  });

  describe('POST /api/llm/queue/cleanup', () => {
    it('should cleanup completed jobs', async () => {
      (mockQueueService.clearCompletedJobs as MockedFunction<typeof mockQueueService.clearCompletedJobs>).mockResolvedValue(10);

      const response = await request(app)
        .post('/api/llm/queue/cleanup')
        .send({ type: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.clearedCount).toBe(10);
      expect(response.body.type).toBe('completed');
      expect(mockQueueService.clearCompletedJobs).toHaveBeenCalled();
    });

    it('should cleanup failed jobs', async () => {
      (mockQueueService.clearFailedJobs as MockedFunction<typeof mockQueueService.clearFailedJobs>).mockResolvedValue(5);

      const response = await request(app)
        .post('/api/llm/queue/cleanup')
        .send({ type: 'failed' });

      expect(response.status).toBe(200);
      expect(response.body.clearedCount).toBe(5);
      expect(mockQueueService.clearFailedJobs).toHaveBeenCalled();
    });

    it('should cleanup all jobs', async () => {
      (mockQueueService.clearCompletedJobs as MockedFunction<typeof mockQueueService.clearCompletedJobs>).mockResolvedValue(10);
      (mockQueueService.clearFailedJobs as MockedFunction<typeof mockQueueService.clearFailedJobs>).mockResolvedValue(5);

      const response = await request(app)
        .post('/api/llm/queue/cleanup')
        .send({ type: 'all' });

      expect(response.status).toBe(200);
      expect(response.body.clearedCount).toBe(15);
      expect(mockQueueService.clearCompletedJobs).toHaveBeenCalled();
      expect(mockQueueService.clearFailedJobs).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      (mockQueueService.clearCompletedJobs as MockedFunction<typeof mockQueueService.clearCompletedJobs>).mockRejectedValue(new Error('Queue error'));

      const response = await request(app)
        .post('/api/llm/queue/cleanup')
        .send({ type: 'completed' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Queue error');
    });
  });
});
