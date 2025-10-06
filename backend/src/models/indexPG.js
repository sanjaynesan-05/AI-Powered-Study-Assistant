const { sequelize } = require('../config/database');

// Import all models
const User = require('./userModelPG');
const LearningPath = require('./learningPathModelPG');
const UserProfile = require('./userProfileModelPG');
const { UserProgress, LearningSession, QuizResult, StudyMaterial } = require('./progressModelsPG');
const { UserContent, UserActivity, Mentor, Resume } = require('./otherModelsPG');

// Define associations
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(LearningPath, { foreignKey: 'createdBy', as: 'learningPaths' });
LearningPath.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(UserProgress, { foreignKey: 'userId', as: 'progress' });
UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(LearningSession, { foreignKey: 'userId', as: 'sessions' });
LearningSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(QuizResult, { foreignKey: 'userId', as: 'quizResults' });
QuizResult.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserContent, { foreignKey: 'userId', as: 'content' });
UserContent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserActivity, { foreignKey: 'userId', as: 'activities' });
UserActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes' });
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(StudyMaterial, { foreignKey: 'createdBy', as: 'createdMaterials' });
StudyMaterial.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  LearningPath,
  UserProfile,
  UserProgress,
  LearningSession,
  QuizResult,
  StudyMaterial,
  UserContent,
  UserActivity,
  Mentor,
  Resume
};