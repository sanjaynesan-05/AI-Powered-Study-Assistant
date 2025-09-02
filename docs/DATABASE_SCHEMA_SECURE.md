# Secure User Data Storage Schema Design

## Core Design Principles
- Each user's data must be isolated and accessible only by its owner
- Reference integrity must be maintained
- Data should be structured for efficient querying
- Schema should support all necessary CRUD operations

## User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  profilePicture: String,
  role: String (enum: 'user', 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

## UserProfile Schema (User-specific data)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User, indexed),
  bio: String,
  dateOfBirth: Date,
  education: String (enum: 'student', 'graduate', etc.),
  skills: [String],
  interests: [String],
  location: {
    city: String,
    country: String
  },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## UserContent Schema (User-generated content with permissions)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User, indexed),
  contentType: String (enum: 'resume', 'learningPath', 'note', etc.),
  title: String,
  description: String,
  content: Object (schema varies based on contentType),
  isPublic: Boolean (default: false),
  sharedWith: [ObjectId] (references to other users),
  createdAt: Date,
  updatedAt: Date
}
```

## UserActivity Schema (Track user actions)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User, indexed),
  activityType: String (enum: 'login', 'contentCreated', 'contentEdited', etc.),
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

## Security Considerations
1. All user documents include a `userId` field to maintain ownership
2. Indexes on `userId` fields for efficient querying
3. Application-level authorization checks for all data access
4. Data validation to prevent malicious input
5. Rate limiting to prevent brute force attacks
6. Audit logs of all sensitive operations

## Data Access Patterns
1. Always filter queries by `userId` to ensure data isolation
2. Use aggregation pipelines for complex data relationships
3. Implement pagination for large data sets
4. Use projection to limit returned fields as needed

This schema design enables secure, isolated storage of user data while maintaining the flexibility needed for different types of content and relationships.
