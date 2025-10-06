const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// User Progress Model
const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  skillArea: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentLevel: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  progressPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  totalTimeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // in minutes
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedModules: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  learningPath: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  weeklyGoal: {
    type: DataTypes.INTEGER,
    defaultValue: 300 // minutes per week
  },
  streakDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

// Learning Session Model
const LearningSession = sequelize.define('LearningSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  skillArea: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sessionType: {
    type: DataTypes.ENUM('practice', 'tutorial', 'quiz', 'project'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false // in minutes
  },
  score: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 100
    }
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  content: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  feedback: {
    type: DataTypes.TEXT
  },
  improvements: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
});

// Quiz Result Model
const QuizResult = sequelize.define('QuizResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  quizId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skillArea: {
    type: DataTypes.STRING,
    allowNull: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timeSpent: {
    type: DataTypes.INTEGER // in seconds
  },
  answers: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  feedback: {
    type: DataTypes.TEXT
  }
});

// Study Material Model
const StudyMaterial = sequelize.define('StudyMaterial', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  contentType: {
    type: DataTypes.ENUM('text', 'video', 'interactive', 'quiz', 'project'),
    allowNull: false
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  estimatedTime: {
    type: DataTypes.INTEGER // in minutes
  },
  prerequisites: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = {
  UserProgress,
  LearningSession,
  QuizResult,
  StudyMaterial
};