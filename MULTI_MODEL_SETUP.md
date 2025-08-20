# 🤖 Multi-Model Ollama Strategy for Terragon Courtroom

This document explains how to set up and use multiple Ollama instances for optimized courtroom simulations with the Terragon system.

## 🎯 Strategy Overview

The multi-model setup leverages your **48GB VRAM + 64GB RAM** to run multiple Ollama instances simultaneously, each hosting different models optimized for specific courtroom roles. This eliminates model loading delays and provides personality variety.

## 📋 Model Assignment Strategy

| Role | Model | Port | RAM Usage | Reasoning |
|------|-------|------|-----------|-----------|
| **Judge** | `llama3:latest` | 11434 | ~8GB | Consistency in judicial decisions |
| **Attorneys** | `mistral:7b` | 11435 | ~5GB | Analytical reasoning for legal arguments |
| **Witnesses** | `gemma2:9b` | 11436 | ~6GB | Diverse responses for testimony |
| **Jury Members** | `llama3.2:3b` | 11437 | ~3GB | Efficient processing for jury deliberation |
| **Court Staff** | `qwen2.5:3b` | 11438 | ~3GB | Variety for bailiff/clerk responses |

**Total RAM Usage**: ~25GB (leaves plenty of headroom)

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Navigate to your project directory
cd /path/to/your/courtroom-project

# Run the automated setup script
./scripts/setup-multi-ollama.sh
```

### Option 2: Manual Setup
```bash
# 1. Download required models
ollama pull llama3:latest
ollama pull mistral:7b
ollama pull gemma2:9b
ollama pull llama3.2:3b
ollama pull qwen2.5:3b

# 2. Start multiple Ollama instances
# Primary instance (usually already running)
ollama serve &

# Additional instances
OLLAMA_HOST=0.0.0.0:11435 ollama serve &
OLLAMA_HOST=0.0.0.0:11436 ollama serve &
OLLAMA_HOST=0.0.0.0:11437 ollama serve &
OLLAMA_HOST=0.0.0.0:11438 ollama serve &

# 3. Verify all instances are running
curl http://localhost:11434/api/tags
curl http://localhost:11435/api/tags
curl http://localhost:11436/api/tags
curl http://localhost:11437/api/tags
curl http://localhost:11438/api/tags
```

## 🎛️ Configuration UI

Once your instances are running:

1. **Start the Terragon Courtroom**:
   ```bash
   npm run dev
   ```

2. **Open the AI Model Manager**:
   - Click the **🤖 Manage AI Models** button in the Control Panel
   - Switch between **Instances** and **Performance** tabs

3. **Configure Role Assignments**:
   - Use the **Role Assignment** section to map participants to specific instances
   - Monitor **Instance Status** to ensure all models are healthy
   - Check **Current Role Mappings** to verify your setup

## 📊 Performance Monitoring

The system includes built-in performance monitoring:

### Real-time Metrics
- **Memory Usage**: Current system memory utilization
- **CPU Usage**: Estimated based on response times
- **Active Instances**: Number of responding Ollama instances
- **Average Response Time**: Across all models

### Model Performance Tracking
- Response times per model
- Request counts
- Success rates
- Error tracking

### Performance Data Export
- **JSON Export**: Full performance metrics for analysis
- **CSV Export**: Response time data for spreadsheets

## 🔧 Optimization Tips

### Memory Management
- **Monitor Usage**: Keep total memory usage below 80% of available RAM
- **Model Swapping**: If running low on memory, consider using smaller models:
  - `smollm2:1.7b` instead of `llama3.2:3b` for jury members
  - `phi3:mini` for court staff roles

### Performance Tuning
- **Pre-loading**: Models are automatically pre-loaded to reduce first-response latency
- **Health Checks**: Automatic instance monitoring with 30-second intervals
- **Fallback**: Automatic failover to healthy instances when errors occur

### System Resources
```bash
# Monitor system resources
htop                    # CPU and memory usage
nvidia-smi              # GPU memory usage (if using GPU acceleration)
lsof -i :11434-11438    # Check which ports are in use
```

## 🐛 Troubleshooting

### Common Issues

#### "Port already in use"
```bash
# Find process using the port
lsof -i :11435

# Kill existing process if needed
pkill -f "ollama serve"

# Restart with specific port
OLLAMA_HOST=0.0.0.0:11435 ollama serve &
```

#### "Model not responding"
1. Check instance health in the **Manage AI Models** panel
2. Use the **Restart** button for unhealthy instances
3. Verify model is downloaded: `ollama list`

#### "Out of memory errors"
1. Reduce number of active instances
2. Use smaller models (3b instead of 7b parameters)
3. Monitor memory usage: `free -h`

#### "Slow response times"
1. Check the **Performance** tab for bottlenecks
2. Ensure sufficient RAM available
3. Consider GPU acceleration if available

### Health Check Commands
```bash
# Test all instances
for port in 11434 11435 11436 11437 11438; do
  echo "Testing port $port..."
  curl -s http://localhost:$port/api/tags > /dev/null && echo "✅ Port $port OK" || echo "❌ Port $port failed"
done

# Quick model test
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "llama3:latest", "prompt": "Hello", "stream": false}'
```

## 🎉 Benefits

### Performance
- **No Model Loading Delays**: All models stay loaded in memory
- **Concurrent Processing**: Multiple participants can generate responses simultaneously
- **Optimized Resource Usage**: Models matched to role complexity

### Simulation Quality
- **Personality Variety**: Different models provide distinct response styles
- **Role-Appropriate Responses**: Models chosen for their strengths
- **Consistent Performance**: Dedicated instances prevent resource conflicts

### Monitoring & Control
- **Real-time Metrics**: Track performance and resource usage
- **Flexible Assignment**: Easily reassign roles to different models
- **Automated Fallback**: System handles instance failures gracefully

## 📈 Expected Performance

With this setup, you should see:
- **Response times**: 500-2000ms per participant
- **Concurrent participants**: 5-8 simultaneous AI agents
- **Memory usage**: 25-30GB total
- **Simulation quality**: High variety and role-appropriate responses

## 🔄 Updating the Setup

To modify the model assignments:
1. Open **🤖 Manage AI Models** in the Control Panel
2. Use the **Role Assignment** section to change mappings
3. Models take effect immediately for new requests
4. Monitor performance in the **Performance** tab

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all Ollama instances are healthy
3. Monitor system resources (RAM, CPU, VRAM)
4. Use the automated setup script to reset if needed

---

**Happy Simulating!** 🎭⚖️