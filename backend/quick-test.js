import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ollamaService from './services/ollama.service.js';
import aiAssistant from './services/ai-assistant.service.js';

dotenv.config();

async function quickTest() {
  console.log('\n🔍 HarvestHub System Check\n');
  console.log('='.repeat(50));

  // 1. Check MongoDB
  console.log('\n1️⃣  MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harvesthub');
    console.log('   ✅ MongoDB connected');
  } catch (error) {
    console.log('   ❌ MongoDB error:', error.message);
    process.exit(1);
  }

  // 2. Check Ollama
  console.log('\n2️⃣  Ollama Service...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await ollamaService.checkAvailability();
  const status = ollamaService.getStatus();
  if (status.available) {
    console.log('   ✅ Ollama ready');
    console.log(`   📦 Model: ${status.currentModel}`);
  } else {
    console.log('   ⚠️  Ollama not available, will use Gemini');
  }

  // 3. Test AI Chat
  console.log('\n3️⃣  AI Chat Test...');
  try {
    const result = await aiAssistant.chat(
      'test_user',
      'farmer',
      'Hello, can you help me?'
    );
    
    if (result.success) {
      console.log('   ✅ AI responding correctly');
      console.log(`   🤖 Using: ${result.context.model}`);
      console.log(`   💬 Response: ${result.response.substring(0, 100)}...`);
    } else {
      console.log('   ❌ AI error:', result.error);
    }
  } catch (error) {
    console.log('   ❌ AI test failed:', error.message);
  }

  // Cleanup
  await mongoose.disconnect();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ System check complete!\n');
  process.exit(0);
}

quickTest().catch(error => {
  console.error('\n❌ System check failed:', error);
  process.exit(1);
});
