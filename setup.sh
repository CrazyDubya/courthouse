#!/bin/bash

echo "🏛️  Setting up Courthouse Simulator..."

# Create necessary directories
mkdir -p dist/client dist/server

# Copy HTML file
cp src/client/index.html dist/client/

echo "✅ Basic setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your LLM provider (OpenAI, Anthropic, Ollama, etc.)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Click 'New Case' to create your first courtroom simulation"
echo ""
echo "🔧 For production deployment:"
echo "1. Fix TypeScript compilation issues in the codebase"
echo "2. Run 'npm run build' to create production build"
echo "3. Run 'npm run serve' to start production server"
echo ""
echo "📚 See README.md for complete documentation and examples"