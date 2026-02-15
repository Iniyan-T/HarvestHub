# HarvestHub - AI Chatbot Quick Start

## ✅ Integration Complete!

The Ollama integration for the AI chatbot has been successfully implemented with the following features:

### What's Been Added

1. **Ollama Service** ([backend/services/ollama.service.js](backend/services/ollama.service.js))
   - Local LLM integration using Ollama
   - Automatic model detection and availability checking
   - Support for chat and generation modes
   - Model management (list, pull)

2. **Enhanced AI Assistant** ([backend/services/ai-assistant.service.js](backend/services/ai-assistant.service.js))
   - Smart model selection (Ollama → Gemini fallback)
   - Conversation history management
   - Context-aware responses for farmers and buyers
   - Agricultural domain-specific prompts

3. **Configuration** ([backend/.env.example](backend/.env.example))
   - `USE_OLLAMA=true/false` - Enable/disable Ollama
   - `OLLAMA_BASE_URL` - Ollama server URL
   - `OLLAMA_MODEL` - Model name (default: llama3.2)

4. **Testing** ([backend/test-ollama.js](backend/test-ollama.js))
   - Comprehensive test suite for Ollama
   - Verifies connectivity, models, and responses

## 🚀 Quick Setup

### Option 1: Use Ollama (Recommended for Development)

```bash
# 1. Install Ollama
# Download from: https://ollama.ai/download

# 2. Pull a model
ollama pull llama3.2

# 3. Configure backend
cd backend
cp .env.example .env
# Edit .env and set:
# USE_OLLAMA=true
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.2

# 4. Test Ollama
node test-ollama.js

# 5. Start server
npm start
```

### Option 2: Use Gemini Only

```bash
cd backend
cp .env.example .env
# Edit .env and set:
# USE_OLLAMA=false
# GEMINI_CHAT_API_KEY=your_api_key_here

npm start
```

## 📊 Current Status

✅ **Installed**: ollama npm package  
✅ **Created**: Ollama service with full LLM integration  
✅ **Updated**: AI Assistant service with fallback logic  
✅ **Added**: Environment configuration templates  
✅ **Created**: Test suite for verification  
✅ **Documented**: Complete setup guide  

⚠️ **Ollama Status**: Not currently running (will use Gemini fallback)

## 🧪 Testing the Chatbot

### 1. Test with curl

```bash
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the best price for Grade A tomatoes?",
    "userId": "farmer123",
    "userType": "farmer"
  }'
```

### 2. Check which model is being used

The response includes a `model` field:
```json
{
  "success": true,
  "response": "Based on your Grade A tomatoes...",
  "context": {
    "model": "ollama"  // or "gemini"
  }
}
```

## 🎯 How It Works

1. **User sends message** → API receives request
2. **System checks Ollama** → If `USE_OLLAMA=true`
   - ✅ Ollama available → Use local LLM
   - ❌ Ollama unavailable → Fall back to Gemini
3. **Build context** → Include user's crops, prices, history
4. **Generate response** → Context-aware agricultural advice
5. **Return to user** → Include model information

## 📁 Key Files

| File | Purpose |
|------|---------|
| [backend/services/ollama.service.js](backend/services/ollama.service.js) | Ollama integration layer |
| [backend/services/ai-assistant.service.js](backend/services/ai-assistant.service.js) | Main AI chatbot logic |
| [backend/test-ollama.js](backend/test-ollama.js) | Integration test suite |
| [backend/.env.example](backend/.env.example) | Configuration template |
| [OLLAMA_INTEGRATION.md](OLLAMA_INTEGRATION.md) | Detailed setup guide |

## 🔧 Configuration Options

```env
# Use Ollama (true) or Gemini only (false)
USE_OLLAMA=true

# Ollama server URL
OLLAMA_BASE_URL=http://localhost:11434

# Model to use (must be pulled first)
OLLAMA_MODEL=llama3.2

# Gemini API key (used as fallback or primary if USE_OLLAMA=false)
GEMINI_CHAT_API_KEY=your_key_here
```

## 📈 Recommended Models

| Use Case | Model | Size | Performance |
|----------|-------|------|-------------|
| Development | llama3.2:1b | 1.3GB | Fast, good enough |
| Production | llama3.2 | 2GB | Balanced |
| High Quality | llama3.1:8b | 4.7GB | Best results |
| Low Resources | phi3:mini | 2GB | Efficient |

## 🐛 Troubleshooting

### "Ollama not available"
- Install Ollama from https://ollama.ai/download
- Run `ollama serve` (Linux/Mac)
- Check if running: `curl http://localhost:11434/api/tags`

### "Model not found"
```bash
ollama pull llama3.2
```

### Server won't start
```bash
# Check if MongoDB is running
# Check if port 5000 is available
# Verify .env file exists with required keys
```

## 🎉 Next Steps

1. **Install Ollama** (if you want local LLM)
2. **Pull a model**: `ollama pull llama3.2`
3. **Start backend**: `npm start`
4. **Test the API**: Use the curl command above
5. **Integrate with frontend**: The Farmer and Buyers apps already have AI Assistant components

## 💡 Benefits

### Using Ollama
- ✅ **Free**: No API costs
- ✅ **Private**: Data stays local
- ✅ **Fast**: No network latency
- ✅ **Reliable**: No rate limits

### Fallback to Gemini
- ✅ **Always available**: Cloud-based backup
- ✅ **No setup**: Just add API key
- ✅ **Scalable**: Google's infrastructure

## 📚 Documentation

- Full setup guide: [OLLAMA_INTEGRATION.md](OLLAMA_INTEGRATION.md)
- Ollama docs: https://github.com/ollama/ollama
- Gemini API: https://ai.google.dev/

---

**Status**: ✅ Integration complete and ready for testing!
