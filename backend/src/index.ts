import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { LLMService } from './services/LLMService.js';
import { CaseService } from './services/CaseService.js';
import { WebSocketService } from './services/WebSocketService.js';
import { QueueService } from './services/QueueService.js';
import { SessionService } from './services/SessionService.js';
import { OllamaPoolService } from './services/OllamaPoolService.js';

import caseRoutes from './routes/cases.js';
import llmRoutes from './routes/llm.js';
import evidenceRoutes from './routes/evidence.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { retryService } from './utils/retryLogic.js';

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const llmService = new LLMService();
const caseService = new CaseService();
const sessionService = new SessionService();
const ollamaPoolService = new OllamaPoolService();
const queueService = new QueueService();
queueService.setLLMService(llmService);
const wsService = new WebSocketService(io, llmService, queueService);

app.use('/api/cases', caseRoutes(caseService));
app.use('/api/llm', llmRoutes(llmService, queueService));
app.use('/api/evidence', evidenceRoutes());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', async (req, res) => {
  try {
    const llmStatus = await llmService.getProviderStatus();
    const queueStats = await queueService.getQueueStats();
    const sessionStats = await sessionService.getSessionStats();
    const ollamaStatus = ollamaPoolService.getInstanceStatus();
    const circuitBreakers = retryService.getAllCircuitBreakers();
    
    res.json({
      status: 'ok',
      services: {
        llm: llmStatus,
        queue: queueStats,
        sessions: sessionStats,
        ollama: ollamaStatus,
        circuitBreakers
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🤖 LLM providers initialized`);
  console.log(`⚡ Queue service started`);
  console.log(`🔄 Session management enabled`);
  console.log(`🎯 Ollama connection pooling active`);
  console.log(`🛡️  Error handling and retry logic enabled`);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  try {
    await queueService.shutdown();
    ollamaPoolService.shutdown();
    server.close();
    console.log('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  
  try {
    await queueService.shutdown();
    ollamaPoolService.shutdown();
    server.close();
    console.log('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});