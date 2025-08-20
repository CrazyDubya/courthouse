import { EventEmitter } from 'events';
import { LLMRequest, LLMResponse } from '../types/index.js';
import { LLMService } from './LLMService.js';

interface QueueJob {
  id: string;
  request: LLMRequest;
  priority: number;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

export class QueueService extends EventEmitter {
  private queue: QueueJob[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private activeJobs = new Map<string, QueueJob>();
  private completedJobs = new Map<string, QueueJob>();
  private failedJobs = new Map<string, QueueJob>();
  private llmService?: LLMService;

  constructor() {
    super();
    this.startProcessing();
  }

  setLLMService(llmService: LLMService): void {
    this.llmService = llmService;
  }

  async addLLMRequest(request: LLMRequest, maxAttempts = 3): Promise<void> {
    const job: QueueJob = {
      id: request.id,
      request: {
        ...request,
        status: 'pending'
      },
      priority: request.priority || 0,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts
    };

    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority);

    this.emit('job_queued', request.id, this.queue.length);
    console.log(`Job ${request.id} added to queue. Queue length: ${this.queue.length}`);
  }

  async getQueuePosition(requestId: string): Promise<number> {
    const index = this.queue.findIndex(job => job.id === requestId);
    return index >= 0 ? index + 1 : -1;
  }

  async getQueueStats(): Promise<{
    pending: number;
    active: number;
    completed: number;
    failed: number;
    totalProcessed: number;
  }> {
    return {
      pending: this.queue.length,
      active: this.activeJobs.size,
      completed: this.completedJobs.size,
      failed: this.failedJobs.size,
      totalProcessed: this.completedJobs.size + this.failedJobs.size
    };
  }

  private startProcessing(): void {
    if (this.processing) return;
    
    this.processing = true;
    console.log('Queue processing started');
    
    setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  private async processQueue(): Promise<void> {
    if (this.activeJobs.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeJobs.set(job.id, job);
    job.request.status = 'processing';
    job.attempts++;

    this.emit('job_started', job.id);
    console.log(`Processing job ${job.id} (attempt ${job.attempts}/${job.maxAttempts})`);

    try {
      const result = await this.processLLMRequest(job);
      
      job.request.status = 'completed';
      job.request.result = result;
      
      this.activeJobs.delete(job.id);
      this.completedJobs.set(job.id, job);
      
      this.emit('job_completed', job.id, result);
      console.log(`Job ${job.id} completed successfully`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}):`, errorMessage);

      if (job.attempts >= job.maxAttempts) {
        job.request.status = 'failed';
        job.request.error = errorMessage;
        
        this.activeJobs.delete(job.id);
        this.failedJobs.set(job.id, job);
        
        this.emit('job_failed', job.id, errorMessage);
        console.log(`Job ${job.id} permanently failed after ${job.attempts} attempts`);
      } else {
        this.activeJobs.delete(job.id);
        job.priority += 1;
        this.queue.push(job);
        this.queue.sort((a, b) => b.priority - a.priority);
        
        console.log(`Job ${job.id} requeued for retry (attempt ${job.attempts + 1}/${job.maxAttempts})`);
      }
    }
  }

  private async processLLMRequest(job: QueueJob): Promise<LLMResponse> {
    if (!this.llmService) {
      throw new Error('LLMService not initialized');
    }

    const { request } = job;
    const provider = this.llmService.createProvider(request.config);
    
    this.emit('job_progress', job.id, 0.1);

    const startTime = Date.now();
    const response = await provider.generateResponse(request.messages);
    const endTime = Date.now();

    this.emit('job_progress', job.id, 1.0);

    console.log(`LLM request completed in ${endTime - startTime}ms for job ${job.id}`);

    return response;
  }

  async getJobStatus(requestId: string): Promise<LLMRequest | null> {
    const activeJob = this.activeJobs.get(requestId);
    if (activeJob) return activeJob.request;

    const completedJob = this.completedJobs.get(requestId);
    if (completedJob) return completedJob.request;

    const failedJob = this.failedJobs.get(requestId);
    if (failedJob) return failedJob.request;

    const queuedJob = this.queue.find(job => job.id === requestId);
    if (queuedJob) return queuedJob.request;

    return null;
  }

  async cancelJob(requestId: string): Promise<boolean> {
    const queueIndex = this.queue.findIndex(job => job.id === requestId);
    if (queueIndex >= 0) {
      this.queue.splice(queueIndex, 1);
      this.emit('job_cancelled', requestId);
      return true;
    }

    return false;
  }

  async clearCompletedJobs(): Promise<number> {
    const count = this.completedJobs.size;
    this.completedJobs.clear();
    return count;
  }

  async clearFailedJobs(): Promise<number> {
    const count = this.failedJobs.size;
    this.failedJobs.clear();
    return count;
  }

  async retryFailedJob(requestId: string): Promise<boolean> {
    const failedJob = this.failedJobs.get(requestId);
    if (!failedJob) return false;

    this.failedJobs.delete(requestId);
    
    failedJob.attempts = 0;
    failedJob.request.status = 'pending';
    failedJob.request.error = undefined;
    failedJob.request.result = undefined;
    
    this.queue.push(failedJob);
    this.queue.sort((a, b) => b.priority - a.priority);

    this.emit('job_requeued', requestId);
    return true;
  }

  getActiveJobIds(): string[] {
    return Array.from(this.activeJobs.keys());
  }

  getPendingJobIds(): string[] {
    return this.queue.map(job => job.id);
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down queue service...');
    this.processing = false;
    
    const activeJobPromises = Array.from(this.activeJobs.values()).map(job => 
      new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 30000);
        
        const onComplete = (jobId: string) => {
          if (jobId === job.id) {
            clearTimeout(timeout);
            this.off('job_completed', onComplete);
            this.off('job_failed', onComplete);
            resolve();
          }
        };

        this.on('job_completed', onComplete);
        this.on('job_failed', onComplete);
      })
    );

    await Promise.all(activeJobPromises);
    console.log('Queue service shutdown complete');
  }
}