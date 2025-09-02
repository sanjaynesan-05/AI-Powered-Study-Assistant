const express = require('express');
const router = express.Router();
const {
  createMentorSession,
  getMentorSessions,
  getMentorSessionById,
  updateMentorSession,
  deleteMentorSession,
  addConversation,
  updateConversation,
  addFeedback,
} = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');

// Session routes
router.route('/sessions')
  .post(protect, createMentorSession)
  .get(protect, getMentorSessions);

router.route('/sessions/:id')
  .get(protect, getMentorSessionById)
  .put(protect, updateMentorSession)
  .delete(protect, deleteMentorSession);

// Conversation routes
router.route('/sessions/:id/conversations')
  .post(protect, addConversation);

router.route('/sessions/:id/conversations/:conversationId')
  .put(protect, updateConversation);

// Feedback route
router.route('/sessions/:id/feedback')
  .post(protect, addFeedback);

module.exports = router;
