const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserContent = sequelize.define('UserContent', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contentType: {
    type: DataTypes.ENUM('note', 'project', 'resource', 'bookmark'),
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

const UserActivity = sequelize.define('UserActivity', {
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
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceId: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.STRING
  }
});

const Mentor = sequelize.define('Mentor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expertise: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT
  },
  experience: {
    type: DataTypes.INTEGER // years of experience
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  availability: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  contact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Resume = sequelize.define('Resume', {
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
  personalInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  education: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  experience: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  projects: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  template: {
    type: DataTypes.STRING,
    defaultValue: 'default'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = {
  UserContent,
  UserActivity,
  Mentor,
  Resume
};