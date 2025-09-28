const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API...');
    console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('📏 API Key length:', process.env.GEMINI_API_KEY?.length);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try different supported models until one works (using confirmed working models)
    const modelNames = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash"
    ];

    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`📋 Trying model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        });

        const prompt = "You are my friendly AI study buddy. Help me learn JavaScript basics in simple terms. Respond in a conversational way.";
        console.log(`📤 Sending request to Gemini using ${modelName}...`);

        const result = await model.generateContent(prompt);
        
        if (!result || !result.response) {
          throw new Error('Invalid response structure from Gemini');
        }
        
        const response = result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini');
        }

        console.log(`✅ Success! Gemini responded using ${modelName}:`);
        console.log('📝 Response:', text);
        
        return { success: true, response: text, model: modelName };

      } catch (error) {
        console.error(`❌ Model ${modelName} failed:`, error.message);
        lastError = error;
        continue; // Try next model
      }
    }

    // If all models failed, throw the last error
    throw lastError || new Error('All supported models failed');

  } catch (error) {
    console.error('❌ Gemini API Error Details:');
    console.error('🚨 Error message:', error.message);
    console.error('📊 Error status:', error.status);
    
    // Try to determine the actual issue
    if (error.status === 404) {
      console.error('🔍 Issue: Model not found. Your API key might not have access to this model.');
      console.error('💡 Solution: Check if your API key is valid and has proper permissions.');
    } else if (error.status === 401) {
      console.error('🔍 Issue: Authentication failed. API key might be invalid.');
    } else if (error.status === 403) {
      console.error('🔍 Issue: Access denied. API key might not have required permissions.');
    }
    
    return { success: false, error: error.message };
  }
}

// Run the test
console.log('🚀 Starting Gemini API test...\n');
testGemini().then(result => {
  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('🎉 Test completed successfully!');
    console.log(`✅ Your Gemini integration is working using model: ${result.model}!`);
  } else {
    console.log('💥 Test failed:', result.error);
    console.log('🔧 Check your API key and try again.');
  }
  console.log('='.repeat(50));
});
