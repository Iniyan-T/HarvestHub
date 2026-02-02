# Ollama Integration Guide for HarvestHub AI Chatbot

## Overview
HarvestHub now supports **Ollama** for local LLM inference, with automatic fallback to Gemini API if Ollama is unavailable.

## Architecture
- **Primary**: Ollama (local, private, free)
- **Fallback**: Gemini API (cloud-based)
- **Automatic switching**: If Ollama fails, seamlessly falls back to Gemini

## Setup Instructions

### 1. Install Ollama

#### Windows
1. Download from: https://ollama.ai/download
2. Run the installer
3. Ollama will start automatically on `http://localhost:11434`

#### Linux/Mac
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull a Model

```bash
# Recommended: Llama 3.2 (lightweight, fast)
ollama pull llama3.2

# Alternative models:
ollama pull llama3.2:1b    # Faster, less capable
ollama pull llama3.1:8b    # Larger, more capable
ollama pull phi3           # Microsoft's efficient model
ollama pull mistral        # Good performance
```

### 3. Verify Installation

```bash
# List installed models
ollama list

# Test the model
ollama run llama3.2
```

### 4. Configure Backend

Create or update `.env` file in the backend directory:

```env
# Ollama Configuration
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Gemini API (fallback)
GEMINI_CHAT_API_KEY=your_gemini_api_key_here
```

### 5. Test Integration

```bash
cd backend
node test-ollama.js
```

Expected output:
```
🧪 Testing Ollama Integration
==================================================

1️⃣  Checking Ollama status...
✅ Ollama is running!

2️⃣  Listing available models...
Found X models:
   - llama3.2 (X.XX GB)

3️⃣  Testing simple generation...
✅ Generation test passed!

4️⃣  Testing chat mode...
✅ Chat test passed!

5️⃣  Testing agricultural context...
✅ Agricultural context test passed!
```

### 6. Start Server

```bash
npm start
```

## API Usage

The AI Assistant API automatically uses Ollama if available:

```javascript
// POST /api/ai-assistant/chat
{
  "message": "What's the best price for my Grade A tomatoes?",
  "userId": "farmer123",
  "userType": "farmer"
}

// Response includes which model was used
{
  "success": true,
  "response": "Based on your Grade A tomatoes...",
  "context": {
    "userType": "farmer",
    "cropsCount": 5,
    "model": "ollama"  // or "gemini" if fallback
  }
}
```

## Model Recommendations

### For Development/Testing
- **llama3.2:1b** - Fastest, uses ~1GB RAM
- Good for quick iteration

### For Production
- **llama3.2** (3B) - Balanced speed and quality
- **llama3.1:8b** - Best quality, needs 8GB RAM
- **phi3** - Microsoft's efficient model

### For Low-Resource Systems
- **phi3:mini** - 2GB RAM, decent quality
- **tinyllama** - Ultra-lightweight

## Performance Comparison

| Model | Size | Speed | Quality | RAM Usage |
|-------|------|-------|---------|-----------|
| llama3.2:1b | 1.3GB | ⚡⚡⚡ | ⭐⭐ | ~2GB |
| llama3.2 | 2GB | ⚡⚡ | ⭐⭐⭐ | ~4GB |
| llama3.1:8b | 4.7GB | ⚡ | ⭐⭐⭐⭐ | ~8GB |
| phi3 | 2.3GB | ⚡⚡ | ⭐⭐⭐ | ~4GB |

## Troubleshooting

### Ollama Not Available
```
ℹ️  Ollama not available, will use Gemini as fallback
```
**Solutions:**
1. Check if Ollama is running: `ollama list`
2. Restart Ollama service
3. Verify port 11434 is not blocked
4. Check firewall settings

### Model Not Found
```
⚠️  Preferred model 'llama3.2' not found
```
**Solution:**
```bash
ollama pull llama3.2
```

### Connection Refused
```
❌ Ollama chat error: connect ECONNREFUSED
```
**Solutions:**
1. Start Ollama: Windows (auto-starts), Linux: `ollama serve`
2. Check `OLLAMA_BASE_URL` in `.env`
3. Test with: `curl http://localhost:11434/api/tags`

### Out of Memory
**Solutions:**
1. Use a smaller model: `ollama pull llama3.2:1b`
2. Close other applications
3. Update `OLLAMA_MODEL` in `.env`

## Benefits of Ollama

✅ **Privacy**: Data never leaves your server
✅ **Cost**: Completely free, no API charges
✅ **Speed**: Low latency, no network delays
✅ **Reliability**: No rate limits or API downtime
✅ **Customization**: Fine-tune models for agriculture domain

## Switching Between Models

To use Gemini instead of Ollama:

```env
USE_OLLAMA=false
```

To change Ollama model:

```env
OLLAMA_MODEL=llama3.1:8b
```

## Production Deployment

### Docker Setup
```dockerfile
FROM node:20
# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh
# Pull model during build
RUN ollama serve & sleep 5 && ollama pull llama3.2
```

### System Requirements
- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 8GB RAM, 4 CPU cores
- **Disk Space**: 3-5GB per model

## Next Steps

1. ✅ Test with `node test-ollama.js`
2. ✅ Start backend server
3. ✅ Try the AI chatbot in the web app
4. 📊 Monitor performance and adjust model if needed
5. 🎨 Fine-tune prompts for better agricultural advice

## Resources

- Ollama Documentation: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library
- HarvestHub Backend: `backend/services/ollama.service.js`
- AI Assistant: `backend/services/ai-assistant.service.js`
