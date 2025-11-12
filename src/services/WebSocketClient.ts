import { io, Socket } from 'socket.io-client';
import { LLMProvider } from '../types';

export interface LLMRequest {
  id: string;
  provider: LLMProvider;
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
  context?: any;
}

export interface LLMResponse {
  id: string;
  content: string;
  error?: string;
  metadata?: {
    model: string;
    provider: string;
    tokens?: number;
    duration?: number;
  };
}

export interface QueueStatus {
  position: number;
  total: number;
  estimatedWait?: number;
}

export interface ServerStatus {
  status: string;
  services: {
    llm: any;
    queue: any;
    sessions: any;
    ollama: any;
    circuitBreakers: any;
  };
  uptime: number;
  timestamp: string;
}

type EventCallback = (...args: any[]) => void;

export class WebSocketClient {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnecting: boolean = false;
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map();
  private pendingRequests: Map<string, (response: LLMResponse) => void> = new Map();
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected to backend');
          this.connected = true;
          this.reconnecting = false;
          this.emit('connected');
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('❌ WebSocket disconnected:', reason);
          this.connected = false;
          this.emit('disconnected', reason);
        });

        this.socket.on('reconnecting', (attemptNumber) => {
          console.log(`🔄 WebSocket reconnecting (attempt ${attemptNumber})...`);
          this.reconnecting = true;
          this.emit('reconnecting', attemptNumber);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ WebSocket reconnection failed');
          this.reconnecting = false;
          this.emit('reconnect_failed');
          reject(new Error('Failed to connect to backend server'));
        });

        this.socket.on('error', (error) => {
          console.error('❌ WebSocket error:', error);
          this.emit('error', error);
        });

        // LLM Response handlers
        this.socket.on('llm:response', (response: LLMResponse) => {
          const callback = this.pendingRequests.get(response.id);
          if (callback) {
            callback(response);
            this.pendingRequests.delete(response.id);
          }
          this.emit('llm:response', response);
        });

        this.socket.on('llm:streaming', (data: { id: string; chunk: string }) => {
          this.emit('llm:streaming', data);
        });

        this.socket.on('llm:error', (error: { id: string; error: string }) => {
          const callback = this.pendingRequests.get(error.id);
          if (callback) {
            callback({ id: error.id, content: '', error: error.error });
            this.pendingRequests.delete(error.id);
          }
          this.emit('llm:error', error);
        });

        this.socket.on('queue:status', (status: QueueStatus) => {
          this.emit('queue:status', status);
        });

        this.socket.on('queue:processing', (data: { id: string; status: string }) => {
          this.emit('queue:processing', data);
        });

        // Set a timeout for initial connection
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('👋 WebSocket disconnected from backend');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  isReconnecting(): boolean {
    return this.reconnecting;
  }

  // Send LLM request and get response
  async sendLLMRequest(request: LLMRequest): Promise<LLMResponse> {
    if (!this.connected || !this.socket) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error('LLM request timeout'));
      }, 120000); // 2 minute timeout

      this.pendingRequests.set(request.id, (response) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });

      this.socket!.emit('llm:request', request);
    });
  }

  // Subscribe to case updates
  subscribeToCaseUpdates(caseId: string): void {
    if (this.socket) {
      this.socket.emit('case:subscribe', caseId);
      console.log(`📡 Subscribed to case updates: ${caseId}`);
    }
  }

  unsubscribeFromCaseUpdates(caseId: string): void {
    if (this.socket) {
      this.socket.emit('case:unsubscribe', caseId);
      console.log(`📡 Unsubscribed from case updates: ${caseId}`);
    }
  }

  // Get server status
  async getServerStatus(): Promise<ServerStatus> {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Status request timeout'));
      }, 5000);

      this.socket!.emit('status:request', {}, (response: ServerStatus) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  // Event system for custom events
  on(event: string, callback: EventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }
}

// Singleton instance
let instance: WebSocketClient | null = null;

export function getWebSocketClient(serverUrl?: string): WebSocketClient {
  if (!instance) {
    instance = new WebSocketClient(serverUrl);
  }
  return instance;
}

export function resetWebSocketClient(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
