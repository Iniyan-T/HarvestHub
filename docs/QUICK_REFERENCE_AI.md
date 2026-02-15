# 🚀 HarvestHub AI Chatbot - Quick Reference

## Start Backend Server
```bash
cd backend
npm start
```

## Test Ollama Integration
```bash
cd backend
node test-ollama.js
```

## Interactive Model Manager
```bash
cd backend
node model-manager.js
```

## Environment Setup
```bash
# Copy template
cp .env.example .env

# Edit and add:
USE_OLLAMA=true                        # true/false
OLLAMA_MODEL=llama3.2                  # Model name
GEMINI_CHAT_API_KEY=your_key_here     # Fallback
```

## Install Ollama
```bash
# 1. Download: https://ollama.ai/download
# 2. Pull model:
ollama pull llama3.2

# 3. Verify:
ollama list
```

## API Test
```bash
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the best price for Grade A tomatoes?",
    "userId": "farmer123",
    "userType": "farmer"
  }'
```

## Common Commands

### Check Ollama Status
```bash
curl http://localhost:11434/api/tags
```

### List Models
```bash
ollama list
```

### Pull New Model
```bash
ollama pull llama3.1:8b
```

### Test Model
```bash
ollama run llama3.2
```

## Recommended Models

| Model | Command | Size | Best For |
|-------|---------|------|----------|
| Llama 3.2 | `ollama pull llama3.2` | 2GB | **Production** |
| Llama 3.2 1B | `ollama pull llama3.2:1b` | 1.3GB | Development |
| Llama 3.1 8B | `ollama pull llama3.1:8b` | 4.7GB | High Quality |
| Phi 3 | `ollama pull phi3` | 2.3GB | Efficient |

## Troubleshooting

### Ollama not available
```bash
# Install from: https://ollama.ai/download
# Pull model: ollama pull llama3.2
```

### Port in use
```bash
# Change PORT in .env
PORT=5001
```

### MongoDB connection error
```bash
# Start MongoDB service
# Or use connection string in .env
MONGODB_URI=mongodb://localhost:27017/harvesthub
```

## File Locations

| File | Purpose |
|------|---------|
| `backend/services/ollama.service.js` | Ollama integration |
| `backend/services/ai-assistant.service.js` | Main AI logic |
| `backend/test-ollama.js` | Test suite |
| `backend/model-manager.js` | Model management CLI |
| `backend/.env` | Configuration |

## API Endpoints

```
POST /api/ai-assistant/chat           # Send message
GET  /api/ai-assistant/suggestions    # Get suggestions
POST /api/ai-assistant/clear-history  # Clear history
```

## Documentation

- **Quick Start**: [AI_CHATBOT_SETUP.md](AI_CHATBOT_SETUP.md)
- **Detailed Guide**: [OLLAMA_INTEGRATION.md](OLLAMA_INTEGRATION.md)
- **Summary**: [OLLAMA_INTEGRATION_SUMMARY.md](OLLAMA_INTEGRATION_SUMMARY.md)

---

## Quick Setup Checklist

- [ ] Install Ollama
- [ ] Pull llama3.2 model
- [ ] Copy .env.example to .env
- [ ] Configure USE_OLLAMA=true
- [ ] Run test-ollama.js
- [ ] Start server with npm start
- [ ] Test API endpoint

**Status**: ✅ Ready to use!
