import { LLMProvider, LLMConfig } from '../types/index.js';

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
  model?: string;
}

export abstract class BaseLLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generateResponse(messages: LLMMessage[]): Promise<LLMResponse>;
  abstract isConfigured(): boolean;
}

export class OpenAIProvider extends BaseLLMProvider {
  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      model: data.model
    };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

export class AnthropicProvider extends BaseLLMProvider {
  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      model: data.model
    };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

export class OllamaProvider extends BaseLLMProvider {
  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.message.content,
      model: data.model
    };
  }

  isConfigured(): boolean {
    return true; // Ollama doesn't require API key
  }
}

export class LocalCompatibleProvider extends BaseLLMProvider {
  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    const baseUrl = this.config.baseUrl || 'http://localhost:1234';
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({
        model: this.config.model || 'local-model',
        messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Local API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }

  isConfigured(): boolean {
    return !!this.config.baseUrl;
  }
}

export class LLMManager {
  private providers: Map<string, BaseLLMProvider> = new Map();

  addProvider(id: string, provider: BaseLLMProvider): void {
    this.providers.set(id, provider);
  }

  getProvider(id: string): BaseLLMProvider | undefined {
    return this.providers.get(id);
  }

  static createProvider(config: LLMConfig): BaseLLMProvider {
    switch (config.provider) {
      case LLMProvider.OPENAI:
        return new OpenAIProvider(config);
      case LLMProvider.ANTHROPIC:
        return new AnthropicProvider(config);
      case LLMProvider.OLLAMA:
        return new OllamaProvider(config);
      case LLMProvider.LOCAL_COMPATIBLE:
      case LLMProvider.LM_STUDIO:
        return new LocalCompatibleProvider(config);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  async generateCharacterResponse(
    characterId: string,
    prompt: string,
    context: string = ''
  ): Promise<LLMResponse> {
    const provider = this.providers.get(characterId);
    if (!provider) {
      throw new Error(`No provider found for character: ${characterId}`);
    }

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: (provider as any).config.systemPrompt
      },
      {
        role: 'user',
        content: `Context: ${context}\n\nPrompt: ${prompt}`
      }
    ];

    return provider.generateResponse(messages);
  }
}