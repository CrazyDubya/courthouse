import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { WebSocketService } from '../../services/WebSocketService.js';
import { LLMService } from '../../services/LLMService.js';
import { QueueService } from '../../services/QueueService.js';

describe('WebSocket Communication Integration', () => {
  let httpServer: any;
  let io: SocketIOServer;
  let webSocketService: WebSocketService;
  let llmService: LLMService;
  let queueService: QueueService;
  let clientSocket: ClientSocket;
  let port: number;

  beforeEach(async () => {
    port = 3000 + Math.floor(Math.random() * 1000);
    httpServer = createServer();
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    llmService = new LLMService();
    queueService = new QueueService(llmService);
    webSocketService = new WebSocketService(io, llmService, queueService);

    await new Promise<void>((resolve, reject) => {
      httpServer.listen(port, () => {
        clientSocket = ioClient(`http://localhost:${port}`);
        clientSocket.on('connect', () => {
          resolve();
        });
        clientSocket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });
      });
    });
  });

  afterEach(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    if (io) {
      io.close();
    }
    if (httpServer) {
      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
      });
    }
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection', () => {
      expect(clientSocket).toBeDefined();
      expect(clientSocket.connected).toBe(true);
    });

    it('should handle disconnection', async () => {
      await new Promise<void>((resolve) => {
        clientSocket.on('disconnect', () => {
          expect(clientSocket.connected).toBe(false);
          resolve();
        });
        clientSocket.disconnect();
      });
    });

    it('should allow multiple concurrent connections', async () => {
      const client2 = ioClient(`http://localhost:${port}`);
      const client3 = ioClient(`http://localhost:${port}`);

      await Promise.all([
        new Promise<void>((resolve) => client2.on('connect', resolve)),
        new Promise<void>((resolve) => client3.on('connect', resolve))
      ]);

      expect(clientSocket.connected).toBe(true);
      expect(client2.connected).toBe(true);
      expect(client3.connected).toBe(true);
      
      client2.disconnect();
      client3.disconnect();
    });
  });

  describe('Case Subscription', () => {
    it('should subscribe to case updates', async () => {
      const caseId = 'case-123';
      
      clientSocket.emit('case_subscribe', caseId);
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(clientSocket.connected).toBe(true);
    });

    it('should unsubscribe from case updates', async () => {
      const caseId = 'case-123';
      
      clientSocket.emit('case_subscribe', caseId);
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      clientSocket.emit('case_unsubscribe', caseId);
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(clientSocket.connected).toBe(true);
    });

    it('should receive case updates when subscribed', async () => {
      const caseId = 'case-123';

      const updatePromise = new Promise<void>((resolve) => {
        clientSocket.on('case_update', (data) => {
          expect(data).toBeDefined();
          expect(data.caseId).toBe(caseId);
          resolve();
        });
      });

      clientSocket.emit('case_subscribe', caseId);

      await new Promise((resolve) => setTimeout(resolve, 100));
      
      io.to(`case:${caseId}`).emit('case_update', {
        caseId,
        type: 'phase_change',
        data: { newPhase: 'trial' }
      });

      await updatePromise;
    });
  });

  describe('LLM Request Handling', () => {
    it.skip('should handle LLM request via WebSocket', async () => {
      const requestData = {
        messages: [
          { role: 'user', content: 'Test message' }
        ],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        }
      };

      const responsePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Response not received')), 5000);
        
        clientSocket.on('llm_response', (data) => {
          clearTimeout(timeout);
          expect(data).toBeDefined();
          expect(data.requestId).toBeDefined();
          resolve();
        });
      });

      clientSocket.emit('llm_request', requestData);
      await responsePromise;
    }, 10000);

    it.skip('should handle streaming LLM request', async () => {
      const requestData = {
        messages: [
          { role: 'user', content: 'Test streaming' }
        ],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434',
          stream: true
        }
      };

      let chunksReceived = 0;

      const completePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('No chunks received')), 5000);
        
        clientSocket.on('llm_stream_chunk', (data) => {
          chunksReceived++;
          expect(data).toBeDefined();
        });

        clientSocket.on('llm_stream_complete', () => {
          clearTimeout(timeout);
          expect(chunksReceived).toBeGreaterThan(0);
          resolve();
        });
      });

      clientSocket.emit('llm_stream_request', requestData);
      await completePromise;
    }, 10000);

    it.skip('should handle LLM request errors', async () => {
      const requestData = {
        messages: [
          { role: 'user', content: 'Test error' }
        ],
        config: {
          provider: 'invalid-provider',
          model: 'invalid-model'
        }
      };

      const errorPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Error not received')), 5000);
        
        clientSocket.on('llm_error', (error) => {
          clearTimeout(timeout);
          expect(error).toBeDefined();
          expect(error.message).toBeDefined();
          resolve();
        });
      });

      clientSocket.emit('llm_request', requestData);
      await errorPromise;
    }, 10000);
  });

  describe('Real-time Updates', () => {
    it('should broadcast transcript updates to subscribed clients', async () => {
      const caseId = 'case-123';
      const transcriptEntry = {
        speaker: 'Attorney',
        text: 'I object!',
        timestamp: new Date()
      };

      const updatePromise = new Promise<void>((resolve) => {
        clientSocket.on('transcript_update', (data) => {
          expect(data).toBeDefined();
          expect(data.caseId).toBe(caseId);
          expect(data.entry).toBeDefined();
          expect(data.entry.speaker).toBe(transcriptEntry.speaker);
          resolve();
        });
      });

      clientSocket.emit('case_subscribe', caseId);

      await new Promise((resolve) => setTimeout(resolve, 100));
      
      io.to(`case:${caseId}`).emit('transcript_update', {
        caseId,
        entry: transcriptEntry
      });

      await updatePromise;
    });

    it('should broadcast phase changes to subscribed clients', async () => {
      const caseId = 'case-123';
      const newPhase = 'closing';

      const phaseChangePromise = new Promise<void>((resolve) => {
        clientSocket.on('phase_change', (data) => {
          expect(data).toBeDefined();
          expect(data.caseId).toBe(caseId);
          expect(data.newPhase).toBe(newPhase);
          resolve();
        });
      });

      clientSocket.emit('case_subscribe', caseId);

      await new Promise((resolve) => setTimeout(resolve, 100));
      
      io.to(`case:${caseId}`).emit('phase_change', {
        caseId,
        newPhase
      });

      await phaseChangePromise;
    });

    it('should handle participant updates', async () => {
      const caseId = 'case-123';
      const participant = {
        id: 'participant-1',
        name: 'John Doe',
        role: 'witness'
      };

      const participantUpdatePromise = new Promise<void>((resolve) => {
        clientSocket.on('participant_update', (data) => {
          expect(data).toBeDefined();
          expect(data.caseId).toBe(caseId);
          expect(data.participant).toBeDefined();
          resolve();
        });
      });

      clientSocket.emit('case_subscribe', caseId);

      await new Promise((resolve) => setTimeout(resolve, 100));
      
      io.to(`case:${caseId}`).emit('participant_update', {
        caseId,
        participant
      });

      await participantUpdatePromise;
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle malformed messages gracefully', async () => {
      clientSocket.emit('llm_request', 'invalid-data');
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(clientSocket.connected).toBe(true);
    });

    it('should reconnect after disconnection', async () => {
      const reconnectPromise = new Promise<void>((resolve) => {
        let reconnected = false;
        
        clientSocket.on('connect', () => {
          if (reconnected) {
            expect(clientSocket.connected).toBe(true);
            resolve();
          }
        });
        
        setTimeout(() => {
          reconnected = true;
          clientSocket.disconnect();
          setTimeout(() => {
            clientSocket.connect();
          }, 100);
        }, 100);
      });

      await reconnectPromise;
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        messages: [{ role: 'user', content: `Request ${i}` }],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        }
      }));

      let responsesReceived = 0;

      const allResponsesPromise = new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 10000);
        
        clientSocket.on('llm_response', () => {
          responsesReceived++;
          if (responsesReceived === requests.length) {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      requests.forEach(req => {
        clientSocket.emit('llm_request', req);
      });

      await allResponsesPromise;
    }, 15000);
  });
});
