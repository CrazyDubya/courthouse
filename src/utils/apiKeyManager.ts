import { LLMProvider } from '../types';

const API_KEY_STORAGE_PREFIX = 'llm_api_key_';

export class APIKeyManager {
  private static instance: APIKeyManager;
  private keys: Map<LLMProvider, string>;

  private constructor() {
    this.keys = new Map();
    this.loadKeys();
  }

  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  private loadKeys(): void {
    const providers: LLMProvider[] = [
      'openai', 'anthropic', 'ollama', 'lmstudio', 
      'openrouter', 'grok', 'groq', 'local'
    ];

    providers.forEach(provider => {
      const stored = this.getSecureStorage(provider);
      if (stored) {
        this.keys.set(provider, stored);
      }
    });
  }

  setKey(provider: LLMProvider, key: string): void {
    this.keys.set(provider, key);
    this.setSecureStorage(provider, key);
  }

  getKey(provider: LLMProvider): string | undefined {
    return this.keys.get(provider);
  }

  removeKey(provider: LLMProvider): void {
    this.keys.delete(provider);
    this.removeSecureStorage(provider);
  }

  hasKey(provider: LLMProvider): boolean {
    return this.keys.has(provider);
  }

  private getSecureStorage(provider: LLMProvider): string | null {
    try {
      const encrypted = localStorage.getItem(`${API_KEY_STORAGE_PREFIX}${provider}`);
      if (encrypted) {
        return this.decrypt(encrypted);
      }
    } catch (error) {
      console.error(`Failed to retrieve key for ${provider}:`, error);
    }
    return null;
  }

  private setSecureStorage(provider: LLMProvider, value: string): void {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(`${API_KEY_STORAGE_PREFIX}${provider}`, encrypted);
    } catch (error) {
      console.error(`Failed to store key for ${provider}:`, error);
    }
  }

  private removeSecureStorage(provider: LLMProvider): void {
    localStorage.removeItem(`${API_KEY_STORAGE_PREFIX}${provider}`);
  }

  private encrypt(text: string): string {
    // Simple Base64 encoding for demo - in production use proper encryption
    // Consider using Web Crypto API or a library like crypto-js
    return btoa(text);
  }

  private decrypt(text: string): string {
    // Simple Base64 decoding for demo - in production use proper decryption
    return atob(text);
  }

  getEndpoint(provider: LLMProvider): string {
    const endpoints: Record<LLMProvider, string> = {
      'openai': 'https://api.openai.com/v1',
      'anthropic': 'https://api.anthropic.com/v1',
      'ollama': 'http://localhost:11434',
      'lmstudio': 'http://localhost:1234/v1',
      'openrouter': 'https://openrouter.ai/api/v1',
      'grok': 'https://api.x.ai/v1',
      'groq': 'https://api.groq.com/openai/v1',
      'local': 'http://localhost:8080',
    };
    return endpoints[provider];
  }

  getDefaultModel(provider: LLMProvider): string {
    const models: Record<LLMProvider, string> = {
      'openai': 'gpt-4-turbo-preview',
      'anthropic': 'claude-3-opus-20240229',
      'ollama': 'llama2',
      'lmstudio': 'local-model',
      'openrouter': 'openai/gpt-4-turbo-preview',
      'grok': 'grok-1',
      'groq': 'mixtral-8x7b-32768',
      'local': 'local-model',
    };
    return models[provider];
  }

  validateProvider(provider: LLMProvider): boolean {
    const hasKey = this.hasKey(provider);
    const localProviders: LLMProvider[] = ['ollama', 'lmstudio', 'local'];
    
    if (localProviders.includes(provider)) {
      return true;
    }
    
    return hasKey;
  }
}