const express = require('express');
const router = express.Router();
const {
  createResume,
  getResume,
  updateResume,
  deleteResume,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  generateResumePDF,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// Resume CRUD operations
router.route('/')
  .post(protect, createResume)
  .get(protect, getResume)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

// Generate PDF from resume
router.route('/generate-pdf')
  .get(protect, generateResumePDF);

// Education routes
router.route('/education')
  .post(protect, addEducation);

router.route('/education/:eduId')
  .put(protect, updateEducation)
  .delete(protect, deleteEducation);

// Experience routes
router.route('/experience')
  .post(protect, addExperience);

router.route('/experience/:expId')
  .put(protect, updateExperience)
  .delete(protect, deleteExperience);

module.exports = router;
