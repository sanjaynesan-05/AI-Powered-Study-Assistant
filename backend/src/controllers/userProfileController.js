const UserProfile = require('../models/userProfileModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// @desc    Get user profile data
// @route   GET /api/users/profile/details
// @access  Private
const getUserProfileDetails = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user._id });

    if (!userProfile) {
      // Create a new profile if it doesn't exist
      const newProfile = await UserProfile.create({
        userId: req.user._id,
      });
      
      return res.status(200).json(newProfile);
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile details:', error);
    res.status(500).json({
      message: 'Failed to fetch profile details',
      error: error.message,
    });
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile/details
// @access  Private
const updateUserProfileDetails = async (req, res) => {
  try {
    const {
      bio,
      dateOfBirth,
      education,
      location,
      socialLinks,
      preferences
    } = req.body;

    // Find and update profile, create if it doesn't exist
    let userProfile = await UserProfile.findOne({ userId: req.user._id });

    if (userProfile) {
      // Update existing profile
      if (bio !== undefined) userProfile.bio = bio;
      if (dateOfBirth !== undefined) userProfile.dateOfBirth = dateOfBirth;
      if (education !== undefined) userProfile.education = education;
      if (location !== undefined) userProfile.location = location;
      if (socialLinks !== undefined) userProfile.socialLinks = socialLinks;
      if (preferences !== undefined) userProfile.preferences = preferences;

      await userProfile.save();
    } else {
      // Create new profile
      userProfile = await UserProfile.create({
        userId: req.user._id,
        bio,
        dateOfBirth,
        education,
        location,
        socialLinks,
        preferences
      });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error updating user profile details:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid profile data',
        errors: Object.values(error.errors).map(e => e.message),
      });
    }
    
    res.status(500).json({
      message: 'Failed to update profile details',
      error: error.message,
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    // Start transaction for data consistency
    session.startTransaction();
    
    // Delete user profile
    await UserProfile.findOneAndDelete({ userId: req.user._id }, { session });
    
    // Delete the user account as well
    await User.findByIdAndDelete(req.user._id, { session });
    
    await session.commitTransaction();
    
    res.status(200).json({ message: 'User account and profile deleted successfully' });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    
    console.error('Error deleting user profile:', error);
    res.status(500).json({
      message: 'Failed to delete profile',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getUserProfileDetails,
  updateUserProfileDetails,
  deleteUserProfile,
};
