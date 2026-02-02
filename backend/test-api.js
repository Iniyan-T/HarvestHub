async function testAPI() {
  console.log('\n🧪 Testing HarvestHub AI Chatbot API\n');
  console.log('='.repeat(50));

  try {
    const response = await fetch('http://localhost:5000/api/ai-assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'I have 100kg of Grade A tomatoes. What price should I set?',
        userId: 'test_farmer_api',
        userType: 'farmer'
      })
    });

    const data = await response.json();

    console.log('\n📊 API Response:\n');
    console.log(`Success: ${data.success ? '✅' : '❌'}`);
    console.log(`Model Used: ${data.context?.model || 'unknown'}`);
    console.log(`Response Time: ${response.headers.get('x-response-time') || 'N/A'}`);
    
    console.log('\n🤖 AI Response:\n');
    console.log(data.response);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ API test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start\n');
  }
}

testAPI();
