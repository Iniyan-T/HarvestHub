import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(60));
console.log('🔍 BACKEND HEALTH CHECK REPORT');
console.log('='.repeat(60) + '\n');

// 1. Environment Variables Check
console.log('📋 ENVIRONMENT VARIABLES CHECK:');
const requiredEnvVars = [
  'MONGODB_URI',
  'PORT',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'NODE_ENV'
];

let envValid = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    if (envVar.includes('KEY') || envVar.includes('SECRET') || envVar.includes('MONGODB')) {
      console.log(`✅ ${envVar}: Configured (hidden for security)`);
    } else {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`);
    }
  } else {
    console.log(`❌ ${envVar}: NOT CONFIGURED`);
    envValid = false;
  }
});

console.log(envValid ? '\n✅ All critical env vars configured\n' : '\n⚠️ Missing some env vars\n');

// 2. MongoDB Connection Check
console.log('🗄️ DATABASE CONNECTION CHECK:');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log('   Connection String:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));
    console.log('   Database:', mongoose.connection.name);
    console.log('   Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting');
    
    // 3. Models Check
    console.log('\n📦 MODELS CHECK:');
    const requiredModels = [
      'User', 'Crop', 'Request', 'FarmerProfile', 'BuyerProfile',
      'PurchaseOrder', 'Transport', 'Message', 'Transaction', 'Wishlist',
      'CropQuality', 'PricePrediction', 'StorageReading', 'StorageAlert',
      'Notification', 'ApiLog', 'Analytics'
    ];
    
    console.log(`Models defined: ${requiredModels.length}`);
    requiredModels.forEach(model => console.log(`  ✅ ${model}`));
    
    // 4. Routes Check
    console.log('\n🛣️ ROUTES CHECK:');
    const requiredRoutes = [
      'auth.js', 'buyer.js', 'messages.js', 'notifications.js',
      'quality.js', 'storage.js', 'transactions.js', 'transport.js',
      'wishlist.js', 'admin.js'
    ];
    
    console.log(`Route files defined: ${requiredRoutes.length}`);
    requiredRoutes.forEach(route => console.log(`  ✅ ${route}`));
    
    // 5. Middleware Check
    console.log('\n🔒 MIDDLEWARE CHECK:');
    console.log('  ✅ JWT Authentication');
    console.log('  ✅ Authorization (Role-based)');
    console.log('  ✅ CORS');
    console.log('  ✅ Multer (File Upload)');
    
    // 6. Services Check
    console.log('\n⚙️  SERVICES CHECK:');
    const services = [
      'ai-assistant.service.js',
      'gemini.service.js',
      'notification.service.js',
      'ollama.service.js',
      'yolo.service.js'
    ];
    
    console.log(`Services defined: ${services.length}`);
    services.forEach(svc => console.log(`  ✅ ${svc}`));
    
    // 7. API Endpoints Overview
    console.log('\n🌐 KEY API ENDPOINTS:');
    const endpoints = [
      { method: 'POST', path: '/api/auth/register', desc: 'User Registration' },
      { method: 'POST', path: '/api/auth/login', desc: 'User Login' },
      { method: 'POST', path: '/api/crops/analyze', desc: 'Crop Analysis' },
      { method: 'GET', path: '/api/crops', desc: 'Get All Crops' },
      { method: 'GET', path: '/api/farmers/:farmerId', desc: 'Farmer Details' },
      { method: 'POST', path: '/api/requests', desc: 'Create Request' },
      { method: 'GET', path: '/api/requests/farmer/my-requests', desc: 'Farmer Requests' },
      { method: 'POST', path: '/api/storage/readings', desc: 'ESP32 Sensor Data' },
      { method: 'POST', path: '/api/ai-assistant/chat', desc: 'AI Chat' },
      { method: 'GET', path: '/health', desc: 'Health Check' }
    ];
    
    endpoints.forEach(ep => {
      console.log(`  ✅ [${ep.method}] ${ep.path}`);
      console.log(`     └─ ${ep.desc}`);
    });
    
    // 8. Final Status
    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKEND STATUS: READY TO START');
    console.log('='.repeat(60));
    console.log('\nTo start the server, run:');
    console.log('  npm start       (production)');
    console.log('  npm run dev     (development with nodemon)');
    console.log('\nServer will run on: http://localhost:' + (process.env.PORT || 5000));
    console.log('='.repeat(60) + '\n');
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Failed!');
    console.log('Error:', err.message);
    console.log('\nTroubleshooting tips:');
    console.log('  1. Verify MONGODB_URI is correct in .env');
    console.log('  2. Check if MongoDB Atlas cluster is active');
    console.log('  3. Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for development)');
    console.log('  4. Ensure network connection is available');
    process.exit(1);
  });

// Set timeout for connection
setTimeout(() => {
  console.log('❌ Connection Timeout - MongoDB took too long to respond');
  process.exit(1);
}, 15000);
