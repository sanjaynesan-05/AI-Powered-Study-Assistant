const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LearningPath = sequelize.define('LearningPath', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a title for the learning path'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a description for the learning path'
      }
    }
  },
  category: {
    type: DataTypes.ENUM(
      'Frontend Development',
      'Backend Development', 
      'Fullstack Development',
      'Data Science',
      'Cybersecurity'
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a category'
      }
    }
  },
  difficulty: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Please provide a difficulty level'
      }
    }
  },
  estimatedTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'Estimated time must be at least 1 hour'
      }
    }
  },
  steps: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      isStepsValid(value) {
        if (!Array.isArray(value)) {
          throw new Error('Steps must be an array');
        }
      }
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
});

module.exports = LearningPath;