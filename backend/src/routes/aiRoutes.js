const express = require('express');
const geminiService = require('../services/geminiService');
const router = express.Router();

/**
 * AI Routes for Study Assistant
 * Handles all AI-related API endpoints
 */

/**
 * POST /api/ai/ask
 * Main endpoint for AI study assistance
 * 
 * Body parameters:
 * - prompt (required): User's question or request
 * - topic (optional): Subject context (e.g., "JavaScript", "Career Guidance")
 * 
 * Response:
 * - success: boolean indicating if request was successful
 * - message: AI response or error message
 * - topic: The topic context used
 * - timestamp: ISO timestamp of the response
 */
router.post('/ask', async (req, res) => {
  try {
    const { prompt, topic } = req.body;

    // Validate required parameters
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: prompt',
        message: 'Please provide a question or prompt for me to help you with! 🤔'
      });
    }

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt format',
        message: 'Your question seems to be empty. Could you please ask me something? 😊'
      });
    }

    // Optional topic validation
    const validTopic = topic && typeof topic === 'string' ? topic.trim() : 'General';

    console.log(`📚 AI Request - Topic: ${validTopic}, Prompt: "${prompt.substring(0, 50)}..."`);

    // Generate AI response using Gemini service
    const aiResponse = await geminiService.generateStudyResponse(prompt, validTopic);

    // Log the result
    if (aiResponse.success) {
      console.log('✅ AI response generated successfully');
    } else {
      console.log('⚠️ AI response generation failed:', aiResponse.error);
    }

    // Return response (success or failure)
    res.json({
      success: aiResponse.success,
      message: aiResponse.message,
      topic: validTopic,
      timestamp: aiResponse.timestamp,
      ...(aiResponse.error && { error: aiResponse.error })
    });

  } catch (error) {
    console.error('❌ AI Route Error:', error.message);

    // Return server error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '🔧 Something went wrong on our end. Please try again in a moment!',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/ai/health
 * Health check endpoint for the AI service
 */
router.get('/health', (req, res) => {
  try {
    const healthStatus = geminiService.getHealthStatus();
    
    res.json({
      service: 'AI Study Assistant',
      status: healthStatus.isInitialized ? 'healthy' : 'unhealthy',
      gemini: {
        initialized: healthStatus.isInitialized,
        hasApiKey: healthStatus.hasApiKey,
        apiKeyLength: healthStatus.apiKeyLength
      },
      timestamp: healthStatus.timestamp
    });
  } catch (error) {
    res.status(500).json({
      service: 'AI Study Assistant',
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/ai/topics
 * Get available study topics
 */
router.get('/topics', (req, res) => {
  const studyTopics = [
    'General',
    'Programming',
    'JavaScript',
    'Python',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Career Guidance',
    'Interview Preparation',
    'Resume Building',
    'Skill Development',
    'Project Ideas',
    'Study Techniques',
    'Time Management'
  ];

  res.json({
    success: true,
    topics: studyTopics,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;