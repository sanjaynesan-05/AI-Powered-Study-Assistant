const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function testGeminiREST() {
  try {
    console.log('🔍 Testing Gemini API via REST...');
    console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);

    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: "You are my friendly AI study buddy. Help me learn JavaScript basics in simple terms. Just give a short response."
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    console.log('📤 Sending REST request to Gemini...');
    
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const text = response.data.candidates[0].content.parts[0].text;
      console.log('✅ Success! Gemini responded via REST:');
      console.log('📝 Response:', text);
      return { success: true, response: text };
    } else {
      throw new Error('Invalid response structure from Gemini REST API');
    }

  } catch (error) {
    console.error('❌ Gemini REST API Error:');
    console.error('🚨 Error message:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, error: error.message };
  }
}

// Install axios if not present
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
if (!packageJson.dependencies.axios) {
  console.log('⚠️ Installing axios...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { stdio: 'inherit' });
}

console.log('🚀 Starting Gemini REST API test...\n');
testGeminiREST().then(result => {
  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('🎉 REST API test completed successfully!');
    console.log('✅ Your Gemini REST integration is working!');
  } else {
    console.log('💥 REST API test failed:', result.error);
  }
  console.log('='.repeat(50));
});