const LearningPath = require('../models/learningPathModel');
const User = require('../models/userModel');

// @desc    Create a new learning path
// @route   POST /api/learning-paths
// @access  Private
const createLearningPath = async (req, res) => {
  try {
    const { title, description, category, difficulty, estimatedTime, steps, isPublic, tags } = req.body;

    const learningPath = await LearningPath.create({
      title,
      description,
      category,
      difficulty,
      estimatedTime,
      steps,
      createdBy: req.user._id,
      isPublic,
      tags,
    });

    // Add learning path to user's learning paths
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { learningPaths: learningPath._id } },
      { new: true }
    );

    res.status(201).json(learningPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all public learning paths
// @route   GET /api/learning-paths
// @access  Public
const getLearningPaths = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    // Build query
    const query = { isPublic: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const learningPaths = await LearningPath.find(query)
      .populate('createdBy', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(learningPaths);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get learning path by ID
// @route   GET /api/learning-paths/:id
// @access  Public/Private
const getLearningPathById = async (req, res) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id).populate(
      'createdBy',
      'name profilePicture'
    );

    if (!learningPath) {
      res.status(404);
      throw new Error('Learning path not found');
    }

    // Check if learning path is private and user is not creator
    if (!learningPath.isPublic && 
        (!req.user || req.user._id.toString() !== learningPath.createdBy._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to access this learning path');
    }

    res.json(learningPath);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update a learning path
// @route   PUT /api/learning-paths/:id
// @access  Private
const updateLearningPath = async (req, res) => {
  try {
    const { title, description, category, difficulty, estimatedTime, steps, isPublic, tags } = req.body;

    const learningPath = await LearningPath.findById(req.params.id);

    if (!learningPath) {
      res.status(404);
      throw new Error('Learning path not found');
    }

    // Check if user is the creator of the learning path
    if (learningPath.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this learning path');
    }

    // Update fields
    learningPath.title = title || learningPath.title;
    learningPath.description = description || learningPath.description;
    learningPath.category = category || learningPath.category;
    learningPath.difficulty = difficulty || learningPath.difficulty;
    learningPath.estimatedTime = estimatedTime || learningPath.estimatedTime;
    learningPath.steps = steps || learningPath.steps;
    learningPath.isPublic = isPublic !== undefined ? isPublic : learningPath.isPublic;
    learningPath.tags = tags || learningPath.tags;

    const updatedLearningPath = await learningPath.save();

    res.json(updatedLearningPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a learning path
// @route   DELETE /api/learning-paths/:id
// @access  Private
const deleteLearningPath = async (req, res) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id);

    if (!learningPath) {
      res.status(404);
      throw new Error('Learning path not found');
    }

    // Check if user is the creator of the learning path
    if (learningPath.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this learning path');
    }

    // Remove learning path from user's learning paths
    await User.findByIdAndUpdate(
      learningPath.createdBy,
      { $pull: { learningPaths: learningPath._id } },
      { new: true }
    );

    await learningPath.remove();

    res.json({ message: 'Learning path removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update step completion status
// @route   PUT /api/learning-paths/:id/steps/:stepId
// @access  Private
const updateStepStatus = async (req, res) => {
  try {
    const { completed } = req.body;
    const { id, stepId } = req.params;

    const learningPath = await LearningPath.findById(id);

    if (!learningPath) {
      res.status(404);
      throw new Error('Learning path not found');
    }

    // Find the step to update
    const stepIndex = learningPath.steps.findIndex(
      (step) => step._id.toString() === stepId
    );

    if (stepIndex === -1) {
      res.status(404);
      throw new Error('Step not found');
    }

    // Update the completed status
    learningPath.steps[stepIndex].completed = completed;

    const updatedLearningPath = await learningPath.save();

    res.json(updatedLearningPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's learning paths
// @route   GET /api/learning-paths/my
// @access  Private
const getUserLearningPaths = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('learningPaths');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    res.json(user.learningPaths);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createLearningPath,
  getLearningPaths,
  getLearningPathById,
  updateLearningPath,
  deleteLearningPath,
  updateStepStatus,
  getUserLearningPaths,
};
