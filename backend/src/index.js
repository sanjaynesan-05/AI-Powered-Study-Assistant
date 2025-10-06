
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
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Import database connection
const connectDB = require('./config/db');

// Import routes
const aiAgentRoutes = require('./routes/aiAgentRoutes');
const progressRoutes = require('./routes/progressRoutes');

// In-memory stores (for demo only)
const users = [
  { email: 'test@example.com', password: 'password123', name: 'Test User', id: 1 }
];
const profiles = [
  { id: 1, email: 'test@example.com', name: 'Test User', bio: 'This is a demo user profile.' }
];
const mentors = [
  { id: 1, name: 'Mentor One', expertise: 'AI', bio: 'Expert in AI and ML.' },
  { id: 2, name: 'Mentor Two', expertise: 'Web Dev', bio: 'Frontend and backend specialist.' }
];
const contents = [
  { id: 1, title: 'Intro to AI', type: 'article', description: 'Learn the basics of AI.' },
  { id: 2, title: 'React Crash Course', type: 'video', description: 'Quick start with React.' }
];
const learningPaths = [
  { id: 1, name: 'AI Path', steps: ['Intro to AI', 'Deep Learning', 'ML Projects'] },
  { id: 2, name: 'Web Dev Path', steps: ['HTML/CSS', 'JavaScript', 'React'] }
];

// Simple auth middleware for protected routes
const protect = (req, res, next) => {
  // For demo, just add a mock user to request
  req.user = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    skills: ['JavaScript', 'Python'],
    experience: 'intermediate',
    education: 'bachelor'
  };
  next();
};

// Health check
app.get('/', (req, res) => {
  res.send('AI-Powered Study Assistant API is running');
});

// Mount routes
app.use('/api/ai-agents', aiAgentRoutes);
app.use('/api', progressRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (userData) => {
    socket.userId = userData.userId;
    socket.join(`user_${userData.userId}`);
    console.log(`User ${userData.userId} authenticated`);
  });

  // Handle learning progress updates
  socket.on('progress_update', (data) => {
    // Broadcast to user's room
    io.to(`user_${socket.userId}`).emit('progress_updated', data);
  });

  // Handle AI interaction events
  socket.on('ai_interaction', (data) => {
    // Broadcast AI interaction to user's room
    io.to(`user_${socket.userId}`).emit('ai_response', data);
  });

  // Handle video watch events
  socket.on('video_watch', (data) => {
    // Broadcast video progress to user's room
    io.to(`user_${socket.userId}`).emit('video_progress_updated', data);
  });

  // Handle study session events
  socket.on('study_session_start', (data) => {
    io.to(`user_${socket.userId}`).emit('session_started', data);
  });

  socket.on('study_session_end', (data) => {
    io.to(`user_${socket.userId}`).emit('session_ended', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Simple login route (no DB, just demo)
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, message: 'Login successful', user: { email: user.email, name: user.name, id: user.id } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// User profile endpoint
app.get('/api/users/profile', (req, res) => {
  // For demo, always return the first profile
  res.json({ profile: profiles[0] });
});

// Content endpoint
app.get('/api/content', (req, res) => {
  res.json({ contents });
});

// Mentor endpoint
app.get('/api/mentor', (req, res) => {
  res.json({ mentors });
});

// Learning paths endpoint
app.get('/api/learning-paths', (req, res) => {
  res.json({ learningPaths });
});

// AI Chat endpoint - Real Gemini integration
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI Study Assistant and mentor helping students learn and grow. You provide:
    - Personalized learning guidance
    - Study tips and strategies
    - Subject-specific explanations
    - Career advice and mentoring
    - Motivational support
    
    Be encouraging, informative, and practical. Keep responses concise but helpful.
    
    Student's question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({ 
      response,
      timestamp: new Date().toISOString(),
      success: true 
    });
    
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      message: error.message,
      success: false 
    });
  }
});

// Smart learning recommendation endpoint
app.post('/api/smart-recommendations', async (req, res) => {
  try {
    const { userLevel, interests, goals } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `As an AI Study Assistant, provide 3 personalized learning recommendations for a student with:
    - Level: ${userLevel || 'beginner'}
    - Interests: ${interests || 'general'}
    - Goals: ${goals || 'skill development'}
    
    Format as JSON array with title, type, description, and difficulty for each recommendation.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse AI response as JSON, fallback to mock if failed
    let recommendations;
    try {
      recommendations = JSON.parse(response);
    } catch {
      recommendations = [
        { 
          title: 'Personalized Learning Path', 
          type: 'course', 
          difficulty: userLevel || 'beginner',
          description: 'Customized learning journey based on your goals'
        },
        { 
          title: 'Interactive Practice', 
          type: 'exercise', 
          difficulty: userLevel || 'beginner',
          description: 'Hands-on activities to reinforce learning'
        },
        { 
          title: 'Mentorship Session', 
          type: 'mentoring', 
          difficulty: 'all levels',
          description: 'One-on-one guidance for your specific needs'
        }
      ];
    }
    
    res.json({ recommendations, success: true });
    
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      success: false 
    });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`AI-Powered Study Assistant backend running on port ${PORT}`);
  console.log(`WebSocket server enabled`);
});
