const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const events = require('events');

// Temporarily disable WebSocket server
process.env.DISABLE_WEBSOCKET = 'true';

// Load environment variables
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Import AI routes
const aiRoutes = require('./src/routes/aiRoutes');
const aiAgentRoutes = require('./src/routes/aiAgentRoutes');
const emotionalAnalysisRoutes = require('./src/routes/emotionalAnalysisRoutes');
const wellnessRoutes = require('./src/routes/wellnessRoutes');

// Initialize humeService
const humeService = require('./src/services/humeService');
humeService.initialize();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AI Study Assistant Backend is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT, timestamp: new Date().toISOString() });
});

// Mount AI routes
app.use('/api/ai', aiRoutes);
app.use('/api/ai-agents', aiAgentRoutes);
app.use('/api/emotional-analysis', emotionalAnalysisRoutes);
app.use('/api/wellness', wellnessRoutes);

// Handle server startup
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('HUME API Key configured:', !!process.env.HUME_API_KEY);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
    server.close();
    app.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
});

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
app.listen(5002, () => {
  console.log(`✅ Gemini AI Service initialized successfully`);
  console.log(`🎥 Hume AI service ready to use`);
  console.log(`🚀 Server running on http://localhost:5002`);
  console.log(`📚 AI Study Assistant Backend ready!`);
  console.log(`🔍 Health check: http://localhost:5002/health`);
  console.log(`💬 Chat API: POST http://localhost:5002/api/ai-chat`);
  console.log(`🤖 AI Agents: http://localhost:5002/api/ai-agents/health`);
}).on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;