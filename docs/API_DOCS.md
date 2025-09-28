# API Documentation

This document provides details about the REST API endpoints available in the AI-Powered Study Assistant.

## Base URL

```
http://localhost:5001/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Endpoints

### User Management

#### Register a new user

```
POST /users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "dateOfBirth": "1990-01-01",
  "education": "student"
}
```

**Response:**
```json
{
  "success": true,
  "token": "your_jwt_token",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePicture": null,
    "interests": [],
    "skills": [],
    "dateOfBirth": "1990-01-01",
    "education": "student"
  }
}
```

#### Login

```
POST /users/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "your_jwt_token",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get User Profile

```
GET /users/profile
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": "profile_image_url",
    "interests": ["AI", "Machine Learning"],
    "skills": ["JavaScript", "Python"],
    "learningPaths": []
  }
}
```

#### Update User Profile

```
PUT /users/profile
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "interests": ["AI", "Web Development"],
  "skills": ["JavaScript", "React", "Node.js"],
  "profilePicture": "base64_encoded_image_string",
  "bio": "Passionate developer and lifelong learner",
  "headline": "Full Stack Developer",
  "location": "New York, NY",
  "phone": "+1-555-123-4567",
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe Updated",
    "interests": ["AI", "Web Development"],
    "skills": ["JavaScript", "React", "Node.js"],
    "profilePicture": "base64_encoded_image_string",
    "bio": "Passionate developer and lifelong learner",
    "headline": "Full Stack Developer",
    "location": "New York, NY",
    "phone": "+1-555-123-4567",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe"
  }
}
```

### AI Mentor

#### Get AI Mentor Response

```
POST /ai/ask
```

**Request Body:**
```json
{
  "prompt": "What career path should I take as a JavaScript developer?",
  "topic": "Career Guidance"
}
```

**Response:**
```json
{
  "success": true,
  "response": "As a JavaScript developer, you have several exciting career paths to consider...",
  "topic": "Career Guidance",
  "model": "gemini-2.0-flash-exp",
  "timestamp": "2025-09-28T12:00:00.000Z"
}
```

#### Check AI Service Health

```
GET /ai/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "model": "gemini-2.0-flash-exp",
  "lastChecked": "2025-09-28T12:00:00.000Z"
}
```

#### Get Available Topics

```
GET /ai/topics
```

**Response:**
```json
{
  "success": true,
  "topics": [
    "General",
    "Programming", 
    "Career Guidance",
    "Skill Development",
    "Interview Preparation",
    "Resume Review",
    "Learning Path Suggestions",
    "Industry Insights"
  ]
}
```

### Learning Paths

#### Get All Learning Paths

```
GET /learning-paths
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "learningPaths": [
    {
      "_id": "learning_path_id_1",
      "title": "Becoming a Full Stack Developer",
      "description": "Complete pathway to become a full stack developer",
      "resources": [
        {
          "title": "Learn HTML & CSS",
          "url": "https://example.com/html-css",
          "type": "course"
        }
      ],
      "skills": ["HTML", "CSS", "JavaScript", "Node.js", "React"]
    },
    {
      "_id": "learning_path_id_2",
      "title": "Data Science Career Path",
      "description": "Learn data science from basics to advanced",
      "resources": [
        {
          "title": "Introduction to Python",
          "url": "https://example.com/python-intro",
          "type": "course"
        }
      ],
      "skills": ["Python", "Statistics", "Machine Learning"]
    }
  ]
}
```

#### Get Learning Path by ID

```
GET /learning-paths/:id
```

**Response:**
```json
{
  "success": true,
  "learningPath": {
    "_id": "learning_path_id",
    "title": "Becoming a Full Stack Developer",
    "description": "Complete pathway to become a full stack developer",
    "resources": [
      {
        "title": "Learn HTML & CSS",
        "url": "https://example.com/html-css",
        "type": "course"
      },
      {
        "title": "JavaScript Fundamentals",
        "url": "https://example.com/js-fundamentals",
        "type": "course"
      }
    ],
    "skills": ["HTML", "CSS", "JavaScript", "Node.js", "React"]
  }
}
```

#### Create Personal Learning Path

```
POST /learning-paths
```

**Request Body:**
```json
{
  "title": "My Web Development Path",
  "description": "Personalized path for web development",
  "skills": ["JavaScript", "React", "Node.js"],
  "resources": [
    {
      "title": "Learn JavaScript Fundamentals",
      "url": "https://example.com/js-fundamentals",
      "type": "course",
      "estimatedTime": "4 weeks",
      "completed": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Learning path created successfully",
  "learningPath": {
    "_id": "new_learning_path_id",
    "title": "My Web Development Path",
    "description": "Personalized path for web development",
    "resources": [
      {
        "title": "Learn JavaScript Fundamentals",
        "url": "https://example.com/js-fundamentals",
        "type": "course",
        "estimatedTime": "4 weeks",
        "completed": false
      }
    ],
    "skills": ["JavaScript", "React", "Node.js"],
    "user": "user_id",
    "isPublic": false,
    "createdAt": "2025-09-28T12:00:00.000Z"
  }
}
```

