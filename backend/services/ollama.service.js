import { Ollama } from 'ollama';
import dotenv from 'dotenv';

dotenv.config();

class OllamaService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
    this.ollama = new Ollama({ host: this.baseUrl });
    this.isAvailable = false;
    this.checkAvailability();
  }

  /**
   * Check if Ollama is available
   */
  async checkAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.models && data.models.length > 0;
        
        if (this.isAvailable) {
          console.log('✅ Ollama is available');
          console.log(`📦 Available models: ${data.models.map(m => m.name).join(', ')}`);
          
          // Check if preferred model exists (with or without :latest tag)
          const modelBaseName = this.model.replace(':latest', '');
          const hasPreferredModel = data.models.some(m => 
            m.name === this.model || 
            m.name === `${modelBaseName}:latest` ||
            m.name.startsWith(`${modelBaseName}:`)
          );
          
          if (!hasPreferredModel && data.models.length > 0) {
            console.log(`⚠️  Preferred model '${this.model}' not found. Using: ${data.models[0].name}`);
            this.model = data.models[0].name;
          } else if (hasPreferredModel && !this.model.includes(':')) {
            // Update to use the full name with tag if model exists
            const fullModelName = data.models.find(m => 
              m.name === `${modelBaseName}:latest` || m.name.startsWith(`${modelBaseName}:`)
            );
            if (fullModelName) {
              this.model = fullModelName.name;
            }
          }
          console.log(`🎯 Using model: ${this.model}`);
        } else {
          console.log('⚠️  Ollama is running but no models are installed');
        }
      }
    } catch (error) {
      this.isAvailable = false;
      console.log('ℹ️  Ollama not available, will use Gemini as fallback');
    }
  }

  /**
   * Generate chat response using Ollama
   */
  async chat(messages, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Ollama is not available');
    }

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          num_predict: options.maxTokens || 500
        }
      });

      return {
        content: response.message.content,
        model: this.model,
        totalTokens: response.eval_count || 0
      };
    } catch (error) {
      console.error('❌ Ollama chat error:', error.message);
      throw error;
    }
  }

  /**
   * Generate a simple completion
   */
  async generate(prompt, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Ollama is not available');
    }

    try {
      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          num_predict: options.maxTokens || 500
        }
      });

      return {
        content: response.response,
        model: this.model,
        totalTokens: response.eval_count || 0
      };
    } catch (error) {
      console.error('❌ Ollama generate error:', error.message);
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error listing models:', error.message);
      return [];
    }
  }

  /**
   * Pull a new model
   */
  async pullModel(modelName) {
    try {
      console.log(`📥 Pulling model: ${modelName}...`);
      const response = await this.ollama.pull({
        model: modelName,
        stream: false
      });
      
      console.log(`✅ Model ${modelName} pulled successfully`);
      await this.checkAvailability(); // Refresh available models
      return true;
    } catch (error) {
      console.error(`❌ Error pulling model ${modelName}:`, error.message);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.isAvailable,
      baseUrl: this.baseUrl,
      currentModel: this.model
    };
  }
}

// Export singleton instance
export default new OllamaService();
