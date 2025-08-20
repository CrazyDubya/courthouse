import { LLMConfig, LLMMessage, LLMResponse } from '../types/index.js';
import OpenAI from 'openai';
import { Ollama } from 'ollama';
import axios from 'axios';

export abstract class BaseLLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generateResponse(messages: LLMMessage[]): Promise<LLMResponse>;
  abstract validateConfig(): Promise<boolean>;
}

export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: messages as any,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}

export class AnthropicProvider extends BaseLLMProvider {
  private apiKey: string;
  private baseURL = 'https://api.anthropic.com/v1';

  constructor(config: LLMConfig) {
    super(config);
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');
      
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: this.config.model || 'claude-3-opus-20240229',
          messages: userMessages,
          system: systemMessage?.content,
          max_tokens: this.config.maxTokens || 1000,
          temperature: this.config.temperature || 0.7,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      return {
        content: response.data.content[0]?.text || '',
        usage: response.data.usage ? {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export class OllamaProvider extends BaseLLMProvider {
  public client: Ollama;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new Ollama({
      host: config.endpoint || process.env.OLLAMA_HOST || 'http://localhost:11434',
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\\n');
      
      const response = await this.client.generate({
        model: this.config.model || 'llama2',
        prompt: prompt,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 1000,
        },
      });

      return {
        content: response.response,
      };
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch {
      return false;
    }
  }
}

export class OpenRouterProvider extends BaseLLMProvider {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor(config: LLMConfig) {
    super(config);
    this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || '';
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.config.model || 'openai/gpt-4-turbo-preview',
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://courtroom-simulator.com',
            'X-Title': 'Courtroom Simulator',
          },
        }
      );

      return {
        content: response.data.choices[0]?.message?.content || '',
        usage: response.data.usage ? {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export class GroqProvider extends BaseLLMProvider {
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor(config: LLMConfig) {
    super(config);
    this.apiKey = config.apiKey || process.env.GROQ_API_KEY || '';
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.config.model || 'mixtral-8x7b-32768',
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: response.data.choices[0]?.message?.content || '',
        usage: response.data.usage ? {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export class LLMService {
  private providers: Map<string, BaseLLMProvider> = new Map();

  createProvider(config: LLMConfig): BaseLLMProvider {
    const key = `${config.provider}_${config.model}_${config.endpoint || 'default'}`;
    
    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    let provider: BaseLLMProvider;

    switch (config.provider) {
      case 'openai':
        provider = new OpenAIProvider(config);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(config);
        break;
      case 'ollama':
        provider = new OllamaProvider(config);
        break;
      case 'openrouter':
        provider = new OpenRouterProvider(config);
        break;
      case 'groq':
        provider = new GroqProvider(config);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }

    this.providers.set(key, provider);
    return provider;
  }

  async getProviderStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    const testConfigs = [
      { provider: 'openai', model: 'gpt-3.5-turbo' },
      { provider: 'anthropic', model: 'claude-3-opus-20240229' },
      { provider: 'ollama', model: 'llama3:latest', endpoint: process.env.OLLAMA_HOST },
      { provider: 'ollama', model: 'llama3:latest', endpoint: process.env.OLLAMA_SECONDARY_HOST },
      { provider: 'ollama', model: 'llama3:latest', endpoint: process.env.OLLAMA_TERTIARY_HOST },
      { provider: 'groq', model: 'mixtral-8x7b-32768' },
    ];

    for (const config of testConfigs) {
      try {
        const provider = this.createProvider(config as LLMConfig);
        const isValid = await provider.validateConfig();
        const key = config.endpoint ? 
          `${config.provider}_${config.endpoint}` : 
          config.provider;
        
        status[key] = {
          available: isValid,
          model: config.model,
          endpoint: config.endpoint,
          lastChecked: new Date().toISOString()
        };
      } catch (error) {
        const key = config.endpoint ? 
          `${config.provider}_${config.endpoint}` : 
          config.provider;
        
        status[key] = {
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          model: config.model,
          endpoint: config.endpoint,
          lastChecked: new Date().toISOString()
        };
      }
    }

    return status;
  }

  clearCache(): void {
    this.providers.clear();
  }

  getCachedProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}