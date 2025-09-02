const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const userRoutes = require('./routes/userRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/resume', resumeRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
