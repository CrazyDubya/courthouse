import { io } from 'socket.io-client';

// Example client showing how to connect to the backend WebSocket API

const socket = io('http://localhost:3001', {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

socket.on('connect', () => {
  console.log('Connected to backend server:', socket.id);
  
  // Example: Subscribe to a case
  socket.emit('case_subscribe', 'case-123');
  
  // Example: Send an LLM request
  const llmRequest = {
    messages: [
      { role: 'system', content: 'You are a judge in a courtroom.' },
      { role: 'user', content: 'Please make an opening statement for this trial.' }
    ],
    config: {
      provider: 'ollama',
      model: 'llama3:latest',
      temperature: 0.7,
      maxTokens: 500
    },
    priority: 1,
    sessionId: 'session-123'
  };
  
  socket.emit('llm_request', llmRequest);
});

socket.on('llm_queued', (data) => {
  console.log('Request queued:', data);
});

socket.on('llm_response', (data) => {
  console.log('LLM Response:', data.result.content);
});

socket.on('llm_error', (data) => {
  console.error('LLM Error:', data.error);
});

socket.on('status_update', (data) => {
  console.log('Status update:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Example REST API calls
async function createCase() {
  const response = await fetch('http://localhost:3001/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Example vs. Defendant',
      type: 'civil',
      summary: 'A sample civil case for demonstration',
      participants: [
        {
          name: 'Judge Smith',
          role: 'judge',
          aiControlled: true,
          llmConfig: {
            provider: 'ollama',
            model: 'llama3:latest',
            temperature: 0.8
          }
        },
        {
          name: 'Attorney Johnson',
          role: 'plaintiff-attorney',
          aiControlled: true,
          llmConfig: {
            provider: 'ollama',
            model: 'mistral:7b',
            temperature: 0.7
          }
        }
      ],
      settings: {
        realtimeSpeed: 1.0,
        autoProgress: false,
        jurySize: 12,
        enableObjections: true,
        complexityLevel: 'intermediate'
      }
    })
  });
  
  const caseData = await response.json();
  console.log('Case created:', caseData);
  return caseData;
}

async function checkServerStatus() {
  const response = await fetch('http://localhost:3001/api/status');
  const status = await response.json();
  console.log('Server status:', status);
}

// Run examples
setTimeout(async () => {
  await checkServerStatus();
  await createCase();
}, 1000);