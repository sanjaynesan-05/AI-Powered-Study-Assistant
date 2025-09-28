const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gemini AI Service for the Study Assistant
 * Handles all communication with Google's Gemini AI API
 * 
 * Setup: Add GEMINI_API_KEY to your .env file
 * Get your API key from: https://makersuite.google.com/app/apikey
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    
    // Initialize the service
    this.initialize();
  }

  /**
   * Initialize the Gemini AI client
   */
  initialize() {
    try {
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }

      this.genAI = new GoogleGenerativeAI(this.apiKey);
      
      // Try multiple supported model names to find one that works
      const modelNames = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash"
      ];
      
      // For now, we'll set this as initialized and test during actual API call
      this.modelName = "gemini-2.0-flash-exp"; // Start with confirmed working model
      this.isInitialized = true;
      console.log('✅ Gemini AI Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI Service:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Generate AI response for study assistance
   * @param {string} prompt - User's question or prompt
   * @param {string} topic - Optional topic context
   * @returns {Promise<Object>} Response object with success status and message
   */
  async generateStudyResponse(prompt, topic = 'General') {
    try {
      // Check if service is initialized
      if (!this.isInitialized) {
        throw new Error('Gemini AI Service not initialized properly');
      }

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        throw new Error('Valid prompt is required');
      }

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
          console.log(`🔄 Trying model: ${modelName}`);
          
          const model = this.genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topK: 1,
              topP: 1,
              maxOutputTokens: 2048,
            }
          });

          // Create study buddy context
          const studyContext = `You are an AI Study Assistant and learning companion. Your role is to:
- Provide clear, helpful explanations in a friendly tone
- Break down complex topics into digestible parts
- Give practical examples and actionable advice
- Encourage continuous learning and growth
- Adapt explanations to different learning levels

Topic Context: ${topic}
Student Question: ${prompt.trim()}

Please provide a helpful, encouraging response:`;

          console.log(`🤖 Generating response for topic: ${topic} using ${modelName}`);
          
          // Generate content using Gemini
          const result = await model.generateContent(studyContext);
          const response = await result.response;
          const text = response.text();

          if (!text || text.trim().length === 0) {
            throw new Error('Empty response from Gemini AI');
          }

          console.log(`✅ Successfully generated AI response with ${modelName}`);
          
          return {
            success: true,
            message: text.trim(),
            topic: topic,
            timestamp: new Date().toISOString(),
            model: modelName
          };

        } catch (error) {
          console.log(`❌ Model ${modelName} failed: ${error.message}`);
          lastError = error;
          continue; // Try next model
        }
      }

      // If all models failed, throw the last error
      throw lastError || new Error('All model attempts failed');

    } catch (error) {
      console.error('❌ Gemini AI Error:', error.message);
      
      // Return user-friendly error response
      return {
        success: false,
        message: this.getErrorFallbackMessage(error),
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get user-friendly error fallback message
   * @param {Error} error - The original error
   * @returns {string} User-friendly error message
   */
  getErrorFallbackMessage(error) {
    // If Gemini is not available, provide a helpful study response
    if (error.message.includes('404') || error.message.includes('not found')) {
      return this.generateMockStudyResponse();
    }
    
    if (error.message.includes('API key')) {
      return "🔑 I'm having trouble with my API configuration. Please check that the API key is properly set up.";
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      return "⏰ I'm currently experiencing high demand. Please try again in a few moments!";
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return "🌐 I'm having connectivity issues. Please check your internet connection and try again.";
    }
    
    // If all else fails, provide helpful study content
    return this.generateMockStudyResponse();
  }

  /**
   * Generate a helpful mock response when Gemini is unavailable
   * @returns {string} Helpful study advice
   */
  generateMockStudyResponse() {
    const studyTips = [
      `📚 Great question! While I'm having some technical difficulties connecting to my AI brain, I can still help you! Here's some general study advice:

✨ **Active Learning Tips:**
- Break down complex topics into smaller, manageable chunks
- Use the Feynman Technique: explain concepts in simple terms
- Practice spaced repetition to improve retention
- Create mind maps to visualize connections between ideas

🎯 **Study Strategies:**
- Set specific, achievable learning goals
- Use the Pomodoro Technique (25 min study + 5 min break)
- Find your optimal learning time (morning vs evening)
- Join study groups or find a study buddy

💡 **Remember:** Learning is a journey, not a destination. Every expert was once a beginner! Keep practicing and stay curious. 

What specific topic would you like to explore next?`,

      `🤖 I'm experiencing some connectivity issues, but I'm still here to help you learn! Here are some valuable insights:

🚀 **Programming Learning Path:**
- Start with fundamentals (variables, loops, functions)
- Build small projects to apply what you learn
- Read other people's code to see different approaches
- Don't be afraid to make mistakes - they're learning opportunities!

📖 **Effective Study Methods:**
- Use multiple learning resources (videos, books, tutorials)
- Practice coding regularly, even if just 15-30 minutes daily
- Join coding communities for support and feedback
- Document your learning journey in a blog or notes

🎯 **Career Development:**
- Build a portfolio showcasing your projects
- Network with other learners and professionals
- Stay updated with industry trends and technologies
- Consider contributing to open-source projects

Keep going! You're doing great, and every step forward is progress worth celebrating! 🎉`,

      `💭 I'm having some technical difficulties, but let me share some valuable learning wisdom with you:

🧠 **Learning Psychology:**
- Your brain learns best through repetition and active engagement
- Sleep and exercise significantly boost learning and memory
- Teaching others helps solidify your own understanding
- Embrace the "beginner's mind" - curiosity over perfection

📝 **Study Best Practices:**
- Take handwritten notes (improves retention by 23%)
- Use the Cornell Note-taking system
- Review material within 24 hours of first learning it
- Create flashcards for key concepts and terminology

🎨 **Make Learning Fun:**
- Gamify your learning with challenges and rewards
- Join online communities related to your interests
- Find real-world applications for what you're learning
- Celebrate small wins along the way

Remember: Learning is a superpower that no one can take away from you! What would you like to explore next? 🌟`
    ];

    return studyTips[Math.floor(Math.random() * studyTips.length)];
  }

  /**
   * Health check for the Gemini service
   * @returns {Object} Service health status
   */
  getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
module.exports = new GeminiService();