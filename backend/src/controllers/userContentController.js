const UserContent = require('../models/userContentModel');
const mongoose = require('mongoose');

// @desc    Create new user content
// @route   POST /api/content
// @access  Private
const createContent = async (req, res) => {
  try {
    const { contentType, title, description, content, tags, isPublic, sharedWith } = req.body;

    // Validate required fields
    if (!contentType || !title || !content) {
      return res.status(400).json({
        message: 'Content type, title and content are required',
      });
    }

    // Create new content
    const userContent = await UserContent.create({
      userId: req.user._id,
      contentType,
      title,
      description,
      content,
      tags: tags || [],
      isPublic: isPublic || false,
      sharedWith: sharedWith || []
    });

    res.status(201).json(userContent);
  } catch (error) {
    console.error('Error creating content:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid content data',
        errors: Object.values(error.errors).map(e => e.message),
      });
    }
    
    res.status(500).json({
      message: 'Failed to create content',
      error: error.message,
    });
  }
};

// @desc    Get all user content by type
// @route   GET /api/content/:contentType
// @access  Private
const getUserContentByType = async (req, res) => {
  try {
    const { contentType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { 
      userId: req.user._id,
      ...(contentType && { contentType })
    };

    // Find user content
    const content = await UserContent.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await UserContent.countDocuments(query);
    
    res.status(200).json({
      content,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Error fetching user content:', error);
    res.status(500).json({
      message: 'Failed to fetch content',
      error: error.message,
    });
  }
};

// @desc    Get single content item by ID
// @route   GET /api/content/item/:id
// @access  Private (with access check)
const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }

    const content = await UserContent.findById(id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user has access
    if (!content.canAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to this content' });
    }

    res.status(200).json(content);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    res.status(500).json({
      message: 'Failed to fetch content',
      error: error.message,
    });
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private (owner only)
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, tags, isPublic, sharedWith } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }

    // Find content and check ownership
    const contentItem = await UserContent.findById(id);

    if (!contentItem) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check ownership
    if (contentItem.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }

    // Update content with version tracking
    if (content) {
      contentItem.updateContent(content);
    }

    // Update other fields
    if (title) contentItem.title = title;
    if (description !== undefined) contentItem.description = description;
    if (tags) contentItem.tags = tags;
    if (isPublic !== undefined) contentItem.isPublic = isPublic;
    if (sharedWith) contentItem.sharedWith = sharedWith;

    // Save updated content
    const updatedContent = await contentItem.save();

    res.status(200).json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid content data',
        errors: Object.values(error.errors).map(e => e.message),
      });
    }
    
    res.status(500).json({
      message: 'Failed to update content',
      error: error.message,
    });
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private (owner only)
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }

    // Find content and check ownership
    const contentItem = await UserContent.findById(id);

    if (!contentItem) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check ownership
    if (contentItem.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }

    // Delete content
    await contentItem.remove();

    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      message: 'Failed to delete content',
      error: error.message,
    });
  }
};

// @desc    Share content with specific users
// @route   PUT /api/content/:id/share
// @access  Private (owner only)
const shareContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'User IDs must be provided as an array' });
    }

    // Find content and check ownership
    const contentItem = await UserContent.findById(id);

    if (!contentItem) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check ownership
    if (contentItem.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to share this content' });
    }

    // Update shared users
    contentItem.sharedWith = userIds;
    await contentItem.save();

    res.status(200).json({ message: 'Content shared successfully', content: contentItem });
  } catch (error) {
    console.error('Error sharing content:', error);
    res.status(500).json({
      message: 'Failed to share content',
      error: error.message,
    });
  }
};

// @desc    Get content shared with the user
// @route   GET /api/content/shared
// @access  Private
const getSharedContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find content shared with the user
    const sharedContent = await UserContent.find({ 
      sharedWith: req.user._id 
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await UserContent.countDocuments({ sharedWith: req.user._id });

    res.status(200).json({
      content: sharedContent,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Error fetching shared content:', error);
    res.status(500).json({
      message: 'Failed to fetch shared content',
      error: error.message,
    });
  }
};

module.exports = {
  createContent,
  getUserContentByType,
  getContentById,
  updateContent,
  deleteContent,
  shareContent,
  getSharedContent,
};
