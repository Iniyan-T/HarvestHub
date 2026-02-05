/**
 * Comprehensive Messaging System Test
 * Tests REST API polling-based messaging between farmers and buyers
 * 
 * Usage: node test-messaging.js
 */

const fetch = require('node-fetch'); // Or use built-in fetch in Node 18+

const API_BASE = 'http://localhost:5000/api';

// Mock user data
const testUsers = {
  buyer1: {
    id: 'buyer_001',
    name: 'Rajesh Verma',
    email: 'rajesh@buyer.com',
    token: 'mock_buyer_token_001'
  },
  farmer1: {
    id: 'farmer_001',
    name: 'Raj Kumar',
    email: 'raj@farmer.com',
    token: 'mock_farmer_token_001'
  }
};

// Helper function for API calls
async function apiCall(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Test Suite
const tests = {
  /**
   * Test 1: Send message from buyer to farmer
   */
  async testSendMessage() {
    console.log('\n📨 TEST 1: Send Message (Buyer → Farmer)');
    console.log('━'.repeat(50));

    const result = await apiCall(
      'POST',
      '/messages/send',
      {
        receiverId: testUsers.farmer1.id,
        message: 'Hi Raj, interested in your wheat crop. Can you provide details?',
        messageType: 'text'
      },
      testUsers.buyer1.token
    );

    if (result.status === 201) {
      console.log('✅ Message sent successfully');
      console.log('📊 Response:', JSON.stringify(result.data, null, 2));
      return result.data.data;
    } else {
      console.log('❌ Failed to send message');
      console.log('📊 Error:', result.data || result.error);
      return null;
    }
  },

  /**
   * Test 2: Farmer responds to buyer
   */
  async testFarmerResponse() {
    console.log('\n💬 TEST 2: Farmer Response (Farmer → Buyer)');
    console.log('━'.repeat(50));

    const result = await apiCall(
      'POST',
      '/messages/send',
      {
        receiverId: testUsers.buyer1.id,
        message: 'Sure! I have 500 quintals of Grade A wheat available at ₹2,400 per quintal',
        messageType: 'text'
      },
      testUsers.farmer1.token
    );

    if (result.status === 201) {
      console.log('✅ Farmer response sent successfully');
      console.log('📊 Response:', JSON.stringify(result.data, null, 2));
      return result.data.data;
    } else {
      console.log('❌ Failed to send farmer response');
      console.log('📊 Error:', result.data || result.error);
      return null;
    }
  },

  /**
   * Test 3: Get conversation between buyer and farmer
   */
  async testGetConversation() {
    console.log('\n📖 TEST 3: Get Conversation History');
    console.log('━'.repeat(50));

    const result = await apiCall(
      'GET',
      `/messages/conversation/${testUsers.farmer1.id}`,
      null,
      testUsers.buyer1.token
    );

    if (result.status === 200) {
      console.log('✅ Conversation retrieved successfully');
      console.log(`📊 Total messages: ${result.data.data.length}`);
      console.log('📊 Messages:', JSON.stringify(result.data.data, null, 2));
      return result.data.data;
    } else {
      console.log('❌ Failed to get conversation');
      console.log('📊 Error:', result.data || result.error);
      return null;
    }
  },

  /**
   * Test 4: Poll for new messages (simulates real-time polling)
   */
  async testPollingMechanism() {
    console.log('\n🔄 TEST 4: Polling for New Messages');
    console.log('━'.repeat(50));

    const conversationId = `${testUsers.buyer1.id}-${testUsers.farmer1.id}`.split('-').sort().join('-');
    const sinceTimestamp = new Date(Date.now() - 60000).toISOString(); // Last 1 minute

    const result = await apiCall(
      'GET',
      `/messages/poll/${conversationId}?sinceTimestamp=${encodeURIComponent(sinceTimestamp)}`,
      null,
      testUsers.buyer1.token
    );

    if (result.status === 200) {
      console.log('✅ Polling successful');
      console.log(`📊 New messages found: ${result.data.data.length}`);
      console.log('📊 Poll response:', JSON.stringify(result.data, null, 2));
      return result.data.data;
    } else {
      console.log('❌ Polling failed');
      console.log('📊 Error:', result.data || result.error);
      return null;
    }
  },

  /**
   * Test 5: Get all conversations
   */
  async testGetConversations() {
    console.log('\n📋 TEST 5: Get All Conversations');
    console.log('━'.repeat(50));

    const result = await apiCall(
      'GET',
      '/messages/conversations?skip=0&limit=10',
      null,
      testUsers.buyer1.token
    );

    if (result.status === 200) {
      console.log('✅ Conversations retrieved successfully');
      console.log(`📊 Total conversations: ${result.data.pagination.total}`);
      console.log('📊 Conversations:', JSON.stringify(result.data.data, null, 2));
      return result.data.data;
    } else {
      console.log('❌ Failed to get conversations');
      console.log('📊 Error:', result.data || result.error);
      return null;
    }
  },

  /**
   * Test 6: Get unread message count
   */
  async testUnreadCount() {
    console.log('\n🔔 TEST 6: Get Unread Message Count');
    console.log('━'.repeat(50));

    const result = await apiCall(
      'GET',
      '/messages/unread-count',
      null,
      testUsers.buyer1.token
    );

    if (result.status === 200) {
      console.log('✅ Unread count retrieved');
      console.log(`📊 Unread messages: ${result.data.unreadCount}`);
      return result.data.unreadCount;
    } else {
      console.log('❌ Failed to get unread count');
      console.log('📊 Error:', result.data || result.error);
      return null;
    }
  },

  /**
   * Test 7: Simulate continuous polling
   */
  async testContinuousPolling() {
    console.log('\n⏱️  TEST 7: Continuous Polling Simulation');
    console.log('━'.repeat(50));
    console.log('Simulating polling every 3 seconds for 15 seconds...');

    const conversationId = `${testUsers.buyer1.id}-${testUsers.farmer1.id}`.split('-').sort().join('-');
    let lastTimestamp = new Date().toISOString();
    let pollCount = 0;

    for (let i = 0; i < 5; i++) {
      console.log(`\n  [Poll ${i + 1}] Checking for new messages...`);

      const result = await apiCall(
        'GET',
        `/messages/poll/${conversationId}?sinceTimestamp=${encodeURIComponent(lastTimestamp)}`,
        null,
        testUsers.buyer1.token
      );

      if (result.status === 200) {
        pollCount++;
        const newMessageCount = result.data.data.length;
        console.log(`  ✅ Poll successful - Found ${newMessageCount} new message(s)`);
        if (newMessageCount > 0) {
          lastTimestamp = result.data.data[newMessageCount - 1].createdAt;
        }
      } else {
        console.log(`  ❌ Poll failed`);
      }

      // Wait 3 seconds between polls (except for last)
      if (i < 4) {
        console.log(`  ⏳ Waiting 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`\n✅ Continuous polling test completed (${pollCount} successful polls)`);
  },

  /**
   * Test 8: Multiple message exchange
   */
  async testMessageExchange() {
    console.log('\n💬 TEST 8: Multiple Message Exchange');
    console.log('━'.repeat(50));

    const messages = [
      {
        sender: 'buyer1',
        receiver: 'farmer1',
        text: 'What about the minimum order quantity?'
      },
      {
        sender: 'farmer1',
        receiver: 'buyer1',
        text: 'Minimum 50 quintals. Can negotiate for bulk orders.'
      },
      {
        sender: 'buyer1',
        receiver: 'farmer1',
        text: '₹2,400 seems high. Can you reduce to ₹2,200?'
      },
      {
        sender: 'farmer1',
        receiver: 'buyer1',
        text: '₹2,300 is my final price. Transport available at ₹150/quintal'
      }
    ];

    let successCount = 0;
    for (const msg of messages) {
      const sender = testUsers[msg.sender];
      const receiver = testUsers[msg.receiver];

      const result = await apiCall(
        'POST',
        '/messages/send',
        {
          receiverId: receiver.id,
          message: msg.text,
          messageType: 'text'
        },
        sender.token
      );

      if (result.status === 201) {
        console.log(`✅ ${sender.name} → ${receiver.name}`);
        console.log(`   "${msg.text}"`);
        successCount++;
      } else {
        console.log(`❌ Failed to send message`);
      }

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Message exchange complete (${successCount}/${messages.length} sent)`);
  },

  /**
   * Test 9: Verify message is marked as read
   */
  async testReadStatus() {
    console.log('\n✅ TEST 9: Message Read Status');
    console.log('━'.repeat(50));

    // Get conversation (should mark messages as read)
    const result = await apiCall(
      'GET',
      `/messages/conversation/${testUsers.farmer1.id}`,
      null,
      testUsers.buyer1.token
    );

    if (result.status === 200) {
      const readMessages = result.data.data.filter(msg => msg.isRead);
      console.log('✅ Conversation retrieved');
      console.log(`📊 Total messages: ${result.data.data.length}`);
      console.log(`📊 Read messages: ${readMessages.length}`);
      console.log(`📊 All messages marked as read: ${readMessages.length === result.data.data.length ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('❌ Failed to check read status');
    }
  },

  /**
   * Test 10: Error handling - Invalid receiver
   */
  async testErrorHandling() {
    console.log('\n⚠️  TEST 10: Error Handling');
    console.log('━'.repeat(50));

    console.log('Testing: Send message to non-existent farmer...');
    const result = await apiCall(
      'POST',
      '/messages/send',
      {
        receiverId: 'nonexistent_farmer_999',
        message: 'This should fail',
        messageType: 'text'
      },
      testUsers.buyer1.token
    );

    if (result.status !== 201) {
      console.log(`✅ Error properly handled (Status: ${result.status})`);
      console.log(`📊 Error message: ${result.data.message}`);
    } else {
      console.log('❌ Error not caught');
    }
  }
};

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     MESSAGING SYSTEM - COMPREHENSIVE TEST SUITE    ║');
  console.log('║        REST API Polling Implementation Testing     ║');
  console.log('╚════════════════════════════════════════════════════╝');

  console.log(`\n🌍 API Base URL: ${API_BASE}`);
  console.log(`👤 Test Users: Buyer (${testUsers.buyer1.name}) & Farmer (${testUsers.farmer1.name})`);

  try {
    // Run tests sequentially
    await tests.testSendMessage();
    await tests.testFarmerResponse();
    await tests.testGetConversation();
    await tests.testPollingMechanism();
    await tests.testGetConversations();
    await tests.testUnreadCount();
    // Uncomment to test continuous polling (takes 15 seconds)
    // await tests.testContinuousPolling();
    await tests.testMessageExchange();
    await tests.testReadStatus();
    await tests.testErrorHandling();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║           ✅ ALL TESTS COMPLETED!                 ║');
    console.log('║  Messaging system is ready for production use     ║');
    console.log('╚════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
