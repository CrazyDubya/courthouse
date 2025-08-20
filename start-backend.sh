#!/bin/bash

echo "🏛️  Starting Courthouse Simulator Backend"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create uploads directory
mkdir -p uploads/evidence

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ Please edit backend/.env with your configuration before starting the server."
    echo "   At minimum, configure your LLM providers (Ollama recommended for local development)."
    exit 0
fi

# Start the server
echo "🚀 Starting backend server..."
echo "   Backend API: http://localhost:3001"
echo "   Health check: http://localhost:3001/api/health"
echo "   Status: http://localhost:3001/api/status"
echo ""
echo "💡 Recommended setup for best performance:"
echo "   1. Run multiple Ollama instances:"
echo "      Terminal 1: ollama serve --port 11434"
echo "      Terminal 2: ollama serve --port 11435"
echo "      Terminal 3: ollama serve --port 11436"
echo ""
echo "   2. Pull models on each instance:"
echo "      ollama pull llama3:latest"
echo "      ollama pull mistral:7b"
echo "      ollama pull gemma2:9b"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

npm run dev