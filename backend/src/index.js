
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

// Health check
app.get('/', (req, res) => {
  res.send('API is running (in-memory backend)');
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

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Lightweight backend running on port ${PORT}`);
});
