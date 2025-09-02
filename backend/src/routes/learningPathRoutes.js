const express = require('express');
const router = express.Router();
const {
  createLearningPath,
  getLearningPaths,
  getLearningPathById,
  updateLearningPath,
  deleteLearningPath,
  updateStepStatus,
  getUserLearningPaths,
} = require('../controllers/learningPathController');
const { protect } = require('../middleware/authMiddleware');

// Get all learning paths and create new one
router.route('/')
  .get(getLearningPaths)
  .post(protect, createLearningPath);

// Get user's learning paths
router.route('/my')
  .get(protect, getUserLearningPaths);

// Get, update, and delete specific learning path
router.route('/:id')
  .get(getLearningPathById)
  .put(protect, updateLearningPath)
  .delete(protect, deleteLearningPath);

// Update step completion status
router.route('/:id/steps/:stepId')
  .put(protect, updateStepStatus);

module.exports = router;
