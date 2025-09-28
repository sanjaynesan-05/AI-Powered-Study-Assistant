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
   * Generate AI response for study assistance with retry logic
   * @param {string} prompt - User's question or prompt
   * @param {string} topic - Optional topic context
   * @returns {Promise<Object>} Response object with success status and message
   */
  async generateStudyResponse(prompt, topic = 'General', retryCount = 0) {
    const maxRetries = 2;
    const baseDelay = 1000; // 1 second

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
          console.log(`🔄 Trying model: ${modelName} (attempt ${retryCount + 1})`);
          
          const model = this.genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topK: 1,
              topP: 1,
              maxOutputTokens: 2048,
            }
          });

          // Create study buddy context with enhanced formatting instructions
          const studyContext = `You are an AI Study Assistant and learning companion. Your role is to:
- Provide clear, helpful explanations in a friendly, encouraging tone
- Break down complex topics into digestible, well-organized sections
- Give practical examples and actionable advice with step-by-step guidance
- Encourage continuous learning and growth
- Adapt explanations to different learning levels
- Use emojis and formatting to make responses engaging and scannable

FORMATTING GUIDELINES:
- Start major sections with relevant emojis (📚, ✨, 🎯, 💡, 🚀, 📖, 🧠, 📝, 🎨, etc.)
- Use **bold text** for important concepts and key terms
- Use bullet points (-) for lists and actionable items
- Use numbered lists (1., 2., 3.) for sequential steps
- Use \`code blocks\` for technical terms, commands, or code snippets
- Use triple backticks for multi-line code examples
- Keep paragraphs concise and focused (2-3 sentences max)
- Include practical examples when relevant

Topic Context: ${topic}
Student Question: ${prompt.trim()}

Please provide a well-structured, engaging response with clear sections and formatting:`;

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

          // If it's a 503 error and we haven't reached max retries, wait and retry
          if (error.message.includes('503') && retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.generateStudyResponse(prompt, topic, retryCount + 1);
          }
          
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
    // Check for service unavailable (503) errors
    if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
      return "🌐 **Google's Gemini AI is temporarily experiencing high demand.** Don't worry - this happens sometimes!\n\n" + this.generateMockStudyResponse();
    }

    // If Gemini is not available, provide a helpful study response
    if (error.message.includes('404') || error.message.includes('not found')) {
      return this.generateMockStudyResponse();
    }
    
    if (error.message.includes('API key')) {
      return "🔑 **I'm having trouble with my API configuration.** Please check that the API key is properly set up.\n\n" + this.generateMockStudyResponse();
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      return "⏰ **I'm currently experiencing high demand.** Please try again in a few moments!\n\n" + this.generateMockStudyResponse();
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return "🌐 **I'm having connectivity issues.** Please check your internet connection and try again.\n\n" + this.generateMockStudyResponse();
    }
    
    // If all else fails, provide helpful study content
    return "🤖 **I'm experiencing some technical difficulties, but I'm still here to help!**\n\n" + this.generateMockStudyResponse();
  }

  /**
   * Generate a helpful mock response when Gemini is unavailable
   * @returns {string} Helpful study advice
   */
  generateMockStudyResponse() {
    const studyTips = [
      `📚 **Great question!** While I'm having some technical difficulties connecting to my AI brain, I can still help you learn! 

✨ **Active Learning Techniques:**
- Break down complex topics into smaller, manageable chunks
- Use the **Feynman Technique**: explain concepts in simple terms
- Practice **spaced repetition** to improve long-term retention
- Create mind maps to visualize connections between ideas

🎯 **Proven Study Strategies:**
- Set specific, achievable learning goals each day
- Use the **Pomodoro Technique** (25 min study + 5 min break)
- Find your optimal learning time (morning vs evening person?)
- Join study groups or find a study buddy for accountability

💡 **Pro Tips for Success:**
- Learning is a journey, not a destination
- Every expert was once a beginner
- Mistakes are learning opportunities in disguise
- Stay curious and ask lots of questions

What specific topic would you like to explore next? I'm here to help! 🚀`,

      `🤖 **I'm experiencing some connectivity issues**, but I'm still here to support your learning journey!

🚀 **Programming Learning Path:**
- **Start with fundamentals**: variables, loops, functions, data structures
- **Build small projects** to apply what you learn immediately  
- **Read other people's code** to see different approaches and patterns
- **Don't fear mistakes** - they're your best teachers!

📖 **Effective Study Methods:**
- Use **multiple learning resources** (videos, books, interactive tutorials)
- **Practice coding daily**, even if just 15-30 minutes
- **Join coding communities** for support, feedback, and networking
- **Document your journey** in a blog or personal notes

🎯 **Career Development Strategy:**
- **Build a portfolio** showcasing your best projects
- **Network actively** with other learners and professionals
- **Stay updated** with industry trends and emerging technologies
- **Contribute to open-source** projects to gain real-world experience

Keep going! You're doing amazing, and every step forward is progress worth celebrating! 🎉`,

      `💭 **I'm having some technical difficulties**, but let me share some valuable learning wisdom:

🧠 **Learning Psychology Insights:**
- Your brain learns best through **repetition and active engagement**
- **Sleep and exercise** significantly boost learning and memory consolidation
- **Teaching others** helps solidify your own understanding
- Embrace the **"beginner's mind"** - curiosity over perfectionism

📝 **Study Best Practices:**
- **Take handwritten notes** (improves retention by 23%!)
- Use the **Cornell Note-taking System** for organized learning
- **Review material within 24 hours** of first learning it
- Create **flashcards** for key concepts and terminology

🎨 **Make Learning Enjoyable:**
- **Gamify your learning** with challenges and personal rewards
- **Join online communities** related to your interests
- **Find real-world applications** for what you're studying
- **Celebrate small wins** along the way

Remember: **Learning is a superpower** that no one can ever take away from you! What would you like to explore next? 🌟`
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