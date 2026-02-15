import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...');
console.log('Connection String:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password for security

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Connection Status:', mongoose.connection.readyState); // 1 = connected
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', err.message);
    process.exit(1);
  });

// Set timeout to prevent hanging
setTimeout(() => {
  console.error('❌ Connection Timeout - MongoDB took too long to respond');
  process.exit(1);
}, 10000);
