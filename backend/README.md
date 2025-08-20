# Courthouse Simulator Backend API

A high-performance backend server for the LLM-powered courthouse simulator with WebSocket support, real-time processing, and advanced queue management.

## Features

- 🚀 **Express.js with TypeScript** - Modern, type-safe server architecture
- 📡 **WebSocket Support** - Real-time communication via Socket.IO
- 🤖 **Multi-Provider LLM Integration** - Support for OpenAI, Anthropic, Ollama, Groq, and OpenRouter
- ⚡ **Request Queue Management** - Asynchronous LLM processing with retry logic
- 🎯 **Ollama Connection Pooling** - Load balancing across multiple Ollama instances
- 📁 **File Upload & Storage** - Evidence management with chain of custody
- 🔄 **Session Management** - Persistent courtroom simulation state
- 🛡️ **Error Handling & Resilience** - Circuit breakers and exponential backoff
- 📊 **Health Monitoring** - Comprehensive status endpoints and metrics

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- At least one LLM provider configured (Ollama recommended for local development)
- Optional: Redis for production queue persistence

### Installation

```bash
cd backend
npm install
cp .env.example .env
```

### Environment Configuration

Edit `.env` with your settings:

```env
PORT=3001
NODE_ENV=development

# LLM Provider API Keys (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENROUTER_API_KEY=your_openrouter_key
GROQ_API_KEY=your_groq_key

# Ollama Configuration (recommended)
OLLAMA_HOST=http://localhost:11434
OLLAMA_SECONDARY_HOST=http://localhost:11435
OLLAMA_TERTIARY_HOST=http://localhost:11436

# Security & CORS
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secure-jwt-secret

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Running the Server

```bash
# Development with auto-reload
npm run dev

# Production build and start
npm run build
npm start
```

## Multi-Ollama Setup (Recommended)

For optimal performance with multiple model variants, run Ollama on different ports:

```bash
# Terminal 1 - Primary instance
ollama serve --port 11434

# Terminal 2 - Secondary instance  
ollama serve --port 11435

# Terminal 3 - Tertiary instance
ollama serve --port 11436
```

Pull models on each instance:
```bash
# On each port, pull your preferred models
ollama pull llama3:latest
ollama pull mistral:7b
ollama pull gemma2:9b
```

The backend automatically distributes different participant models across instances for better performance.

## API Endpoints

### Health & Status
- `GET /api/health` - Basic health check
- `GET /api/status` - Comprehensive service status

### Case Management
- `GET /api/cases` - List all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case
- `POST /api/cases/:id/participants` - Add participant
- `GET /api/cases/:id/transcript` - Get transcript

### LLM Processing
- `POST /api/llm/request` - Queue LLM request
- `GET /api/llm/request/:id/status` - Check request status
- `POST /api/llm/request/:id/cancel` - Cancel request
- `GET /api/llm/providers` - List provider status
- `GET /api/llm/queue/stats` - Queue statistics

### Evidence Management
- `GET /api/evidence` - List evidence
- `POST /api/evidence` - Upload evidence files
- `GET /api/evidence/:id` - Get evidence details
- `GET /api/evidence/:id/file` - Download evidence file
- `POST /api/evidence/:id/chain-of-custody` - Add custody entry

## WebSocket Events

### Client → Server
- `llm_request` - Submit LLM generation request
- `llm_stream_request` - Request streaming response
- `case_subscribe` - Subscribe to case updates
- `case_unsubscribe` - Unsubscribe from case

### Server → Client
- `llm_queued` - Request added to queue
- `llm_response` - Request completed
- `llm_stream` - Streaming response chunk
- `llm_error` - Request failed
- `status_update` - Service status change

## Architecture Overview

### Request Flow
1. **Frontend** sends LLM request via WebSocket or REST API
2. **Queue Service** validates and queues the request
3. **LLM Service** selects appropriate provider/instance
4. **Ollama Pool** (if using Ollama) load-balances across instances
5. **Response** streamed back via WebSocket or returned via API

### Key Components

- **QueueService**: Manages request prioritization and processing
- **LLMService**: Handles multiple LLM provider integrations
- **OllamaPoolService**: Load balances across Ollama instances
- **SessionService**: Maintains courtroom simulation state
- **WebSocketService**: Real-time client communication
- **RetryService**: Implements resilience patterns

### Error Handling

- **Circuit Breakers**: Prevent cascading failures
- **Exponential Backoff**: Smart retry timing
- **Request Timeouts**: Prevent hanging requests
- **Health Checks**: Monitor service availability

## Production Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
REDIS_URL=redis://your-redis-host:6379
CORS_ORIGIN=https://your-frontend-domain.com
```

### Monitoring

The backend provides detailed metrics at `/api/status`:

- Queue statistics (pending, active, completed, failed)
- LLM provider health status
- Ollama instance status and load
- Circuit breaker states
- Session statistics
- System uptime and performance

### Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Input Validation**: Joi schema validation
- **File Upload Security**: Type and size restrictions
- **Error Sanitization**: No sensitive data in responses

## Development

### Project Structure

```
backend/
├── src/
│   ├── middleware/     # Error handling, validation
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Main server file
├── uploads/            # File storage directory
└── dist/               # Compiled JavaScript
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Linting & Formatting

```bash
npm run lint          # Check code style
npm run lint:fix      # Auto-fix issues
```

## Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   - Verify Ollama is running: `curl http://localhost:11434/api/tags`
   - Check firewall settings
   - Ensure correct host/port in environment

2. **Queue Processing Slow**
   - Check `/api/status` for bottlenecks
   - Verify LLM provider API keys
   - Consider adding more Ollama instances

3. **WebSocket Connection Issues**
   - Verify CORS settings
   - Check client-side Socket.IO configuration
   - Monitor network connectivity

4. **File Upload Errors**
   - Check MAX_FILE_SIZE setting
   - Verify UPLOAD_PATH directory permissions
   - Review allowed file types in routes/evidence.ts

### Performance Optimization

- **Ollama**: Use multiple instances for better throughput
- **Queue**: Adjust maxConcurrent based on hardware
- **Circuit Breakers**: Fine-tune thresholds for your use case
- **Caching**: Implement Redis for production queue persistence

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes with tests
4. Run linting: `npm run lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

For more information, check the main project README or open an issue on GitHub.