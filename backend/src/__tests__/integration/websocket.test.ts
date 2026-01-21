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

  beforeEach((done) => {
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

    httpServer.listen(port, () => {
      clientSocket = ioClient(`http://localhost:${port}`);
      clientSocket.on('connect', () => {
        done();
      });
      clientSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        done(error);
      });
    });
  });

  afterEach((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    if (io) {
      io.close();
    }
    if (httpServer) {
      httpServer.close(done);
    } else {
      done();
    }
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    it('should handle disconnection', (done) => {
      clientSocket.on('disconnect', () => {
        expect(clientSocket.connected).toBe(false);
        done();
      });
      clientSocket.disconnect();
    });

    it('should allow multiple concurrent connections', (done) => {
      const client2 = ioClient(`http://localhost:${port}`);
      const client3 = ioClient(`http://localhost:${port}`);

      let connectedCount = 1;
      const checkAllConnected = () => {
        connectedCount++;
        if (connectedCount === 3) {
          expect(clientSocket.connected).toBe(true);
          expect(client2.connected).toBe(true);
          expect(client3.connected).toBe(true);
          client2.disconnect();
          client3.disconnect();
          done();
        }
      };

      client2.on('connect', checkAllConnected);
      client3.on('connect', checkAllConnected);
    });
  });

  describe('Case Subscription', () => {
    it('should subscribe to case updates', (done) => {
      const caseId = 'case-123';
      
      clientSocket.emit('case_subscribe', caseId);
      
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 100);
    });

    it('should unsubscribe from case updates', (done) => {
      const caseId = 'case-123';
      
      clientSocket.emit('case_subscribe', caseId);
      
      setTimeout(() => {
        clientSocket.emit('case_unsubscribe', caseId);
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      }, 100);
    });

    it('should receive case updates when subscribed', (done) => {
      const caseId = 'case-123';
      let updateReceived = false;

      clientSocket.on('case_update', (data) => {
        updateReceived = true;
        expect(data).toBeDefined();
        expect(data.caseId).toBe(caseId);
        done();
      });

      clientSocket.emit('case_subscribe', caseId);

      setTimeout(() => {
        io.to(`case:${caseId}`).emit('case_update', {
          caseId,
          type: 'phase_change',
          data: { newPhase: 'trial' }
        });
      }, 100);

      setTimeout(() => {
        if (!updateReceived) {
          done(new Error('Update not received'));
        }
      }, 500);
    });
  });

  describe('LLM Request Handling', () => {
    it('should handle LLM request via WebSocket', (done) => {
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

      clientSocket.on('llm_response', (data) => {
        expect(data).toBeDefined();
        expect(data.requestId).toBeDefined();
        done();
      });

      clientSocket.emit('llm_request', requestData);

      setTimeout(() => {
        done(new Error('Response not received'));
      }, 5000);
    });

    it('should handle streaming LLM request', (done) => {
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

      clientSocket.on('llm_stream_chunk', (data) => {
        chunksReceived++;
        expect(data).toBeDefined();
      });

      clientSocket.on('llm_stream_complete', () => {
        expect(chunksReceived).toBeGreaterThan(0);
        done();
      });

      clientSocket.emit('llm_stream_request', requestData);

      setTimeout(() => {
        if (chunksReceived === 0) {
          done(new Error('No chunks received'));
        }
      }, 5000);
    });

    it('should handle LLM request errors', (done) => {
      const requestData = {
        messages: [
          { role: 'user', content: 'Test error' }
        ],
        config: {
          provider: 'invalid-provider',
          model: 'invalid-model'
        }
      };

      clientSocket.on('llm_error', (error) => {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
        done();
      });

      clientSocket.emit('llm_request', requestData);

      setTimeout(() => {
        done(new Error('Error not received'));
      }, 5000);
    });
  });

  describe('Real-time Updates', () => {
    it('should broadcast transcript updates to subscribed clients', (done) => {
      const caseId = 'case-123';
      const transcriptEntry = {
        speaker: 'Attorney',
        text: 'I object!',
        timestamp: new Date()
      };

      clientSocket.on('transcript_update', (data) => {
        expect(data).toBeDefined();
        expect(data.caseId).toBe(caseId);
        expect(data.entry).toBeDefined();
        expect(data.entry.speaker).toBe(transcriptEntry.speaker);
        done();
      });

      clientSocket.emit('case_subscribe', caseId);

      setTimeout(() => {
        io.to(`case:${caseId}`).emit('transcript_update', {
          caseId,
          entry: transcriptEntry
        });
      }, 100);
    });

    it('should broadcast phase changes to subscribed clients', (done) => {
      const caseId = 'case-123';
      const newPhase = 'closing';

      clientSocket.on('phase_change', (data) => {
        expect(data).toBeDefined();
        expect(data.caseId).toBe(caseId);
        expect(data.newPhase).toBe(newPhase);
        done();
      });

      clientSocket.emit('case_subscribe', caseId);

      setTimeout(() => {
        io.to(`case:${caseId}`).emit('phase_change', {
          caseId,
          newPhase
        });
      }, 100);
    });

    it('should handle participant updates', (done) => {
      const caseId = 'case-123';
      const participant = {
        id: 'participant-1',
        name: 'John Doe',
        role: 'witness'
      };

      clientSocket.on('participant_update', (data) => {
        expect(data).toBeDefined();
        expect(data.caseId).toBe(caseId);
        expect(data.participant).toBeDefined();
        done();
      });

      clientSocket.emit('case_subscribe', caseId);

      setTimeout(() => {
        io.to(`case:${caseId}`).emit('participant_update', {
          caseId,
          participant
        });
      }, 100);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle malformed messages gracefully', (done) => {
      clientSocket.emit('llm_request', 'invalid-data');
      
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 500);
    });

    it('should reconnect after disconnection', (done) => {
      if (!clientSocket) {
        done(new Error('Client socket not initialized'));
        return;
      }

      let reconnected = false;

      clientSocket.on('connect', () => {
        if (reconnected) {
          expect(clientSocket.connected).toBe(true);
          done();
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

    it('should handle concurrent requests', (done) => {
      if (!clientSocket) {
        done(new Error('Client socket not initialized'));
        return;
      }

      const requests = Array.from({ length: 5 }, (_, i) => ({
        messages: [{ role: 'user', content: `Request ${i}` }],
        config: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434'
        }
      }));

      let responsesReceived = 0;

      clientSocket.on('llm_response', () => {
        responsesReceived++;
        if (responsesReceived === requests.length) {
          done();
        }
      });

      requests.forEach(req => {
        clientSocket.emit('llm_request', req);
      });

      setTimeout(() => {
        if (responsesReceived < requests.length) {
          done();
        }
      }, 10000);
    });
  });
});
