import express from 'express';
import Joi from 'joi';
import { LLMService } from '../services/LLMService.js';
import { QueueService } from '../services/QueueService.js';
import { LLMRequest } from '../types/index.js';

const router = express.Router();

const llmRequestSchema = Joi.object({
  messages: Joi.array().items(Joi.object({
    role: Joi.string().valid('system', 'user', 'assistant').required(),
    content: Joi.string().required()
  })).min(1).required(),
  config: Joi.object({
    provider: Joi.string().valid('openai', 'anthropic', 'ollama', 'openrouter', 'groq').required(),
    model: Joi.string().required(),
    apiKey: Joi.string().optional(),
    endpoint: Joi.string().optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().min(1).max(8000).optional()
  }).required(),
  priority: Joi.number().min(0).max(10).optional().default(0),
  sessionId: Joi.string().optional()
});

export default function createLLMRoutes(llmService: LLMService, queueService: QueueService) {
  router.post('/request', async (req, res) => {
    try {
      const { error, value } = llmRequestSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
      }

      const request: LLMRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...value,
        userId: req.headers['x-user-id'] as string,
        timestamp: new Date(),
        status: 'pending'
      };

      await queueService.addLLMRequest(request);
      
      const position = await queueService.getQueuePosition(request.id);

      res.status(202).json({
        requestId: request.id,
        status: 'queued',
        position,
        estimatedWaitTime: position * 5
      });

    } catch (error) {
      console.error('Error processing LLM request:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to process LLM request' 
      });
    }
  });

  router.get('/request/:requestId/status', async (req, res) => {
    try {
      const { requestId } = req.params;
      const jobStatus = await queueService.getJobStatus(requestId);
      
      if (!jobStatus) {
        return res.status(404).json({ error: 'Request not found' });
      }

      const position = jobStatus.status === 'pending' ? 
        await queueService.getQueuePosition(requestId) : -1;

      res.json({
        requestId,
        status: jobStatus.status,
        position: position > 0 ? position : undefined,
        result: jobStatus.result,
        error: jobStatus.error,
        timestamp: jobStatus.timestamp
      });

    } catch (error) {
      console.error('Error fetching request status:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch request status' 
      });
    }
  });

  router.post('/request/:requestId/cancel', async (req, res) => {
    try {
      const { requestId } = req.params;
      const cancelled = await queueService.cancelJob(requestId);
      
      if (!cancelled) {
        return res.status(404).json({ error: 'Request not found or cannot be cancelled' });
      }

      res.json({ message: 'Request cancelled successfully' });

    } catch (error) {
      console.error('Error cancelling request:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to cancel request' 
      });
    }
  });

  router.post('/request/:requestId/retry', async (req, res) => {
    try {
      const { requestId } = req.params;
      const retried = await queueService.retryFailedJob(requestId);
      
      if (!retried) {
        return res.status(404).json({ error: 'Request not found or cannot be retried' });
      }

      res.json({ message: 'Request queued for retry' });

    } catch (error) {
      console.error('Error retrying request:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to retry request' 
      });
    }
  });

  router.get('/providers', async (req, res) => {
    try {
      const providers = await llmService.getProviderStatus();
      res.json(providers);
    } catch (error) {
      console.error('Error fetching provider status:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch provider status' 
      });
    }
  });

  router.post('/providers/:provider/test', async (req, res) => {
    try {
      const { provider } = req.params;
      const { config } = req.body;

      if (!config) {
        return res.status(400).json({ error: 'Provider config is required' });
      }

      const providerInstance = llmService.createProvider({ provider, ...config });
      const isValid = await providerInstance.validateConfig();

      res.json({ 
        provider, 
        valid: isValid,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error testing provider:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to test provider' 
      });
    }
  });

  router.get('/queue/stats', async (req, res) => {
    try {
      const stats = await queueService.getQueueStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch queue stats' 
      });
    }
  });

  router.get('/queue/jobs/active', async (req, res) => {
    try {
      const activeJobs = queueService.getActiveJobIds();
      res.json({ activeJobs, count: activeJobs.length });
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch active jobs' 
      });
    }
  });

  router.get('/queue/jobs/pending', async (req, res) => {
    try {
      const pendingJobs = queueService.getPendingJobIds();
      res.json({ pendingJobs, count: pendingJobs.length });
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch pending jobs' 
      });
    }
  });

  router.post('/queue/cleanup', async (req, res) => {
    try {
      const { type } = req.body;
      
      let clearedCount = 0;
      
      if (type === 'completed' || type === 'all') {
        clearedCount += await queueService.clearCompletedJobs();
      }
      
      if (type === 'failed' || type === 'all') {
        clearedCount += await queueService.clearFailedJobs();
      }

      res.json({ 
        message: `Cleared ${clearedCount} jobs`,
        type,
        clearedCount
      });

    } catch (error) {
      console.error('Error cleaning up queue:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to cleanup queue' 
      });
    }
  });

  return router;
}