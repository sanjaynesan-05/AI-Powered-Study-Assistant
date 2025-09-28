const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Import AI routes
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AI Study Assistant Backend is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT, timestamp: new Date().toISOString() });
});

// Mount AI routes
app.use('/api/ai', aiRoutes);

// Legacy endpoint for backward compatibility
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required',
        success: false 
      });
    }

    // Redirect to new AI service
    const geminiService = require('./src/services/geminiService');
    const result = await geminiService.generateStudyResponse(message, 'General');
    
    res.json({
      reply: result.message,
      success: result.success,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('Legacy AI Chat Error:', error);
    
    res.json({
      reply: "I'm having trouble right now, but I'm still here to help! Please try again. 🤖📚",
      success: true,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 AI Study Assistant Backend ready!`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: POST http://localhost:${PORT}/api/ai-chat`);
});

module.exports = app;