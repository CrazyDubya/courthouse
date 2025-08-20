import { LLMConfig, LLMProvider as LLMProviderType, ParticipantRole } from '../../types';
import OpenAI from 'openai';
import { Ollama } from 'ollama';
import axios from 'axios';
import { ollamaInstanceManager, OllamaInstance } from '../OllamaInstanceManager';
import { performanceMonitor } from '../PerformanceMonitor';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseLLMProvider {
  protected config: LLMConfig;
  protected participantRole?: ParticipantRole;

  constructor(config: LLMConfig, participantRole?: ParticipantRole) {
    this.config = config;
    this.participantRole = participantRole;
  }

  abstract generateResponse(messages: LLMMessage[]): Promise<LLMResponse>;
  abstract validateConfig(): Promise<boolean>;
}

export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig, participantRole?: ParticipantRole) {
    super(config, participantRole);
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
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
        content: completion.choices[0].message.content || '',
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

  constructor(config: LLMConfig, participantRole?: ParticipantRole) {
    super(config, participantRole);
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
        content: response.data.content[0].text,
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
  private instance: OllamaInstance | null = null;
  private client: Ollama;

  constructor(config: LLMConfig, participantRole?: ParticipantRole) {
    super(config, participantRole);
    
    // If participant role is provided, get the appropriate instance
    if (participantRole) {
      this.instance = ollamaInstanceManager.getInstanceForRole(participantRole);
      if (this.instance) {
        this.client = this.instance.client;
        console.log(`🎯 Assigned ${participantRole} to Ollama instance: ${this.instance.model} on port ${this.instance.port}`);
      } else {
        console.warn(`⚠️ No instance available for role ${participantRole}, using default`);
        this.client = new Ollama({
          host: config.endpoint || 'http://localhost:11434',
        });
      }
    } else {
      // Fallback to config endpoint or default
      this.client = new Ollama({
        host: config.endpoint || 'http://localhost:11434',
      });
    }
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();
    const modelToUse = this.instance?.model || this.config.model || 'llama3:latest';
    const instanceId = this.instance?.id || 'default';
    const port = this.instance?.port || 11434;

    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\\n');
      
      const response = await this.client.generate({
        model: modelToUse,
        prompt: prompt,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 1000,
        },
      });

      // Record successful response
      performanceMonitor.recordResponse(instanceId, modelToUse, port, startTime);

      return {
        content: response.response,
      };
    } catch (error) {
      console.error(`Ollama API error (${modelToUse}):`, error);
      
      // Record error
      performanceMonitor.recordError(instanceId, modelToUse, port, startTime);
      
      // If this instance failed, try to get a fallback
      if (this.participantRole && this.instance) {
        console.log(`🔄 Attempting fallback for role ${this.participantRole}...`);
        const fallbackInstance = ollamaInstanceManager.getInstanceForRole(this.participantRole);
        if (fallbackInstance && fallbackInstance.id !== this.instance.id) {
          this.instance = fallbackInstance;
          this.client = fallbackInstance.client;
          console.log(`🔄 Switched to fallback instance: ${fallbackInstance.model} on port ${fallbackInstance.port}`);
          
          // Retry with fallback (this will create a new performance record)
          return await this.generateResponse(messages);
        }
      }
      
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

  public getAssignedInstance(): OllamaInstance | null {
    return this.instance;
  }

  public getCurrentModel(): string {
    return this.instance?.model || this.config.model || 'llama3:latest';
  }

  public getCurrentEndpoint(): string {
    return this.instance?.endpoint || this.config.endpoint || 'http://localhost:11434';
  }
}

export class OpenRouterProvider extends BaseLLMProvider {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor(config: LLMConfig, participantRole?: ParticipantRole) {
    super(config, participantRole);
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
        content: response.data.choices[0].message.content,
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

  constructor(config: LLMConfig, participantRole?: ParticipantRole) {
    super(config, participantRole);
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
        content: response.data.choices[0].message.content,
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

export class LLMProviderFactory {
  static create(config: LLMConfig, participantRole?: ParticipantRole): BaseLLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config, participantRole);
      case 'anthropic':
        return new AnthropicProvider(config, participantRole);
      case 'ollama':
        return new OllamaProvider(config, participantRole);
      case 'openrouter':
        return new OpenRouterProvider(config, participantRole);
      case 'groq':
        return new GroqProvider(config, participantRole);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  static createForRole(role: ParticipantRole, config?: Partial<LLMConfig>): BaseLLMProvider {
    const defaultConfig: LLMConfig = {
      provider: 'ollama',
      model: 'llama3:latest',
      temperature: 0.7,
      maxTokens: 1000,
      ...config
    };

    return this.create(defaultConfig, role);
  }
}