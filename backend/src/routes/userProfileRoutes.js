const express = require('express');
const router = express.Router();
const { protect, admin, ownerOnly } = require('../middleware/authMiddleware');

const {
  getUserProfileDetails,
  updateUserProfileDetails,
  deleteUserProfile,
} = require('../controllers/userProfileController');

// User profile details routes
router.route('/details')
  .get(protect, getUserProfileDetails)
  .put(protect, updateUserProfileDetails);

// Delete user profile
router.delete('/', protect, deleteUserProfile);

module.exports = router;
