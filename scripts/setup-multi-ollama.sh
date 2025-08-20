#!/bin/bash

echo "🚀 Terragon Multi-Ollama Setup Script"
echo "====================================="
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first:"
    echo "   Visit https://ollama.ai or run: curl -fsSL https://ollama.ai/install.sh | sh"
    exit 1
fi

echo "✅ Ollama found"

# Check system resources
echo "📊 Checking system resources..."
TOTAL_RAM=$(free -g | awk 'NR==2{printf "%.0f", $2}')
echo "   RAM: ${TOTAL_RAM}GB"

if [ $TOTAL_RAM -lt 16 ]; then
    echo "⚠️  Warning: Less than 16GB RAM detected. Multi-model setup may be resource intensive."
fi

# Models to download and their recommended RAM usage
declare -A MODELS=(
    ["llama3:latest"]="8GB"
    ["mistral:7b"]="5GB"  
    ["gemma2:9b"]="6GB"
    ["llama3.2:3b"]="3GB"
    ["qwen2.5:3b"]="3GB"
    ["smollm2:1.7b"]="2GB"
)

echo ""
echo "📦 Models to be downloaded:"
for model in "${!MODELS[@]}"; do
    echo "   - $model (${MODELS[$model]} RAM)"
done

echo ""
read -p "Continue with model downloads? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

# Function to check if model exists
model_exists() {
    ollama list | grep -q "^$1"
}

# Download models
echo ""
echo "⬇️  Downloading models..."
for model in "${!MODELS[@]}"; do
    if model_exists "$model"; then
        echo "✅ $model already exists"
    else
        echo "📥 Downloading $model..."
        ollama pull "$model"
        if [ $? -eq 0 ]; then
            echo "✅ $model downloaded successfully"
        else
            echo "❌ Failed to download $model"
        fi
    fi
done

echo ""
echo "🔧 Setting up multiple Ollama instances..."

# Create systemd services for multiple instances (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Creating systemd services for multiple Ollama instances..."
    
    # Primary instance (11434) - usually already running
    if pgrep -f "ollama serve" > /dev/null; then
        echo "✅ Primary Ollama instance (port 11434) already running"
    else
        echo "🔄 Starting primary Ollama instance on port 11434..."
        ollama serve &
        sleep 5
    fi
    
    # Secondary instances
    PORTS=(11435 11436 11437 11438)
    for port in "${PORTS[@]}"; do
        if lsof -i:$port > /dev/null 2>&1; then
            echo "✅ Port $port already in use (likely Ollama instance)"
        else
            echo "🔄 Starting Ollama instance on port $port..."
            OLLAMA_HOST="0.0.0.0:$port" ollama serve > /dev/null 2>&1 &
            sleep 2
        fi
    done

# macOS setup
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macOS detected. Creating launchd plists..."
    
    # Create LaunchAgents directory if it doesn't exist
    mkdir -p ~/Library/LaunchAgents
    
    # Secondary instances for macOS
    PORTS=(11435 11436 11437 11438)
    for port in "${PORTS[@]}"; do
        if lsof -i:$port > /dev/null 2>&1; then
            echo "✅ Port $port already in use"
        else
            echo "🔄 Creating launchd service for port $port..."
            cat > ~/Library/LaunchAgents/com.ollama.server.$port.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ollama.server.$port</string>
    <key>ProgramArguments</key>
    <array>
        <string>ollama</string>
        <string>serve</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>OLLAMA_HOST</key>
        <string>0.0.0.0:$port</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF
            launchctl load ~/Library/LaunchAgents/com.ollama.server.$port.plist
            echo "✅ Started Ollama service on port $port"
        fi
    done
fi

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Test connections
echo ""
echo "🔍 Testing Ollama instances..."
PORTS=(11434 11435 11436 11437 11438)
for port in "${PORTS[@]}"; do
    if curl -s http://localhost:$port/api/tags > /dev/null 2>&1; then
        echo "✅ Port $port: Ollama instance healthy"
    else
        echo "❌ Port $port: Ollama instance not responding"
    fi
done

# Load models into specific instances (distribute the load)
echo ""
echo "🎯 Pre-loading models to reduce latency..."

# Function to preload model on specific port
preload_model() {
    local port=$1
    local model=$2
    echo "🔄 Pre-loading $model on port $port..."
    curl -s -X POST http://localhost:$port/api/generate \
         -d "{\"model\": \"$model\", \"prompt\": \"test\", \"stream\": false}" \
         > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ $model loaded on port $port"
    else
        echo "⚠️  Failed to pre-load $model on port $port"
    fi
}

# Pre-load models according to our strategy
preload_model 11434 "llama3:latest"     # Judge
preload_model 11435 "mistral:7b"        # Attorneys  
preload_model 11436 "gemma2:9b"         # Witnesses
preload_model 11437 "llama3.2:3b"       # Jury
preload_model 11438 "qwen2.5:3b"        # Court staff

echo ""
echo "🎉 Multi-Ollama setup complete!"
echo ""
echo "📋 Instance Summary:"
echo "   Port 11434: llama3:latest (Judge)"
echo "   Port 11435: mistral:7b (Attorneys)"  
echo "   Port 11436: gemma2:9b (Witnesses)"
echo "   Port 11437: llama3.2:3b (Jury)"
echo "   Port 11438: qwen2.5:3b (Court Staff)"
echo ""
echo "💡 Tips:"
echo "   - Use the 'Manage AI Models' button in the courtroom to configure assignments"
echo "   - Monitor system resources during simulations"
echo "   - Stop unused instances if you need more RAM: pkill -f 'ollama serve'"
echo ""
echo "🚀 Ready to start your multi-model courtroom simulation!"