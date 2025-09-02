const MentorSession = require('../models/mentorModel');

// @desc    Create a new mentor session
// @route   POST /api/mentor/sessions
// @access  Private
const createMentorSession = async (req, res) => {
  try {
    const { title, topic } = req.body;
    
    const session = await MentorSession.create({
      user: req.user._id,
      title,
      topic,
    });
    
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all user's mentor sessions
// @route   GET /api/mentor/sessions
// @access  Private
const getMentorSessions = async (req, res) => {
  try {
    const sessions = await MentorSession.find({ user: req.user._id })
      .sort({ updatedAt: -1 });
      
    res.json(sessions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get mentor session by ID
// @route   GET /api/mentor/sessions/:id
// @access  Private
const getMentorSessionById = async (req, res) => {
  try {
    const session = await MentorSession.findById(req.params.id);
    
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }
    
    // Check if user owns this session
    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this session');
    }
    
    res.json(session);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update mentor session
// @route   PUT /api/mentor/sessions/:id
// @access  Private
const updateMentorSession = async (req, res) => {
  try {
    const { title, topic } = req.body;
    
    const session = await MentorSession.findById(req.params.id);
    
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }
    
    // Check if user owns this session
    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this session');
    }
    
    session.title = title || session.title;
    session.topic = topic || session.topic;
    
    const updatedSession = await session.save();
    
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete mentor session
// @route   DELETE /api/mentor/sessions/:id
// @access  Private
const deleteMentorSession = async (req, res) => {
  try {
    const session = await MentorSession.findById(req.params.id);
    
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }
    
    // Check if user owns this session
    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this session');
    }
    
    await session.remove();
    
    res.json({ message: 'Session removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add conversation to session
// @route   POST /api/mentor/sessions/:id/conversations
// @access  Private
const addConversation = async (req, res) => {
  try {
    const { user: userMessage, mentor: mentorResponse } = req.body;
    
    if (!userMessage) {
      res.status(400);
      throw new Error('User message is required');
    }
    
    const session = await MentorSession.findById(req.params.id);
    
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }
    
    // Check if user owns this session
    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this session');
    }
    
    // Add conversation to session
    session.conversations.push({
      user: userMessage,
      mentor: mentorResponse || "Processing your request...", // Default message if no response yet
    });
    
    const updatedSession = await session.save();
    
    res.status(201).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update conversation in session
// @route   PUT /api/mentor/sessions/:id/conversations/:conversationId
// @access  Private
const updateConversation = async (req, res) => {
  try {
    const { mentor: mentorResponse } = req.body;
    
    if (!mentorResponse) {
      res.status(400);
      throw new Error('Mentor response is required');
    }
    
    const session = await MentorSession.findById(req.params.id);
    
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }
    
    // Check if user owns this session
    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this session');
    }
    
    // Find conversation in session
    const conversationIndex = session.conversations.findIndex(
      (conv) => conv._id.toString() === req.params.conversationId
    );
    
    if (conversationIndex === -1) {
      res.status(404);
      throw new Error('Conversation not found');
    }
    
    // Update mentor response
    session.conversations[conversationIndex].mentor = mentorResponse;
    
    const updatedSession = await session.save();
    
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add feedback to session
// @route   POST /api/mentor/sessions/:id/feedback
// @access  Private
const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating) {
      res.status(400);
      throw new Error('Rating is required');
    }
    
    const session = await MentorSession.findById(req.params.id);
    
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }
    
    // Check if user owns this session
    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this session');
    }
    
    // Add feedback to session
    session.feedback = {
      rating,
      comment: comment || '',
    };
    
    // Mark session as inactive since feedback is provided
    session.isActive = false;
    
    const updatedSession = await session.save();
    
    res.status(201).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMentorSession,
  getMentorSessions,
  getMentorSessionById,
  updateMentorSession,
  deleteMentorSession,
  addConversation,
  updateConversation,
  addFeedback,
};
