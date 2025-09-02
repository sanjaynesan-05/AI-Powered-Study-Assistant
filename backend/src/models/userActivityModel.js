const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'registration', 
        'contentCreated', 
        'contentEdited',
        'contentDeleted',
        'passwordChanged',
        'profileUpdated'
      ],
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

// Create compound index for efficient querying by user and activity type
userActivitySchema.index({ userId: 1, activityType: 1 });
userActivitySchema.index({ userId: 1, timestamp: -1 });

// Static method to log user activity
userActivitySchema.statics.logActivity = async function(data) {
  return await this.create(data);
};

// Static method to get recent activities for a user
userActivitySchema.statics.getRecentActivities = async function(userId, limit = 10) {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