#### Update Learning Path Progress

```
PUT /learning-paths/:id/progress
```

**Request Body:**
```json
{
  "resourceIndex": 0,
  "completed": true,
  "notes": "Completed the JavaScript fundamentals course"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "completedResources": 1,
  "totalResources": 5,
  "completionPercentage": 20
}
```

### Resume Management

#### Analyze Resume

```
POST /resume/analyze
```

**Request Body:**
```json
{
  "resumeText": "Text content of the resume...",
  "jobTitle": "Software Developer"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "overallScore": 85,
    "strengths": [
      "Technical skills are well presented",
      "Good project descriptions",
      "Clear professional experience"
    ],
    "weaknesses": [
      "Missing quantifiable achievements",
      "Too lengthy for the role",
      "Could use more action verbs"
    ],
    "suggestions": [
      "Add metrics to your achievements (e.g., 'Increased performance by 40%')",
      "Trim down to one page for better readability",
      "Include more specific technical keywords for ATS optimization"
    ],
    "keywordMatches": ["JavaScript", "React", "Node.js", "Git"],
    "atsCompatibility": 78,
    "sectionScores": {
      "personalInfo": 90,
      "experience": 85,
      "education": 80,
      "skills": 95,
      "projects": 70
    }
  },
  "timestamp": "2025-09-28T12:00:00.000Z"
}
```

#### Save Resume

```
POST /resume/save
```

**Request Body:**
```json
{
  "title": "Software Developer Resume",
  "content": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "location": "New York, NY",
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "website": "https://johndoe.dev",
      "summary": "Experienced full-stack developer with 5+ years in web technologies"
    },
    "experience": [
      {
        "title": "Senior Frontend Developer",
        "company": "Tech Solutions Inc",
        "location": "New York, NY",
        "startDate": "2020-01",
        "endDate": "2023-05",
        "current": false,
        "description": "Developed and maintained web applications using React and Node.js",
        "achievements": [
          "Increased application performance by 40%",
          "Led team of 3 junior developers",
          "Implemented CI/CD pipeline reducing deployment time by 60%"
        ]
      }
    ],
    "education": [
      {
        "degree": "BS in Computer Science",
        "institution": "University of Technology",
        "location": "Boston, MA",
        "graduationDate": "2019-05",
        "description": "Graduated Summa Cum Laude, GPA: 3.9/4.0"
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
    "projects": [
      {
        "title": "E-commerce Platform",
        "description": "Built full-stack e-commerce solution with React and Node.js",
        "url": "https://github.com/johndoe/ecommerce",
        "technologies": ["React", "Node.js", "MongoDB", "Stripe API"]
      }
    ],
    "certifications": [
      {
        "name": "AWS Certified Solutions Architect",
        "issuer": "Amazon Web Services",
        "date": "2023-03",
        "url": "https://aws.amazon.com/certification/"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume saved successfully",
  "resume": {
    "_id": "resume_id",
    "title": "Software Developer Resume",
    "user": "user_id",
    "content": {
      // ... (same as request body)
    },
    "createdAt": "2025-09-28T12:00:00.000Z",
    "updatedAt": "2025-09-28T12:00:00.000Z"
  }
}
```

#### Get User Resumes

```
GET /resume/user-resumes
```

**Response:**
```json
{
  "success": true,
  "resumes": [
    {
      "_id": "resume_id_1",
      "title": "Software Developer Resume",
      "createdAt": "2025-09-28T12:00:00.000Z",
      "updatedAt": "2025-09-28T12:00:00.000Z",
      "analysis": {
        "overallScore": 85,
        "lastAnalyzed": "2025-09-28T12:00:00.000Z"
      }
    },
    {
      "_id": "resume_id_2", 
      "title": "Frontend Developer Resume",
      "createdAt": "2025-09-27T10:00:00.000Z",
      "updatedAt": "2025-09-27T10:00:00.000Z",
      "analysis": {
        "overallScore": 78,
        "lastAnalyzed": "2025-09-27T10:00:00.000Z"
      }
    }
  ]
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error message details",
  "stack": "Error stack trace (only in development environment)"
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (invalid or missing JWT token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Rate Limiting

API endpoints implement rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **AI chat endpoints**: 30 requests per minute per user
- **General API endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1695904800
```
