import { LLMConfig, LLMProvider as LLMProviderType } from '../../types';
import OpenAI from 'openai';
import { Ollama } from 'ollama';
import axios from 'axios';

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
  private client: Ollama;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new Ollama({
      host: config.endpoint || 'http://localhost:11434',
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
  static create(config: LLMConfig): BaseLLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      case 'openrouter':
        return new OpenRouterProvider(config);
      case 'groq':
        return new GroqProvider(config);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
}