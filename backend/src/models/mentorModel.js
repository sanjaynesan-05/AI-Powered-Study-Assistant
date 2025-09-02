const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  mentor: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    topic: {
      type: String,
    },
    conversations: [conversationSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const MentorSession = mongoose.model('MentorSession', sessionSchema);

module.exports = MentorSession;
