const mongoose = require('mongoose');

const userContentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['resume', 'learningPath', 'note', 'project', 'jobApplication'],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    // Dynamic content field that varies based on contentType
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Track versions of content for history/rollback
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [{
      content: mongoose.Schema.Types.Mixed,
      updatedAt: Date,
      version: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for efficient querying
userContentSchema.index({ userId: 1, contentType: 1 });
userContentSchema.index({ userId: 1, isPublic: 1 });
userContentSchema.index({ sharedWith: 1 }, { sparse: true });

// Method to check if a user has access to this content
userContentSchema.methods.canAccess = function(userId) {
  return (
    this.userId.toString() === userId.toString() ||
    this.isPublic ||
    this.sharedWith.some(id => id.toString() === userId.toString())
  );
};

// Add new version and store current as previous version
userContentSchema.methods.updateContent = function(newContent) {
  // Store the current content as a previous version
  this.previousVersions.push({
    content: this.content,
    updatedAt: this.updatedAt,
    version: this.version,
  });
  
  // Update to new content
  this.content = newContent;
  this.version += 1;
};

const UserContent = mongoose.model('UserContent', userContentSchema);

module.exports = UserContent;
