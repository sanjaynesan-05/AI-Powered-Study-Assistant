# API Documentation

This document provides details about the REST API endpoints available in the AI Mentor Platform.

## Base URL

```
http://localhost:5000/api
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
    "email": "john@example.com",
    "role": "user",
    "profilePicture": "default.jpg",
    "interests": [],
    "skills": []
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
  "skills": ["JavaScript", "React", "Node.js"]
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
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

### AI Mentor

#### Get AI Mentor Response

```
POST /mentor/chat
```

**Request Body:**
```json
{
  "message": "What career path should I take as a JavaScript developer?",
  "topic": "Career Guidance"
}
```

**Response:**
```json
{
  "success": true,
  "response": "As a JavaScript developer, you have several career paths to consider...",
  "topic": "Career Guidance"
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
  "skills": ["JavaScript", "React", "Node.js"]
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
    "resources": [],
    "skills": ["JavaScript", "React", "Node.js"],
    "user": "user_id"
  }
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
    "score": 85,
    "strengths": ["Technical skills are well presented", "Good project descriptions"],
    "weaknesses": ["Missing quantifiable achievements", "Too lengthy"],
    "suggestions": ["Add metrics to your achievements", "Trim down to one page"]
  }
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
      "location": "New York, NY"
    },
    "experience": [
      {
        "title": "Frontend Developer",
        "company": "Tech Co",
        "location": "New York, NY",
        "startDate": "2020-01",
        "endDate": "2023-05",
        "description": "Developed and maintained web applications using React"
      }
    ],
    "education": [
      {
        "degree": "BS in Computer Science",
        "institution": "University of Technology",
        "location": "Boston, MA",
        "graduationDate": "2019-05"
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "HTML/CSS"]
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
    "content": {...}
  }
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

- `400` - Bad Request
- `401` - Unauthorized
- `404` - Resource Not Found
- `500` - Server Error
