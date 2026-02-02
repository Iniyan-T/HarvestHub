import ollamaService from './services/ollama.service.js';
import dotenv from 'dotenv';

dotenv.config();

async function testOllama() {
  console.log('\n🧪 Testing Ollama Integration\n');
  console.log('=' .repeat(50));
  
  // Wait for service initialization
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Refresh availability after wait
  await ollamaService.checkAvailability();
  
  // 1. Check Ollama status
  console.log('\n1️⃣  Checking Ollama status...');
  const status = ollamaService.getStatus();
  console.log('Status:', status);
  
  if (!status.available) {
    console.log('\n❌ Ollama is not available!');
    console.log('\n📝 Setup Instructions:');
    console.log('   1. Install Ollama: https://ollama.ai/download');
    console.log('   2. Run: ollama pull llama3.2');
    console.log('   3. Verify: ollama list');
    console.log('   4. Make sure Ollama is running on http://localhost:11434');
    return;
  }
  
  console.log('✅ Ollama is running!');
  
  // 2. List available models
  console.log('\n2️⃣  Listing available models...');
  const models = await ollamaService.listModels();
  console.log(`Found ${models.length} models:`);
  models.forEach(model => {
    console.log(`   - ${model.name} (${(model.size / 1e9).toFixed(2)} GB)`);
  });
  
  // 3. Test simple generation
  console.log('\n3️⃣  Testing simple generation...');
  try {
    const result = await ollamaService.generate(
      'Say "Hello from Ollama!" in exactly 5 words.',
      { temperature: 0.7, maxTokens: 50 }
    );
    console.log('Response:', result.content);
    console.log('Tokens:', result.totalTokens);
    console.log('✅ Generation test passed!');
  } catch (error) {
    console.log('❌ Generation test failed:', error.message);
  }
  
  // 4. Test chat mode
  console.log('\n4️⃣  Testing chat mode...');
  try {
    const messages = [
      { role: 'system', content: 'You are a helpful farming assistant.' },
      { role: 'user', content: 'What is the best time to plant tomatoes?' }
    ];
    
    const result = await ollamaService.chat(messages, { 
      temperature: 0.7, 
      maxTokens: 100 
    });
    
    console.log('Response:', result.content);
    console.log('Tokens:', result.totalTokens);
    console.log('✅ Chat test passed!');
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
  }
  
  // 5. Test with agricultural context
  console.log('\n5️⃣  Testing agricultural context...');
  try {
    const messages = [
      { 
        role: 'system', 
        content: 'You are an AI assistant for HarvestHub, an agricultural marketplace in India. Help farmers with crop advice.'
      },
      { 
        role: 'user', 
        content: 'I have 50kg of Grade A tomatoes. What price should I set per kg?'
      }
    ];
    
    const result = await ollamaService.chat(messages, { 
      temperature: 0.7, 
      maxTokens: 150 
    });
    
    console.log('Response:', result.content);
    console.log('✅ Agricultural context test passed!');
  } catch (error) {
    console.log('❌ Agricultural context test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!\n');
}

// Run tests
testOllama().catch(console.error);
