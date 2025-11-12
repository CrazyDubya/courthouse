import { getWebSocketClient, LLMRequest, LLMResponse } from './WebSocketClient';
import { LLMProvider, LLMMessage, LLMResponse as BaseLLMResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface BackendLLMConfig {
  useBackend: boolean;
  serverUrl?: string;
  fallbackToLocal?: boolean;
}

export class BackendLLMService {
  private config: BackendLLMConfig;
  private wsClient: ReturnType<typeof getWebSocketClient> | null = null;
  private requestCache: Map<string, BaseLLMResponse> = new Map();
  private cacheEnabled: boolean = true;
  private cacheTTL: number = 300000; // 5 minutes

  constructor(config: BackendLLMConfig = { useBackend: true, fallbackToLocal: true }) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.config.useBackend) {
      try {
        this.wsClient = getWebSocketClient(this.config.serverUrl);
        await this.wsClient.connect();
        console.log('✅ Backend LLM Service initialized and connected');
      } catch (error) {
        console.error('❌ Failed to connect to backend:', error);
        if (!this.config.fallbackToLocal) {
          throw new Error('Backend connection required but failed');
        }
        console.log('⚠️  Falling back to local LLM providers');
      }
    }
  }

  async generateResponse(
    messages: LLMMessage[],
    provider: LLMProvider,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
      useCache?: boolean;
    }
  ): Promise<BaseLLMResponse> {
    const useCache = options?.useCache !== false && this.cacheEnabled;

    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(messages, provider, options);
      const cached = this.requestCache.get(cacheKey);
      if (cached) {
        console.log('📦 Using cached LLM response');
        return cached;
      }
    }

    // Use backend if available
    if (this.config.useBackend && this.wsClient?.isConnected()) {
      try {
        const response = await this.sendBackendRequest(messages, provider, options);

        // Cache the response
        if (useCache) {
          const cacheKey = this.getCacheKey(messages, provider, options);
          this.requestCache.set(cacheKey, response);

          // Auto-cleanup cache after TTL
          setTimeout(() => {
            this.requestCache.delete(cacheKey);
          }, this.cacheTTL);
        }

        return response;
      } catch (error) {
        console.error('❌ Backend LLM request failed:', error);

        if (!this.config.fallbackToLocal) {
          throw error;
        }

        console.log('⚠️  Backend failed, falling back to local provider');
        // Fall through to local provider
      }
    }

    // This would need the local LLM provider implementation
    throw new Error('Local LLM provider not implemented. Backend connection required.');
  }

  private async sendBackendRequest(
    messages: LLMMessage[],
    provider: LLMProvider,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<BaseLLMResponse> {
    if (!this.wsClient) {
      throw new Error('WebSocket client not initialized');
    }

    // Build prompt from messages
    const prompt = this.buildPrompt(messages);
    const systemMessage = messages.find(m => m.role === 'system')?.content;

    const request: LLMRequest = {
      id: uuidv4(),
      provider: provider,
      prompt: prompt,
      system: systemMessage,
      model: options?.model || this.getDefaultModel(provider),
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 500,
      context: {
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
      },
    };

    console.log(`🚀 Sending LLM request to backend: ${provider} / ${request.model}`);

    const response = await this.wsClient.sendLLMRequest(request);

    if (response.error) {
      throw new Error(`Backend LLM Error: ${response.error}`);
    }

    return {
      content: response.content,
      provider: response.metadata?.provider || provider,
      model: response.metadata?.model || request.model,
      usage: {
        promptTokens: response.metadata?.tokens || 0,
        completionTokens: response.metadata?.tokens || 0,
        totalTokens: response.metadata?.tokens || 0,
      },
    };
  }

  private buildPrompt(messages: LLMMessage[]): string {
    // Combine user and assistant messages into a prompt
    // Skip system messages as they're handled separately
    return messages
      .filter(m => m.role !== 'system')
      .map(m => {
        const prefix = m.role === 'user' ? 'User' : m.role === 'assistant' ? 'Assistant' : '';
        return prefix ? `${prefix}: ${m.content}` : m.content;
      })
      .join('\n\n');
  }

  private getDefaultModel(provider: LLMProvider): string {
    const defaults: Record<string, string> = {
      'ollama': 'llama3:latest',
      'openai': 'gpt-4',
      'anthropic': 'claude-3-sonnet-20240229',
      'groq': 'mixtral-8x7b-32768',
      'openrouter': 'anthropic/claude-3-sonnet',
    };
    return defaults[provider] || 'llama3:latest';
  }

  private getCacheKey(
    messages: LLMMessage[],
    provider: LLMProvider,
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): string {
    const messageHash = JSON.stringify(messages);
    const optionsHash = JSON.stringify({
      provider,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      model: options?.model,
    });
    return `${messageHash}:${optionsHash}`;
  }

  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.requestCache.clear();
    }
  }

  clearCache(): void {
    this.requestCache.clear();
    console.log('🧹 LLM response cache cleared');
  }

  getCacheSize(): number {
    return this.requestCache.size;
  }

  isBackendConnected(): boolean {
    return this.wsClient?.isConnected() || false;
  }

  disconnect(): void {
    this.wsClient?.disconnect();
    this.requestCache.clear();
  }

  // Batch processing for multiple requests
  async generateBatch(
    requests: Array<{
      messages: LLMMessage[];
      provider: LLMProvider;
      options?: {
        temperature?: number;
        maxTokens?: number;
        model?: string;
      };
    }>
  ): Promise<BaseLLMResponse[]> {
    console.log(`📊 Processing batch of ${requests.length} LLM requests`);

    // Process in parallel with a concurrency limit
    const concurrencyLimit = 5;
    const results: BaseLLMResponse[] = [];

    for (let i = 0; i < requests.length; i += concurrencyLimit) {
      const batch = requests.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(req =>
          this.generateResponse(req.messages, req.provider, req.options).catch(error => {
            console.error('Batch request failed:', error);
            return {
              content: 'Error generating response',
              provider: req.provider,
              model: 'unknown',
              usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            };
          })
        )
      );
      results.push(...batchResults);
    }

    console.log(`✅ Batch processing complete: ${results.length} responses`);
    return results;
  }

  // Stream support for long-running requests
  async *streamResponse(
    messages: LLMMessage[],
    provider: LLMProvider,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): AsyncGenerator<string, void, unknown> {
    if (!this.wsClient?.isConnected()) {
      throw new Error('Backend not connected for streaming');
    }

    const requestId = uuidv4();
    const chunks: string[] = [];

    // Set up streaming listener
    const streamHandler = (data: { id: string; chunk: string }) => {
      if (data.id === requestId) {
        chunks.push(data.chunk);
      }
    };

    this.wsClient.on('llm:streaming', streamHandler);

    try {
      // Send request
      const prompt = this.buildPrompt(messages);
      const systemMessage = messages.find(m => m.role === 'system')?.content;

      const request: LLMRequest = {
        id: requestId,
        provider: provider,
        prompt: prompt,
        system: systemMessage,
        model: options?.model || this.getDefaultModel(provider),
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 500,
      };

      // Note: This would need backend support for streaming
      await this.wsClient.sendLLMRequest(request);

      // Yield chunks as they arrive
      let lastChunkIndex = 0;
      const maxIterations = 600; // Maximum 60 seconds (600 * 100ms)
      const maxIdleIterations = 30; // Maximum 3 seconds of no new chunks (30 * 100ms)
      let iterations = 0;
      let idleIterations = 0;

      while (iterations < maxIterations) {
        if (chunks.length > lastChunkIndex) {
          for (let i = lastChunkIndex; i < chunks.length; i++) {
            yield chunks[i];
          }
          lastChunkIndex = chunks.length;
          idleIterations = 0; // Reset idle counter when new chunks arrive
        } else {
          idleIterations++;
        }

        // Check if complete (this would need proper signaling from backend)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Break after idle timeout or completion signal
        if (idleIterations >= maxIdleIterations) {
          break;
        }

        iterations++;
      }

      if (iterations >= maxIterations) {
        console.warn(`Stream response reached maximum iteration limit (${maxIterations})`);
      }
    } finally {
      this.wsClient.off('llm:streaming', streamHandler);
    }
  }
}

// Singleton instance
let instance: BackendLLMService | null = null;

export function getBackendLLMService(config?: BackendLLMConfig): BackendLLMService {
  if (!instance) {
    instance = new BackendLLMService(config);
  }
  return instance;
}

export function resetBackendLLMService(): void {
  if (instance) {
    instance.disconnect();
  }
  instance = null;
}
