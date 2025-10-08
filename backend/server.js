const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiRoutes = require('./src/routes/aiRoutes');
const aiAgentRoutes = require('./src/routes/aiAgentRoutes');
const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'AI Study Assistant Backend is running!' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT, timestamp: new Date().toISOString() });
});
app.use('/api/ai', aiRoutes);
app.use('/api/ai-agents', aiAgentRoutes);
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required',
        success: false 
      });
    }
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
app.listen(PORT, () => {
  console.log(`✅ Gemini AI Service initialized successfully`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 AI Study Assistant Backend ready!`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat API: POST http://localhost:${PORT}/api/ai/chat`);
  console.log(`🤖 AI Agents: http://localhost:${PORT}/api/ai-agents`);
});
module.exports = app;