const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the learning path'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for the learning path'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Frontend Development', 'Backend Development', 'Fullstack Development', 'Data Science', 'Cybersecurity'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please provide a difficulty level'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    estimatedTime: {
      type: Number, // in hours
      required: [true, 'Please provide an estimated completion time'],
    },
    steps: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        resources: [
          {
            title: String,
            url: String,
            type: {
              type: String,
              enum: ['Video', 'Article', 'Course', 'Book', 'Other'],
            },
          },
        ],
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

module.exports = LearningPath;
