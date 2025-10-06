const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Import database connection
const connectDB = require('./config/db');

// Import PostgreSQL routes
const userRoutes = require('./routes/userRoutesPG');
const progressRoutes = require('./routes/progressRoutesPG');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Connect to database
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'AI Study Assistant API (PostgreSQL) is running', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

// WebSocket functionality
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (userData) => {
    activeUsers.set(socket.id, userData);
    socket.join(`user_${userData.userId}`);
    console.log(`User ${userData.name} joined`);
    
    // Broadcast active users count
    io.emit('activeUsers', activeUsers.size);
  });

  // Handle AI chat messages
  socket.on('aiMessage', async (data) => {
    try {
      console.log('AI message received:', data);
      
      // Generate AI response using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are an AI study assistant. Help the student with: ${data.message}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Send response back to user
      socket.emit('aiResponse', {
        message: aiResponse,
        timestamp: new Date(),
        type: 'ai'
      });

    } catch (error) {
      console.error('AI processing error:', error);
      socket.emit('aiResponse', {
        message: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        type: 'error'
      });
    }
  });

  // Handle progress updates
  socket.on('progressUpdate', (data) => {
    console.log('Progress update:', data);
    
    // Broadcast to user's room
    socket.to(`user_${data.userId}`).emit('progressUpdated', data);
  });

  // Handle study session start
  socket.on('sessionStart', (data) => {
    console.log('Study session started:', data);
    
    // You can store session data in database here
    socket.emit('sessionStarted', {
      sessionId: `session_${Date.now()}`,
      startTime: new Date(),
      ...data
    });
  });

  // Handle study session end
  socket.on('sessionEnd', (data) => {
    console.log('Study session ended:', data);
    
    // Calculate session duration and save to database
    socket.emit('sessionEnded', {
      ...data,
      endTime: new Date()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    activeUsers.delete(socket.id);
    io.emit('activeUsers', activeUsers.size);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🗄️  Database: PostgreSQL`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});