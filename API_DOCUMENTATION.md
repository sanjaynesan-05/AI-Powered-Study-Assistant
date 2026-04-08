# API Endpoints Documentation

## Base URL
```
http://localhost:8000
```

---

## Core Endpoints

### GET /
**Description**: API information and status

**Response**:
```json
{
  "message": "AI Study Assistant GenAI API",
  "version": "2.0.0",
  "status": "operational",
  "agents": 11,
  "features": [
    "LangGraph orchestration",
    "Self-reflecting AI",
    "Long-term memory",
    "Explainable AI",
    "Skill graph reasoning"
  ]
}
```

### GET /health
**Description**: Simple health check

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### GET /api/health
**Description**: Detailed health check

**Response**:
```json
{
  "status": "healthy",
  "agents": "operational",
  "langgraph": "active",
  "memory": "connected",
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

---

## Agent Endpoints

### POST /study-plan
**Description**: Generate personalized study plan

**Request Body**:
```json
{
  "subject": "Machine Learning",
  "difficulty": "intermediate",
  "duration": "2 weeks",
  "goals": ["Learn supervised learning", "Build a model"],
  "learningStyle": "visual"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "schedule": [...],
    "milestones": [...],
    "estimated_hours": 40
  },
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### POST /learning-resources
**Description**: Get AI-curated learning resources

**Request Body**:
```json
{
  "topic": "Python Programming",
  "level": "beginner",
  "format": ["video", "article"],
  "preferences": ["visual"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "title": "Python Tutorial for Beginners",
        "type": "video",
        "platform": "YouTube",
        "url": "https://youtube.com/watch?v=...",
        "description": "...",
        "channel": "..."
      }
    ],
    "difficulty": "beginner",
    "estimated_time": "2-4 hours",
    "quality_score": 8.5
  },
  "enhanced": true,
  "ai_curated": true,
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### POST /assessment
**Description**: Generate adaptive assessment

**Request Body**:
```json
{
  "subject": "JavaScript",
  "difficulty": "intermediate",
  "questionCount": 10,
  "topics": ["async/await", "promises", "closures"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "total_questions": 10,
    "difficulty": "intermediate"
  },
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### POST /wellness-assessment
**Description**: Get wellness assessment and recommendations

**Request Body**:
```json
{
  "stress_level": 7,
  "study_hours": 8,
  "sleep_hours": 5,
  "physical_activity": "low"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "wellness_score": 4.5,
    "recommendations": [...],
    "break_suggestions": [...],
    "burnout_risk": "moderate"
  },
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### POST /schedule-optimization
**Description**: Optimize study schedule

**Request Body**:
```json
{
  "subjects": ["Math", "Physics", "Chemistry"],
  "available_hours": 20,
  "priorities": ["Math", "Physics"],
  "deadlines": ["2026-02-15", "2026-02-20"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "optimized_schedule": [...],
    "time_allocation": {...},
    "break_times": [...]
  },
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### POST /motivation-boost
**Description**: Get personalized motivation

**Request Body**:
```json
{
  "current_mood": "discouraged",
  "challenges": ["Difficult concepts", "Time management"],
  "goals": ["Complete course", "Build project"],
  "achievements": ["Finished module 1"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "...",
    "affirmations": [...],
    "next_steps": [...]
  },
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### POST /personalization
**Description**: Get personalization settings

**Request Body**:
```json
{
  "user_id": "user123",
  "learning_preferences": {
    "style": "visual",
    "pace": "moderate"
  },
  "performance_data": {
    "completed_topics": 5,
    "average_score": 85
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "recommended_style": "visual",
    "difficulty_level": "intermediate",
    "suggested_topics": [...]
  },
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

---

## LangGraph Orchestration

### POST /api/learning/process
**Description**: Full workflow with all 11 agents

**Request Body**:
```json
{
  "user_id": "user123",
  "user_input": "I want to learn machine learning",
  "session_id": "optional_session_id",
  "mastered_skills": ["Python", "Statistics"]
}
```

**Response**:
```json
{
  "success": true,
  "session_id": "session_...",
  "intent": "learning_request",
  "emotional_tone": "motivated",
  "current_skill": "Machine Learning",
  "learning_path": [...],
  "agent_outputs": {
    "orchestrator": {...},
    "personalization": {...},
    "skill_graph": {...},
    "learning_resource": {...},
    "assessment": {...},
    "wellness": {...},
    "scheduler": {...},
    "motivation": {...},
    "reflection": {...},
    "explainability": {...}
  },
  "explanations": {...},
  "reasoning_chain": [...],
  "confidence_scores": {...},
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

---

## Memory Endpoints

### GET /api/memory/profile/{user_id}
**Description**: Get user profile from long-term memory

**Response**:
```json
{
  "success": true,
  "user_id": "user123",
  "profile": {
    "learning_style": "visual",
    "mastered_skills": [...],
    "preferences": {...},
    "history": [...]
  }
}
```

### GET /api/agents/status
**Description**: Get status of all AI agents

**Response**:
```json
{
  "total_agents": 11,
  "agents": [
    {
      "name": "Master Orchestrator",
      "status": "operational",
      "role": "Intent & emotion detection"
    },
    ...
  ],
  "langgraph_workflow": "active",
  "self_reflection": "enabled",
  "long_term_memory": "enabled"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message description"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
