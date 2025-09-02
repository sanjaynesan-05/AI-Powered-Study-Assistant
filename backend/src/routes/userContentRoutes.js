const express = require('express');
const router = express.Router();
const { protect, admin, ownerOnly } = require('../middleware/authMiddleware');

const {
  createContent,
  getUserContentByType,
  getContentById,
  updateContent,
  deleteContent,
  shareContent,
  getSharedContent,
} = require('../controllers/userContentController');

// Create new content
router.post('/', protect, createContent);

// Get content by type
router.get('/:contentType', protect, getUserContentByType);

// Get shared content
router.get('/shared', protect, getSharedContent);

// Get, update, and delete specific content
router.route('/item/:id')
  .get(protect, getContentById)
  .put(protect, updateContent)
  .delete(protect, deleteContent);

// Share content with other users
router.put('/item/:id/share', protect, shareContent);

module.exports = router;
