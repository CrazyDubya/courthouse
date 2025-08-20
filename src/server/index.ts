import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

import caseRoutes from './routes/cases.js';
import simulationRoutes from './routes/simulation.js';
import llmRoutes from './routes/llm.js';
import { WebSocketManager } from './services/WebSocketManager.js';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Server {
  private app: express.Application;
  private server: any;
  private wss!: WebSocketServer;
  private wsManager!: WebSocketManager;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupServer();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/cases', caseRoutes);
    this.app.use('/api/simulation', simulationRoutes);
    this.app.use('/api/llm', llmRoutes);

    // Health check
    this.app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Serve static files from client build
    const clientPath = path.join(__dirname, '../client');
    this.app.use(express.static(clientPath));

    // Serve index.html for all other routes (SPA)
    this.app.get('*', (_req, res) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });

    // Error handling
    this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  private setupServer(): void {
    this.server = createServer(this.app);
    
    // WebSocket setup
    this.wss = new WebSocketServer({ 
      server: this.server,
      path: '/ws'
    });

    this.wsManager = new WebSocketManager(this.wss);
  }

  public start(): void {
    const port = process.env.PORT || 3001;
    
    this.server.listen(port, () => {
      console.log(`🏛️  Courthouse Simulator Server running on port ${port}`);
      console.log(`📊 API available at http://localhost:${port}/api`);
      console.log(`🌐 WebSocket available at ws://localhost:${port}/ws`);
      console.log(`🎯 Frontend available at http://localhost:3000`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      this.server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      this.server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  }

  public getWebSocketManager(): WebSocketManager {
    return this.wsManager;
  }
}

// Start the server
const server = new Server();
server.start();

export default server;