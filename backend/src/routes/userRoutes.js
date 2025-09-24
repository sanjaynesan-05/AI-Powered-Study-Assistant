const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Register and get all users
router.route('/')
  .post(registerUser)
  .get(protect, admin, getUsers);

// Login routes
router.post('/login', loginUser);

// Test route for Google auth setup
// router.get('/google-auth-test', (req, res) => {
//   res.json({ 
//     status: 'ok',
//     message: 'Google auth test route is working',
//     googleClientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
//     requestOrigin: req.headers.origin || 'No origin header',
//     corsSettings: {
//       allowedOrigins: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
//       currentOrigin: req.headers.origin
//     }
//   });
// });

// User profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
