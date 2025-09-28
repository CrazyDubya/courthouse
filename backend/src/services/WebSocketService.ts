import { Server as SocketIOServer, Socket } from 'socket.io';
import { LLMService } from './LLMService.js';
import { QueueService } from './QueueService.js';
import { WebSocketMessage, LLMRequest } from '../types/index.js';

export class WebSocketService {
  private io: SocketIOServer;
  private llmService: LLMService;
  private queueService: QueueService;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(io: SocketIOServer, llmService: LLMService, queueService: QueueService) {
    this.io = io;
    this.llmService = llmService;
    this.queueService = queueService;
    this.setupSocketHandlers();
    this.setupQueueEventHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      socket.on('llm_request', async (data) => {
        await this.handleLLMRequest(socket, data);
      });

      socket.on('llm_stream_request', async (data) => {
        await this.handleStreamingLLMRequest(socket, data);
      });

      socket.on('case_subscribe', (caseId: string) => {
        socket.join(`case:${caseId}`);
        console.log(`Client ${socket.id} subscribed to case ${caseId}`);
      });

      socket.on('case_unsubscribe', (caseId: string) => {
        socket.leave(`case:${caseId}`);
        console.log(`Client ${socket.id} unsubscribed from case ${caseId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  private setupQueueEventHandlers(): void {
    this.queueService.on('job_started', (requestId: string) => {
      this.broadcast('status_update', {
        requestId,
        status: 'processing',
        timestamp: new Date().toISOString()
      });
    });

    this.queueService.on('job_progress', (requestId: string, progress: number) => {
      this.broadcast('llm_progress', {
        requestId,
        progress,
        timestamp: new Date().toISOString()
      });
    });

    this.queueService.on('job_completed', (requestId: string, result: any) => {
      this.broadcast('llm_response', {
        requestId,
        result,
        timestamp: new Date().toISOString()
      });
    });

    this.queueService.on('job_failed', (requestId: string, error: string) => {
      this.broadcast('llm_error', {
        requestId,
        error,
        timestamp: new Date().toISOString()
      });
    });
  }

  private async handleLLMRequest(socket: Socket, data: any): Promise<void> {
    try {
      const { messages, config, priority = 0, sessionId } = data;
      
      if (!messages || !config) {
        socket.emit('llm_error', { error: 'Invalid request: missing messages or config' });
        return;
      }

      const request: LLMRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messages,
        config,
        priority,
        userId: socket.id,
        sessionId,
        timestamp: new Date(),
        status: 'pending'
      };

      await this.queueService.addLLMRequest(request);

      socket.emit('llm_queued', {
        requestId: request.id,
        position: await this.queueService.getQueuePosition(request.id),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling LLM request:', error);
      socket.emit('llm_error', { 
        error: error instanceof Error ? error.message : 'Failed to process LLM request' 
      });
    }
  }

  private async handleStreamingLLMRequest(socket: Socket, data: any): Promise<void> {
    try {
      const { messages, config, sessionId } = data;
      
      if (!messages || !config) {
        socket.emit('llm_error', { error: 'Invalid request: missing messages or config' });
        return;
      }

      const requestId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      socket.emit('llm_stream_start', {
        requestId,
        timestamp: new Date().toISOString()
      });

      const provider = this.llmService.createProvider(config);
      
      if (config.provider === 'ollama') {
        await this.streamOllamaResponse(socket, requestId, provider, messages);
      } else {
        const response = await provider.generateResponse(messages);
        
        socket.emit('llm_stream', {
          requestId,
          content: response.content,
          usage: response.usage,
          timestamp: new Date().toISOString()
        });

        socket.emit('llm_stream_end', {
          requestId,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error handling streaming LLM request:', error);
      socket.emit('llm_error', { 
        requestId: data.requestId || 'unknown',
        error: error instanceof Error ? error.message : 'Failed to process streaming LLM request' 
      });
    }
  }

  private async streamOllamaResponse(socket: Socket, requestId: string, provider: any, messages: any[]): Promise<void> {
    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\\n');
      
      const stream = await provider.client.generate({
        model: provider.config.model || 'llama2',
        prompt: prompt,
        stream: true,
        options: {
          temperature: provider.config.temperature || 0.7,
          num_predict: provider.config.maxTokens || 1000,
        },
      });

      let fullContent = '';

      for await (const chunk of stream) {
        if (chunk.response) {
          fullContent += chunk.response;
          socket.emit('llm_stream', {
            requestId,
            chunk: chunk.response,
            content: fullContent,
            done: chunk.done || false,
            timestamp: new Date().toISOString()
          });
        }

        if (chunk.done) {
          break;
        }
      }

      socket.emit('llm_stream_end', {
        requestId,
        finalContent: fullContent,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      socket.emit('llm_error', {
        requestId,
        error: error instanceof Error ? error.message : 'Streaming failed'
      });
    }
  }

  public broadcast(eventType: string, data: any): void {
    this.io.emit(eventType, data);
  }

  public broadcastToCase(caseId: string, eventType: string, data: any): void {
    this.io.to(`case:${caseId}`).emit(eventType, data);
  }

  public sendToClient(socketId: string, eventType: string, data: any): void {
    const socket = this.connectedClients.get(socketId);
    if (socket) {
      socket.emit(eventType, data);
    }
  }

  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  public getClientsInRoom(room: string): number {
    return this.io.sockets.adapter.rooms.get(room)?.size || 0;
  }
}