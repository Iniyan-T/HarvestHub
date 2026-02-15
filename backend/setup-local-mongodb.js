/**
 * MongoDB Setup & Test Data Initialization
 * Initializes local MongoDB with test crops and price predictions
 * 
 * Usage:
 *   npm install mongoose dotenv
 *   node setup-local-mongodb.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to local MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/harvesthub';

console.log('\n' + '='.repeat(60));
console.log('🌾 HarvestHub - Local MongoDB Setup');
console.log('='.repeat(60));
console.log('\nConnecting to:', mongoUri);

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Get database
    const db = mongoose.connection.db;

    // Create test collections if they don't exist
    console.log('📦 Setting up collections...\n');

    // Create Crops Collection
    try {
      await db.createCollection('crops');
      console.log('✅ Crops collection created');
    } catch (e) {
      console.log('✅ Crops collection already exists');
    }

    // Create Users Collection
    try {
      await db.createCollection('users');
      console.log('✅ Users collection created');
    } catch (e) {
      console.log('✅ Users collection already exists');
    }

    // Create Price Predictions Collection
    try {
      await db.createCollection('pricepredictions');
      console.log('✅ Price Predictions collection created');
    } catch (e) {
      console.log('✅ Price Predictions collection already exists');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Database Setup Complete!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Start backend: npm run dev (in backend folder)');
    console.log('2. Initialize price data: npm run init-prices (in backend)');
    console.log('3. Start frontend: npm run dev (in Buyers folder)');
    console.log('4. Visit: http://localhost:5173/price-graph');
    console.log('\n' + '='.repeat(60) + '\n');

    mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', err.message);
    console.log('\nMake sure:');
    console.log('1. MongoDB is installed');
    console.log('2. MongoDB service is running');
    console.log('3. Port 27017 is available');
    console.log('\nStart MongoDB with:');
    console.log('  Windows: mongod');
    console.log('  Docker:  docker run -d -p 27017:27017 mongo');
    process.exit(1);
  });
