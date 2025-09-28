# Database Schema

This document outlines the MongoDB database schema used in the AI-Powered Study Assistant.

## Overview

The AI-Powered Study Assistant uses MongoDB as its database with Mongoose as the ODM (Object-Document Mapper). The database consists of several collections, each representing a different entity in the system with secure user data isolation.

## Collections

### Users

Stores user account information and profile details with enhanced professional information.

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
    default: null
  },
  // Enhanced Profile Information
  headline: {
    type: String,
    default: 'Student passionate about learning and technology'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String
  },
  phone: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  education: {
    type: String,
    enum: ['student', 'graduate', 'postgraduate', 'professional'],
    default: 'student'
  },
  // Professional Links
  linkedin: {
    type: String
  },
  github: {
    type: String
  },
  website: {
    type: String
  },
  // Skills and Interests
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Learning Paths

Represents a structured learning path with resources and progress tracking, with enhanced user ownership.

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
      enum: ['article', 'video', 'course', 'book', 'tutorial', 'documentation', 'other'],
      default: 'other'
    },
    estimatedTime: {
      type: String
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: 1000
    }
  }],
  skills: [String],
  user: {
    type: ObjectId,
    ref: 'User',
    required: true // All paths must have an owner
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: String // e.g., '4 weeks', '2 months'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
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

Stores comprehensive user resume data with AI analysis results.

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
      github: String,
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
      description: String,
      gpa: String
    }],
    skills: [String],
    projects: [{
      title: String,
      description: String,
      url: String,
      technologies: [String],
      startDate: String,
      endDate: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: String,
      url: String,
      expirationDate: String
    }],
    languages: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native']
      }
    }]
  },
  analysis: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    sectionScores: {
      personalInfo: Number,
      experience: Number,
      education: Number,
      skills: Number,
      projects: Number
    },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    keywordMatches: [String],
    atsCompatibility: {
      type: Number,
      min: 0,
      max: 100
    },
    lastAnalyzed: Date
  },
  template: {
    type: String,
    default: 'modern'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### User Activity

Tracks user actions for analytics and security purposes.

```javascript
{
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'profile_update', 'resume_created', 'resume_analyzed', 'learning_path_created', 'ai_chat', 'skill_added']
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}
```

### AI Chat Sessions (Optional - for conversation history)

Stores AI chat conversations for continuity and analysis.

```javascript
{
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  topic: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

## Relationships

The database schema includes several secure relationships between collections with proper user isolation:

1. **User to Learning Paths**: One-to-many relationship. A user can have multiple learning paths, all filtered by userId.

2. **User to Resumes**: One-to-many relationship. A user can have multiple resumes, all secured by userId.

3. **User to Activity Logs**: One-to-many relationship. All user activities are tracked with userId for security.

4. **User to AI Chat Sessions**: One-to-many relationship. Chat history is maintained per user.

## Security & Data Isolation

All collections (except Users) include a `user` field that references the User collection, ensuring:
- Data isolation between users
- Secure query patterns
- Proper authorization checks
- Audit trail maintenance

## Indexes

The following indexes are configured for better performance and security:

```javascript
// User collection indexes
User.index({ email: 1 }); // Unique index for authentication
User.index({ skills: 1 }); // For skill-based searches
User.index({ createdAt: -1 }); // For user analytics

// LearningPath collection indexes
LearningPath.index({ user: 1 }); // Critical for data isolation
LearningPath.index({ user: 1, createdAt: -1 }); // User's paths by date
LearningPath.index({ skills: 1, isPublic: 1 }); // Public path searches
LearningPath.index({ isPublic: 1 }); // Finding public paths

// Resume collection indexes
Resume.index({ user: 1 }); // Critical for data isolation
Resume.index({ user: 1, createdAt: -1 }); // User's resumes by date
Resume.index({ user: 1, isActive: 1 }); // Active resumes only

// UserActivity collection indexes
UserActivity.index({ user: 1, timestamp: -1 }); // User activity history
UserActivity.index({ activityType: 1, timestamp: -1 }); // Analytics queries
UserActivity.index({ timestamp: -1 }); // General activity logs

// AI Chat Sessions indexes (if implemented)
AIChatSession.index({ user: 1 }); // User's chat sessions
AIChatSession.index({ user: 1, isActive: 1 }); // Active sessions
AIChatSession.index({ sessionId: 1 }); // Quick session lookup
```

## Data Validation

Mongoose schemas include comprehensive validation rules:

- **Required fields**: Critical data must be present
- **String length requirements**: Prevent abuse and ensure data quality
- **Email validation**: Proper email format checking
- **Enum values**: Restricted choices for consistency
- **Reference validation**: Ensure foreign key integrity
- **Custom validators**: Business logic validation

## Example Queries with Security

### Find all learning paths for a user (secure)

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

### Get a user's resumes with analysis

```javascript
const resumes = await Resume.find({ 
  user: userId,
  isActive: true 
})
.select('title createdAt analysis.overallScore')
.sort({ updatedAt: -1 });
```

### Secure user profile with learning paths

```javascript
const user = await User.findById(userId)
  .populate({
    path: 'learningPaths',
    match: { user: userId }, // Extra security check
    select: 'title description skills completionPercentage'
  })
  .select('-password'); // Never return password
```

## Migration Scripts

### Initial Data Seeding
```javascript
// Create default learning paths for new users
const createDefaultPaths = async (userId) => {
  const defaultPaths = [
    {
      title: "Getting Started with Programming",
      description: "Basic programming concepts for beginners",
      skills: ["Programming Basics", "Problem Solving"],
      user: userId,
      resources: [
        {
          title: "Introduction to Programming",
          url: "https://example.com/intro-programming",
          type: "course",
          estimatedTime: "2 weeks"
        }
      ]
    }
  ];
  
  await LearningPath.insertMany(defaultPaths);
};
```
