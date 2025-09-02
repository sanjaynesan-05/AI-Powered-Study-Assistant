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

// Login route
router.post('/login', loginUser);

// User profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
