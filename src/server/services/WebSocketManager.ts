import { WebSocketServer, WebSocket } from 'ws';
import { WSMessage } from '../shared/types/index.js';

export class WebSocketManager {
  private wss: WebSocketServer;
  private connections: Set<WebSocket> = new Set();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      this.connections.add(ws);

      ws.on('message', (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.connections.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.connections.delete(ws);
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connection:established',
        payload: { message: 'Connected to Courthouse Simulator' },
        timestamp: new Date()
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WSMessage): void {
    console.log('Received WebSocket message:', message.type);
    
    switch (message.type) {
      case 'ping':
        this.sendToClient(ws, {
          type: 'pong',
          payload: {},
          timestamp: new Date()
        });
        break;
      
      case 'simulation:subscribe':
        // Client wants to subscribe to simulation updates
        // This could be used to manage subscriptions per case
        break;
        
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  public sendToClient(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }

  public broadcast(message: WSMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error('Error broadcasting WebSocket message:', error);
          this.connections.delete(ws);
        }
      }
    });
  }

  public broadcastToCase(_caseId: string, message: WSMessage): void {
    // For now, broadcast to all connections
    // In a production app, you'd track which connections are subscribed to which cases
    this.broadcast(message);
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }
}