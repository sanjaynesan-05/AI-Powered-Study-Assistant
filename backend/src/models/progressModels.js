// MongoDB schemas for user progress and learning data persistence
const mongoose = require('mongoose');

// User Progress Schema
const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skillArea: {
    type: String,
    required: true,
    index: true
  },
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedModules: [{
    moduleId: String,
    title: String,
    completedAt: Date,
    timeSpent: Number,
    score: Number
  }],
  achievements: [{
    type: String,
    achievedAt: Date,
    description: String
  }],
  learningPath: {
    pathId: String,
    title: String,
    currentModule: String,
    modulesCompleted: Number,
    totalModules: Number,
    estimatedCompletion: Date
  },
  preferences: {
    learningStyle: String,
    difficultyPreference: String,
    timeCommitment: String,
    goals: [String]
  },
  streakData: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStudyDate: Date
  }
}, {
  timestamps: true,
  collection: 'user_progress'
});

// AI Interactions Schema
const aiInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  agentType: {
    type: String,
    required: true,
    enum: ['learningPath', 'careerMentor', 'resumeCoach', 'studyGuide', 'skillAssessment'],
    index: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    helpful: Boolean
  },
  processingTime: {
    type: Number // in milliseconds
  },
  fallbackUsed: {
    type: Boolean,
    default: false
  },
  context: {
    userSkills: [String],
    currentGoals: [String],
    experience: String,
    previousInteractions: Number
  }
}, {
  timestamps: true,
  collection: 'ai_interactions'
});

// Video History Schema
const videoHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  channelTitle: String,
  duration: Number, // in seconds
  category: {
    type: String,
    index: true
  },
  skillArea: {
    type: String,
    index: true
  },
  watchHistory: [{
    sessionId: String,
    startTime: Date,
    endTime: Date,
    watchedDuration: Number, // in seconds
    progressPercentage: Number,
    completed: Boolean,
    notes: String,
    bookmarks: [{
      timestamp: Number,
      note: String,
      createdAt: Date
    }]
  }],
  totalWatchTime: {
    type: Number,
    default: 0 // in seconds
  },
  completionCount: {
    type: Number,
    default: 0
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    review: String,
    ratedAt: Date
  },
  addedToPath: {
    pathId: String,
    addedAt: Date
  }
}, {
  timestamps: true,
  collection: 'video_history'
});

// Learning Sessions Schema
const learningSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['video', 'reading', 'practice', 'assessment', 'ai_interaction'],
    required: true,
    index: true
  },
  skillArea: {
    type: String,
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number, // in minutes
  activities: [{
    type: String,
    resourceId: String,
    title: String,
    timeSpent: Number,
    completed: Boolean,
    score: Number,
    notes: String,
    timestamp: Date
  }],
  goals: [{
    description: String,
    achieved: Boolean,
    timestamp: Date
  }],
  reflections: {
    whatLearned: String,
    difficulties: String,
    nextSteps: String,
    confidence: { type: Number, min: 1, max: 10 }
  },
  metadata: {
    deviceType: String,
    location: String,
    studyEnvironment: String,
    mood: String
  }
}, {
  timestamps: true,
  collection: 'learning_sessions'
});

// Skill Assessment Results Schema
const skillAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assessmentId: {
    type: String,
    required: true,
    index: true
  },
  skillArea: {
    type: String,
    required: true,
    index: true
  },
  assessmentType: {
    type: String,
    enum: ['initial', 'progress', 'final', 'certification'],
    required: true
  },
  questions: [{
    questionId: String,
    question: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number,
    difficulty: String,
    topic: String
  }],
  results: {
    totalQuestions: Number,
    correctAnswers: Number,
    score: Number, // percentage
    timeTaken: Number, // in minutes
    level: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String]
  },
  previousScore: Number,
  improvement: Number,
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'skill_assessments'
});

// Create indexes for better performance
userProgressSchema.index({ userId: 1, skillArea: 1 }, { unique: true });
userProgressSchema.index({ 'learningPath.pathId': 1 });
userProgressSchema.index({ lastAccessedAt: -1 });

aiInteractionSchema.index({ userId: 1, createdAt: -1 });
aiInteractionSchema.index({ agentType: 1, createdAt: -1 });
aiInteractionSchema.index({ sessionId: 1 });

videoHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });
videoHistorySchema.index({ userId: 1, lastWatchedAt: -1 });
videoHistorySchema.index({ skillArea: 1 });

learningSessionSchema.index({ userId: 1, startTime: -1 });
learningSessionSchema.index({ type: 1, skillArea: 1 });

skillAssessmentSchema.index({ userId: 1, completedAt: -1 });
skillAssessmentSchema.index({ skillArea: 1, assessmentType: 1 });

// Create models
const UserProgress = mongoose.model('UserProgress', userProgressSchema);
const AIInteraction = mongoose.model('AIInteraction', aiInteractionSchema);
const VideoHistory = mongoose.model('VideoHistory', videoHistorySchema);
const LearningSession = mongoose.model('LearningSession', learningSessionSchema);
const SkillAssessment = mongoose.model('SkillAssessment', skillAssessmentSchema);

module.exports = {
  UserProgress,
  AIInteraction,
  VideoHistory,
  LearningSession,
  SkillAssessment
};