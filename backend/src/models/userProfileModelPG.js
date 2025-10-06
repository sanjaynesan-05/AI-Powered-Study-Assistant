const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  bio: {
    type: DataTypes.TEXT,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Bio cannot be more than 500 characters'
      }
    }
  },
  dateOfBirth: {
    type: DataTypes.DATE
  },
  education: {
    type: DataTypes.ENUM('student', 'graduate', 'professional', 'other'),
    defaultValue: 'student'
  },
  location: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  achievements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = UserProfile;