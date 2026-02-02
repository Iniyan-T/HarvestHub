#!/usr/bin/env node

console.log('\n🚀 HarvestHub Backend Startup\n');
console.log('='.repeat(50));

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js: ${nodeVersion}`);

// Check for required modules
try {
  require('express');
  console.log('✅ Dependencies installed');
} catch (e) {
  console.log('❌ Dependencies not installed. Run: npm install');
  process.exit(1);
}

// Check environment variables
require('dotenv').config();

const requiredEnvVars = ['MONGODB_URI'];
const optionalEnvVars = ['USE_OLLAMA', 'GEMINI_CHAT_API_KEY', 'OLLAMA_MODEL'];

console.log('\n📋 Environment Configuration:');
requiredEnvVars.forEach(key => {
  if (process.env[key]) {
    console.log(`✅ ${key}: Configured`);
  } else {
    console.log(`⚠️  ${key}: Missing (using default)`);
  }
});

optionalEnvVars.forEach(key => {
  if (process.env[key]) {
    if (key === 'USE_OLLAMA') {
      console.log(`✅ ${key}: ${process.env[key]}`);
    } else {
      console.log(`✅ ${key}: Configured`);
    }
  } else {
    console.log(`ℹ️  ${key}: Not set`);
  }
});

console.log('\n🤖 AI Configuration:');
if (process.env.USE_OLLAMA === 'true') {
  console.log('   Primary: Ollama (local)');
  console.log('   Fallback: Gemini');
  console.log(`   Model: ${process.env.OLLAMA_MODEL || 'llama3.2'}`);
} else {
  console.log('   Primary: Gemini');
  console.log('   Ollama: Disabled');
}

console.log('\n='.repeat(50));
console.log('\n🌟 Starting server...\n');

// Start the actual server
require('./server.js');
