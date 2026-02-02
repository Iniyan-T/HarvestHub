import dotenv from 'dotenv';
import Crop from '../models/Crop.js';
import ollamaService from './ollama.service.js';

dotenv.config();

class AIAssistantService {
  constructor() {
    this.conversationHistory = new Map(); // Store conversation history per user
    console.log('🤖 AI Assistant initialized with Ollama');
  }

  /**
   * Build context for farmer
   */
  async buildFarmerContext(farmerId) {
    try {
      const crops = await Crop.find({ farmerId }).sort({ createdAt: -1 }).limit(10);
      
      return {
        userType: 'farmer',
        farmerId,
        crops: crops.map(c => ({
          name: c.cropName,
          quantity: c.quantity,
          price: c.price,
          grade: c.aiGrade?.grade || 'Pending',
          qualityScore: c.aiGrade?.qualityScore || 0,
          freshness: c.aiGrade?.freshness || 'Unknown'
        })),
        totalCrops: crops.length,
        totalQuantity: crops.reduce((sum, c) => sum + c.quantity, 0)
      };
    } catch (error) {
      console.error('Error building farmer context:', error);
      return { userType: 'farmer', farmerId, crops: [], totalCrops: 0 };
    }
  }

  /**
   * Build context for buyer
   */
  async buildBuyerContext(buyerId) {
    try {
      // For now, return basic context. Can be expanded with buyer's transaction history
      return {
        userType: 'buyer',
        buyerId
      };
    } catch (error) {
      console.error('Error building buyer context:', error);
      return { userType: 'buyer', buyerId };
    }
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(context) {
    const basePrompt = `You are the HarvestHub App Assistant. You ONLY answer questions about using the HarvestHub application.

HARVESTHUB APP FEATURES YOU CAN HELP WITH:
1. ADD CROP: Go to "Add Crop" section, enter crop name, quantity (kg), and price (₹/kg)
2. STOCK REQUESTS: View buyer requests in "Stock Requests", click Accept/Reject
3. STORAGE: Monitor ESP32 sensor readings (temperature/humidity/gas) in "Storage" section
4. TRANSACTIONS: Track orders and payments in "Transactions" tab
5. AI GRADING: Upload crop photos for automated quality grading (A/B/C)

IMPORTANT RULES:
- Answer ONLY about the 5 app features above
- Keep responses under 3 sentences
- Use actual user data when available
- For off-topic questions (weather, farming techniques, fertilizers, etc.), respond: "I can only help with HarvestHub app features. Try asking about adding crops, stock requests, storage monitoring, transactions, or AI grading."

GOOD RESPONSES:
"Use the Add Crop form to enter your tomato details: name, quantity in kg, and price in ₹."
"Check your Dashboard to see if you have enough stock, then go to Stock Requests to accept."  
"Sell Grade A crops first - they get better prices."

BAD RESPONSES (DON'T DO THIS):
- Explaining farming techniques
- Weather or seasonal advice
- Fertilizer recommendations
- Step-by-step UI navigation (users can see the interface)
`;

    if (context.userType === 'farmer') {
      const inventory = context.crops.length > 0 
        ? context.crops.map(c => `${c.name} ${c.quantity}kg ₹${c.price}/kg Grade-${c.grade}`).join('; ')
        : 'No crops listed';
      
      return `${basePrompt}

FARMER DATA: ${context.totalCrops} crops, ${context.totalQuantity}kg total
INVENTORY: ${inventory}`;
    } else {
      return `${basePrompt}

BUYER ID: ${context.buyerId}`;
    }
  }

  /**
   * Get conversation history for user
   */
  getHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId);
  }

  /**
   * Add message to history
   */
  addToHistory(userId, role, content) {
    const history = this.getHistory(userId);
    history.push({ role, content });
    
    // Keep only last 10 messages to avoid token limits
    if (history.length > 10) {
      history.shift();
      history.shift(); // Remove user + assistant pair
    }
    
    this.conversationHistory.set(userId, history);
  }

  /**
   * Clear conversation history for user
   */
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  /**
   * Main chat function using Ollama
   */
  async chat(userId, userType, message) {
    try {
      // Build context based on user type
      const context = userType === 'farmer' 
        ? await this.buildFarmerContext(userId)
        : await this.buildBuyerContext(userId);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);

      // Get conversation history
      const history = this.getHistory(userId);

      // Check if Ollama is available
      if (!ollamaService.isAvailable) {
        throw new Error('Ollama service is not available. Please ensure Ollama is running and a model is loaded.');
      }

      console.log('🤖 Using Ollama for chat...');
      const response = await this.chatWithOllama(systemPrompt, history, message);
      
      // Add to history
      this.addToHistory(userId, 'user', message);
      this.addToHistory(userId, 'assistant', response);

      return {
        success: true,
        response: response,
        context: {
          userType: context.userType,
          cropsCount: context.crops?.length || 0,
          model: 'ollama'
        }
      };

    } catch (error) {
      console.error('❌ AI Assistant error:', error);
      
      const errorDetails = error.response?.data || error.message || 'Unknown error';
      console.error('Error details:', errorDetails);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Chat using Ollama
   */
  async chatWithOllama(systemPrompt, history, message) {
    // Store original message for filtering
    const originalMessage = message.toLowerCase();
    
    // Format messages for Ollama
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message with explicit constraint
    messages.push({
      role: 'user',
      content: `${message}\n\n[Answer in 1-3 sentences about HarvestHub app only. If question is off-topic, say you only help with app features.]`
    });

    const result = await ollamaService.chat(messages, {
      temperature: 0.2,  // Very low temperature for focused responses
      maxTokens: 150     // Allow slightly more tokens but we'll truncate
    });

    // Post-process: Keep response focused and brief
    let response = result.content.trim();
    
    // Detect off-topic questions
    const offTopicKeywords = /(fertilizer|weather|plant|grow|seed|pest|disease|irrigation|soil|water|sun|rain|season|harvest time|pesticide|herbicide)/;
    
    console.log(`🔍 Filtering check - Original message: "${originalMessage}"`);
    console.log(`🔍 Off-topic match: ${offTopicKeywords.test(originalMessage)}`);
    
    if (offTopicKeywords.test(originalMessage)) {
      // Off-topic question - give redirect only
      console.log('⚠️  OFF-TOPIC DETECTED - Redirecting to app features');
      response = "I can only help with HarvestHub app features like adding crops, stock requests, storage monitoring, transactions, or AI grading.";
    } else {
      // App feature question - keep first 2 sentences max
      const sentences = response.match(/[^.!?]+[.!?]+/g) || [response];
      console.log(`✂️  Truncating from ${sentences.length} sentences to 2`);
      if (sentences.length > 2) {
        response = sentences.slice(0, 2).join(' ');
      }
      
      // Hard limit: 250 characters max
      if (response.length > 250) {
        console.log(`✂️  Truncating from ${response.length} chars to 250`);
        response = response.substring(0, 247) + '...';
      }
    }

    console.log(`✅ Final response (${response.length} chars): "${response}"`);
    return response;
  }

  /**
   * Get quick suggestions based on context
   */
  async getQuickSuggestions(userId, userType) {
    try {
      const context = userType === 'farmer' 
        ? await this.buildFarmerContext(userId)
        : await this.buildBuyerContext(userId);

      if (userType === 'farmer') {
        const suggestions = [
          "What crops should I prioritize selling?",
          "How can I improve my crop prices?",
          "Analyze my current inventory"
        ];

        if (context.totalCrops === 0) {
          return ["How do I add my first crop?", "What information do I need to list crops?"];
        }

        return suggestions;
      } else {
        return [
          "Find farmers selling tomatoes",
          "What's a fair price for Grade A wheat?",
          "How do I send a stock request?"
        ];
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return ["Tell me about your platform", "How can you help me?"];
    }
  }
}

// Export singleton instance
export default new AIAssistantService();
