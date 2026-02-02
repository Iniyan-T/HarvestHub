import ollamaService from './services/ollama.service.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🤖 HarvestHub AI Model Manager\n');
  console.log('='.repeat(50));
  
  const status = ollamaService.getStatus();
  
  console.log('\n📊 Current Status:');
  console.log(`   Ollama Available: ${status.available ? '✅' : '❌'}`);
  console.log(`   Base URL: ${status.baseUrl}`);
  console.log(`   Current Model: ${status.currentModel}`);
  
  if (!status.available) {
    console.log('\n⚠️  Ollama is not running!');
    console.log('\n📝 Quick Setup:');
    console.log('   1. Download: https://ollama.ai/download');
    console.log('   2. Pull model: ollama pull llama3.2');
    console.log('   3. Run this script again');
    rl.close();
    return;
  }
  
  console.log('\n📦 Available Models:');
  const models = await ollamaService.listModels();
  
  if (models.length === 0) {
    console.log('   No models installed!');
  } else {
    models.forEach((model, index) => {
      const size = (model.size / 1e9).toFixed(2);
      const current = model.name === status.currentModel ? '← CURRENT' : '';
      console.log(`   ${index + 1}. ${model.name} (${size} GB) ${current}`);
    });
  }
  
  console.log('\n🔧 Options:');
  console.log('   1. Test current model');
  console.log('   2. Pull a new model');
  console.log('   3. Test chat functionality');
  console.log('   4. Exit');
  
  const choice = await question('\nSelect option (1-4): ');
  
  switch (choice.trim()) {
    case '1':
      await testCurrentModel();
      break;
    case '2':
      await pullNewModel();
      break;
    case '3':
      await testChat();
      break;
    case '4':
      console.log('\n👋 Goodbye!\n');
      break;
    default:
      console.log('\n❌ Invalid option');
  }
  
  rl.close();
}

async function testCurrentModel() {
  console.log('\n🧪 Testing current model...\n');
  
  try {
    const start = Date.now();
    const result = await ollamaService.generate(
      'Say hello in exactly 5 words.',
      { temperature: 0.7, maxTokens: 20 }
    );
    const duration = Date.now() - start;
    
    console.log('Response:', result.content);
    console.log(`Time: ${duration}ms`);
    console.log('Tokens:', result.totalTokens);
    console.log('\n✅ Test successful!');
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
}

async function pullNewModel() {
  console.log('\n📦 Popular Models:');
  console.log('   1. llama3.2 (3B - Recommended)');
  console.log('   2. llama3.2:1b (Faster, smaller)');
  console.log('   3. llama3.1:8b (Better quality)');
  console.log('   4. phi3 (Microsoft)');
  console.log('   5. mistral (7B)');
  console.log('   6. Custom');
  
  const choice = await question('\nSelect model (1-6): ');
  
  const modelMap = {
    '1': 'llama3.2',
    '2': 'llama3.2:1b',
    '3': 'llama3.1:8b',
    '4': 'phi3',
    '5': 'mistral'
  };
  
  let modelName;
  if (choice === '6') {
    modelName = await question('Enter model name: ');
  } else {
    modelName = modelMap[choice.trim()];
  }
  
  if (!modelName) {
    console.log('\n❌ Invalid choice');
    return;
  }
  
  console.log(`\n📥 Pulling ${modelName}... (this may take a few minutes)`);
  const success = await ollamaService.pullModel(modelName);
  
  if (success) {
    console.log(`\n✅ ${modelName} installed successfully!`);
    console.log(`💡 Update your .env: OLLAMA_MODEL=${modelName}`);
  } else {
    console.log(`\n❌ Failed to pull ${modelName}`);
  }
}

async function testChat() {
  console.log('\n💬 Testing chat functionality...\n');
  
  const testMessage = 'I have 50kg of Grade A tomatoes. What price should I set?';
  console.log('User:', testMessage);
  console.log('Assistant: ', '');
  
  try {
    const messages = [
      { 
        role: 'system', 
        content: 'You are a helpful farming assistant in India. Be concise.' 
      },
      { 
        role: 'user', 
        content: testMessage 
      }
    ];
    
    const start = Date.now();
    const result = await ollamaService.chat(messages, {
      temperature: 0.7,
      maxTokens: 150
    });
    const duration = Date.now() - start;
    
    console.log(result.content);
    console.log(`\n⏱️  Response time: ${duration}ms`);
    console.log('✅ Chat test successful!');
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
  }
}

main().catch(console.error);
