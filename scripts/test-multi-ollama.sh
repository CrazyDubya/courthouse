#!/bin/bash

echo "🧪 Testing Multi-Ollama Setup"
echo "=============================="
echo ""

# Test each port
PORTS=(11434 11435 11436 11437 11438)
MODELS=("llama3:latest" "mistral:7b" "gemma2:9b" "llama3.2:3b" "qwen2.5:3b")

echo "🔍 Testing Ollama instance connectivity..."
failed_tests=0
for i in "${!PORTS[@]}"; do
    port=${PORTS[i]}
    model=${MODELS[i]}
    
    echo -n "   Port $port ($model): "
    
    # Test basic connectivity
    if curl -s -m 5 http://localhost:$port/api/tags > /dev/null 2>&1; then
        echo -n "✅ Connected"
        
        # Test model generation (quick test)
        response=$(curl -s -m 10 -X POST http://localhost:$port/api/generate \
                       -d "{\"model\": \"$model\", \"prompt\": \"Hello\", \"stream\": false}" \
                       2>/dev/null)
        
        if [[ $? -eq 0 && $response == *"response"* ]]; then
            echo " 🎯 Model responding"
        else
            echo " ⚠️  Model not responding"
            ((failed_tests++))
        fi
    else
        echo "❌ Connection failed"
        ((failed_tests++))
    fi
done

echo ""
if [ $failed_tests -eq 0 ]; then
    echo "🎉 All tests passed! Multi-Ollama setup is working correctly."
    echo ""
    echo "📊 Performance benchmark (simple test):"
    
    # Performance test
    for i in "${!PORTS[@]}"; do
        port=${PORTS[i]}
        model=${MODELS[i]}
        
        echo -n "   $model: "
        start_time=$(date +%s%3N)
        curl -s -X POST http://localhost:$port/api/generate \
             -d '{"model": "'$model'", "prompt": "The quick brown fox", "stream": false}' \
             > /dev/null 2>&1
        end_time=$(date +%s%3N)
        
        if [ $? -eq 0 ]; then
            response_time=$((end_time - start_time))
            echo "${response_time}ms"
        else
            echo "Failed"
        fi
    done
    
    echo ""
    echo "💡 Next steps:"
    echo "   1. Start your courtroom simulator: npm run dev"
    echo "   2. Click '🤖 Manage AI Models' to configure role assignments"
    echo "   3. Run a full courtroom simulation to test all models"
    
else
    echo "❌ $failed_tests test(s) failed."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Ensure all Ollama instances are running"
    echo "   - Check that models are downloaded: ollama list"
    echo "   - Verify no port conflicts: lsof -i :11434-11438"
    echo "   - Run setup script again: ./scripts/setup-multi-ollama.sh"
fi

echo ""
echo "📋 Quick reference:"
echo "   Judge (llama3:latest):     http://localhost:11434"
echo "   Attorneys (mistral:7b):    http://localhost:11435" 
echo "   Witnesses (gemma2:9b):     http://localhost:11436"
echo "   Jury (llama3.2:3b):        http://localhost:11437"
echo "   Staff (qwen2.5:3b):        http://localhost:11438"