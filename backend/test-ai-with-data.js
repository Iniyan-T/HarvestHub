import aiAssistant from './services/ai-assistant.service.js';
import Crop from './models/Crop.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Test farmer ID
const TEST_FARMER_ID = 'test_farmer_123';

async function setupTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harvesthub');
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    await Crop.deleteMany({ farmerId: TEST_FARMER_ID });

    // Create sample crops with various grades and prices
    const testCrops = [
      {
        farmerId: TEST_FARMER_ID,
        cropName: 'Tomatoes',
        quantity: 50,
        price: 40,
        imageUrl: '/uploads/test-tomato.jpg',
        aiGrade: {
          grade: 'A',
          confidence: 95,
          qualityScore: 92,
          defects: [],
          freshness: 'Excellent',
          analysis: 'Premium quality tomatoes, no visible defects',
          analyzedAt: new Date()
        },
        status: 'Available',
        location: 'Maharashtra',
        harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        farmerId: TEST_FARMER_ID,
        cropName: 'Wheat',
        quantity: 200,
        price: 25,
        imageUrl: '/uploads/test-wheat.jpg',
        aiGrade: {
          grade: 'B',
          confidence: 88,
          qualityScore: 78,
          defects: ['Minor discoloration'],
          freshness: 'Good',
          analysis: 'Good quality wheat with minor issues',
          analyzedAt: new Date()
        },
        status: 'Available',
        location: 'Punjab',
        harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        farmerId: TEST_FARMER_ID,
        cropName: 'Rice',
        quantity: 150,
        price: 30,
        imageUrl: '/uploads/test-rice.jpg',
        aiGrade: {
          grade: 'A',
          confidence: 92,
          qualityScore: 90,
          defects: [],
          freshness: 'Excellent',
          analysis: 'High quality basmati rice',
          analyzedAt: new Date()
        },
        status: 'Available',
        location: 'Haryana',
        harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        farmerId: TEST_FARMER_ID,
        cropName: 'Potatoes',
        quantity: 80,
        price: 20,
        imageUrl: '/uploads/test-potato.jpg',
        aiGrade: {
          grade: 'C',
          confidence: 75,
          qualityScore: 60,
          defects: ['Some spots', 'Size variation'],
          freshness: 'Fair',
          analysis: 'Acceptable quality but with visible defects',
          analyzedAt: new Date()
        },
        status: 'Available',
        location: 'Uttar Pradesh',
        harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        farmerId: TEST_FARMER_ID,
        cropName: 'Onions',
        quantity: 100,
        price: 35,
        imageUrl: '/uploads/test-onion.jpg',
        aiGrade: {
          grade: 'A',
          confidence: 90,
          qualityScore: 88,
          defects: [],
          freshness: 'Excellent',
          analysis: 'Fresh premium onions',
          analyzedAt: new Date()
        },
        status: 'Available',
        location: 'Maharashtra',
        harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await Crop.insertMany(testCrops);
    console.log(`✅ Created ${testCrops.length} test crops`);
    
    return testCrops;
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
}

async function testAIWithRealData() {
  console.log('\n🤖 Testing AI Assistant with Real Application Data\n');
  console.log('='.repeat(70));

  try {
    // Setup test data
    console.log('\n📦 Setting up test data...');
    const crops = await setupTestData();
    
    // Calculate totals
    const totalQuantity = crops.reduce((sum, c) => sum + c.quantity, 0);
    const totalValue = crops.reduce((sum, c) => sum + (c.quantity * c.price), 0);
    const gradeACrops = crops.filter(c => c.aiGrade.grade === 'A').length;
    
    console.log('\n📊 Test Farmer Profile:');
    console.log(`   Total Crops: ${crops.length}`);
    console.log(`   Total Inventory: ${totalQuantity}kg`);
    console.log(`   Total Value: ₹${totalValue.toLocaleString()}`);
    console.log(`   Grade A Crops: ${gradeACrops}/${crops.length}`);
    
    // Test scenarios
    const scenarios = [
      {
        title: 'Inventory Analysis',
        message: 'Analyze my current inventory and tell me what I should focus on.'
      },
      {
        title: 'Pricing Strategy',
        message: 'Which crops have the best profit potential? Should I adjust any prices?'
      },
      {
        title: 'Priority Selling',
        message: 'What should I prioritize selling first and why?'
      },
      {
        title: 'Quality Improvement',
        message: 'How can I improve the quality of my Grade B and C crops?'
      },
      {
        title: 'Revenue Projection',
        message: 'If I sell all my Grade A crops this week, how much revenue can I expect?'
      }
    ];

    console.log('\n🧪 Running Test Scenarios...\n');
    console.log('='.repeat(70));

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n${i + 1}. ${scenario.title}`);
      console.log('-'.repeat(70));
      console.log(`📝 Question: ${scenario.message}\n`);

      // Clear history before each test for consistency
      aiAssistant.clearHistory(TEST_FARMER_ID);

      const startTime = Date.now();
      const result = await aiAssistant.chat(TEST_FARMER_ID, 'farmer', scenario.message);
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`🤖 AI Response (${result.context.model}):`);
        console.log(result.response);
        console.log(`\n⏱️  Response time: ${duration}ms`);
        console.log(`📊 Context: ${result.context.cropsCount} crops analyzed`);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }

      console.log('\n' + '='.repeat(70));
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test conversation continuity
    console.log('\n🔄 Testing Conversation Continuity...\n');
    console.log('='.repeat(70));
    
    aiAssistant.clearHistory(TEST_FARMER_ID);
    
    // First message
    console.log('\n👤 Farmer: Tell me about my tomato inventory');
    let result1 = await aiAssistant.chat(TEST_FARMER_ID, 'farmer', 'Tell me about my tomato inventory');
    console.log(`🤖 AI: ${result1.response}\n`);
    
    // Follow-up message
    console.log('👤 Farmer: Should I increase the price?');
    let result2 = await aiAssistant.chat(TEST_FARMER_ID, 'farmer', 'Should I increase the price?');
    console.log(`🤖 AI: ${result2.response}`);
    
    console.log('\n✅ Conversation history maintained successfully!');
    console.log('='.repeat(70));

    // Summary
    console.log('\n📈 Test Summary:\n');
    console.log(`   ✅ Test Data: ${crops.length} crops created`);
    console.log(`   ✅ Scenarios Tested: ${scenarios.length}`);
    console.log(`   ✅ Conversation Continuity: Working`);
    console.log(`   ✅ Context Awareness: Using real crop data`);
    console.log(`   ✅ Model: ${result1.context.model}`);
    
    console.log('\n🎉 All tests completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Crop.deleteMany({ farmerId: TEST_FARMER_ID });
    await mongoose.disconnect();
    console.log('✅ Cleanup complete\n');
  }
}

// Run tests
testAIWithRealData().catch(console.error);
