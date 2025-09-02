const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    dateOfBirth: {
      type: Date,
    },
    education: {
      type: String,
      enum: ['student', 'graduate', 'professional', 'other'],
      default: 'student',
    },
    location: {
      city: String,
      country: String,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      website: String,
    },
    // Any additional user-specific fields
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on userId to ensure each user has only one profile
userProfileSchema.index({ userId: 1 }, { unique: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
