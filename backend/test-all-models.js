const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

async function testAllModels() {
  console.log('🔍 Testing all possible Gemini model variations...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Comprehensive list of model names to try
  const modelNames = [
    // Latest 2.0 models
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    
    // 1.5 series with various endings
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001", 
    "gemini-1.5-flash",
    
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro-002",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro",
    
    // Older stable models
    "gemini-1.0-pro-latest",
    "gemini-1.0-pro-001",
    "gemini-1.0-pro",
    "gemini-pro",
    
    // Alternative naming
    "models/gemini-1.5-flash",
    "models/gemini-pro"
  ];

  const workingModels = [];
  const failedModels = [];

  for (const modelName of modelNames) {
    try {
      console.log(`📋 Testing model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100, // Small response for testing
        }
      });

      const result = await model.generateContent("Say 'Hello, I am working!' in a friendly way.");
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        console.log(`✅ SUCCESS: ${modelName} - Response: "${text.substring(0, 50)}..."`);
        workingModels.push(modelName);
        break; // Stop at first working model for this test
      } else {
        throw new Error('Empty response');
      }

    } catch (error) {
      console.log(`❌ FAILED: ${modelName} - ${error.message.substring(0, 100)}...`);
      failedModels.push({ model: modelName, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS:');
  console.log('='.repeat(60));
  
  if (workingModels.length > 0) {
    console.log(`✅ Working models (${workingModels.length}):`);
    workingModels.forEach(model => console.log(`   - ${model}`));
  } else {
    console.log('❌ No working models found');
  }

  console.log(`\n❌ Failed models (${failedModels.length}):`);
  failedModels.slice(0, 5).forEach(item => {
    console.log(`   - ${item.model}: ${item.error.substring(0, 80)}...`);
  });

  return { workingModels, failedModels };
}

// Run the comprehensive test
testAllModels().then(result => {
  if (result.workingModels.length > 0) {
    console.log('\n🎉 Found working model(s)! Your integration should work.');
  } else {
    console.log('\n💥 No models are working. Check your API key or try a different key.');
  }
});