const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Updated CORS configuration to match frontend origin
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3001'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3001'); // Default to match frontend
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Use the request logger middleware
app.use(requestLogger);

// Import routes
const userRoutes = require('./routes/userRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const userContentRoutes = require('./routes/userContentRoutes');

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/users/profile', userProfileRoutes);
app.use('/api/content', userContentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/resume', resumeRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test route for checking CORS and connectivity
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test endpoint is working correctly',
    cors: {
      origin: req.headers.origin || 'No origin header',
      host: req.headers.host
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
