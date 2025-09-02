# Database Schema

This document outlines the MongoDB database schema used in the AI Mentor Platform.

## Overview

The AI Mentor Platform uses MongoDB as its database with Mongoose as the ODM (Object-Document Mapper). The database consists of several collections, each representing a different entity in the system.

## Collections

### Users

Stores user account information and profile details.

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Not included in query results by default
  },
  profilePicture: {
    type: String,
    default: 'default.jpg'
  },
  learningPaths: [{
    type: ObjectId,
    ref: 'LearningPath'
  }],
  interests: [String],
  skills: [String],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Learning Paths

Represents a structured learning path with resources and progress tracking.

```javascript
{
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  resources: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['article', 'video', 'course', 'book', 'other'],
      default: 'other'
    },
    estimatedTime: {
      type: String
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  skills: [String],
  user: {
    type: ObjectId,
    ref: 'User',
    required: false // null for system-generated paths
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Mentors

Stores AI mentor profiles and configurations.

```javascript
{
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  topics: [String],
  avatar: {
    type: String,
    default: 'default_mentor.jpg'
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Resumes

Stores user resume data.

```javascript
{
  title: {
    type: String,
    required: true
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      website: String,
      linkedin: String,
      summary: String
    },
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String,
      achievements: [String]
    }],
    education: [{
      degree: String,
      institution: String,
      location: String,
      graduationDate: String,
      description: String
    }],
    skills: [String],
    projects: [{
      title: String,
      description: String,
      url: String,
      technologies: [String]
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: String,
      url: String
    }]
  },
  analysis: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    keywordMatches: [String],
    lastUpdated: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships

The database schema includes several relationships between collections:

1. **User to Learning Paths**: One-to-many relationship. A user can have multiple learning paths.

2. **User to Resumes**: One-to-many relationship. A user can have multiple resumes.

## Indexes

The following indexes are configured for better performance:

```javascript
// User collection indexes
User.index({ email: 1 }); // For quick user lookup by email
User.index({ skills: 1 }); // For searching users by skills

// LearningPath collection indexes
LearningPath.index({ user: 1 }); // For finding paths by user
LearningPath.index({ skills: 1 }); // For searching paths by skills
LearningPath.index({ isPublic: 1 }); // For finding public paths

// Resume collection indexes
Resume.index({ user: 1 }); // For finding resumes by user
```

## Data Validation

Mongoose schemas include validation rules to ensure data integrity:

- Required fields
- String length requirements
- Email validation
- Enum values for restricted fields
- Reference validation for relationships

## Example Queries

### Find all learning paths for a user

```javascript
const userPaths = await LearningPath.find({ user: userId })
  .sort({ createdAt: -1 })
  .populate('user', 'name email');
```

### Search for public learning paths by skill

```javascript
const paths = await LearningPath.find({
  isPublic: true,
  skills: { $in: ['JavaScript', 'React'] }
}).limit(10);
```

### Get a user with their learning paths

```javascript
const user = await User.findById(userId)
  .populate({
    path: 'learningPaths',
    select: 'title description skills'
  });
```
