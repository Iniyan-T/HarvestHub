/**
 * Test Script: Buyer-to-Farmer Request Flow
 * Tests the complete end-to-end functionality:
 * 1. Buyer sends a request with crop details, quantity, and offer price
 * 2. Request is saved to database
 * 3. Farmer retrieves all incoming requests
 * 4. Farmer can accept/deny requests
 */

const API_BASE = 'http://localhost:5000';

const TEST_FARMER_ID = '507f1f77bcf86cd799439011';
const TEST_BUYER_ID = 'buyer_001';

async function testBuyerSendRequest() {
  console.log('\n📮 TEST 1: Buyer sends a request');
  console.log('================================');

  const requestData = {
    farmerId: TEST_FARMER_ID,
    buyerId: TEST_BUYER_ID,
    buyerName: 'Rajesh Gupta',
    buyerContact: '+91 98765 43210',
    cropName: 'Wheat',
    requestedQuantity: 50,
    offerPrice: 2400,
    notes: 'Need high-quality wheat for commercial use'
  };

  try {
    const response = await fetch(`${API_BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Request created successfully');
      console.log(`📋 Request ID: ${data.data._id}`);
      console.log(`💰 Total Amount: ₹${data.data.totalAmount}`);
      return data.data._id;
    } else {
      console.log('❌ Failed to create request:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testFarmerViewRequests() {
  console.log('\n👨‍🌾 TEST 2: Farmer views incoming requests');
  console.log('=========================================');

  try {
    const response = await fetch(`${API_BASE}/api/requests/farmer/${TEST_FARMER_ID}`);
    const data = await response.json();

    if (data.success) {
      console.log(`✅ Found ${data.count} request(s)`);
      
      data.data.forEach((req, index) => {
        console.log(`\n  Request ${index + 1}:`);
        console.log(`  - Buyer: ${req.buyerName}`);
        console.log(`  - Contact: ${req.buyerContact}`);
        console.log(`  - Crop: ${req.cropName}`);
        console.log(`  - Quantity: ${req.requestedQuantity} quintals`);
        console.log(`  - Offer Price: ₹${req.offerPrice}/quintal`);
        console.log(`  - Total Amount: ₹${req.totalAmount}`);
        console.log(`  - Status: ${req.status}`);
      });

      return data.data[0]?._id;
    } else {
      console.log('❌ Failed to fetch requests:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testFarmerAcceptRequest(requestId) {
  console.log('\n✅ TEST 3: Farmer accepts a request');
  console.log('====================================');

  try {
    const response = await fetch(`${API_BASE}/api/requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Request accepted successfully');
      console.log(`📋 Updated Status: ${data.data.status}`);
      return true;
    } else {
      console.log('❌ Failed to accept request:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testFarmerDenyRequest(requestId) {
  console.log('\n❌ TEST 4: Farmer denies a request');
  console.log('===================================');

  // First, create another request to deny
  console.log('   (Creating a new request to deny...)');

  const requestData = {
    farmerId: TEST_FARMER_ID,
    buyerId: 'buyer_002',
    buyerName: 'Priya Sharma',
    buyerContact: '+91 87654 32109',
    cropName: 'Rice',
    requestedQuantity: 30,
    offerPrice: 3000,
    notes: 'Urgent requirement'
  };

  try {
    let createResponse = await fetch(`${API_BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    let createData = await createResponse.json();
    if (!createData.success) {
      console.log('   ❌ Failed to create request for denial test');
      return;
    }

    const newRequestId = createData.data._id;

    const response = await fetch(`${API_BASE}/api/requests/${newRequestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'denied' })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Request denied successfully');
      console.log(`📋 Updated Status: ${data.data.status}`);
    } else {
      console.log('❌ Failed to deny request:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 BUYER-TO-FARMER REQUEST FLOW TEST SUITE');
  console.log('==========================================\n');

  // Test 1: Buyer sends request
  const requestId = await testBuyerSendRequest();
  if (!requestId) {
    console.log('\n⚠️ Stopping tests - failed to create request');
    return;
  }

  // Test 2: Farmer views requests
  const firstRequestId = await testFarmerViewRequests();

  // Test 3: Farmer accepts request
  if (firstRequestId) {
    await testFarmerAcceptRequest(firstRequestId);
  }

  // Test 4: Farmer denies request
  await testFarmerDenyRequest(null);

  console.log('\n✅ TEST SUITE COMPLETE');
  console.log('======================\n');
}

// Run tests
runAllTests().catch(console.error);
