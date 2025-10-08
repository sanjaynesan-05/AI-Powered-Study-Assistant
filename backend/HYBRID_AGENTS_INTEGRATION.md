# Python-Only AI Agents Integration

This integration uses advanced Python AI libraries (LangGraph, LangChain) with the Node.js backend, providing sophisticated AI agent orchestration without JavaScript fallbacks for consistent, enterprise-grade performance.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
│                         Port 3001                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend (Express.js)                    │
│                      Port 5001                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │       Python-Only Agent Orchestrator               │    │
│  │  ┌──────────────┐                                   │    │
│  │  │   Python     │                                   │    │
│  │  │   Agents     │                                   │    │
│  │  │  (Required)  │                                   │    │
│  │  └──────┬───────┘                                   │    │
│  └─────────┼─────────────────────────────────────────┘    │
└────────────┼──────────────────────────────────────────────┘
             │ HTTP
             ▼
┌─────────────────────────────────────────────────────────────┐
│         Python FastAPI Server (LangGraph)                    │
│                      Port 8001                               │
│  ┌──────────────────────────────────────────────────┐      │
│  │  LangGraph Orchestrator                           │      │
│  │  ├─ Learning Agent                                │      │
│  │  ├─ Assessment Agent                              │      │
│  │  ├─ Wellness Agent                                │      │
│  │  ├─ Schedule Agent                                │      │
│  │  ├─ Motivation Agent                              │      │
│  │  └─ Personalization Agent                         │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Python AI Agents (`backend/src/services/pythonAgents/`)

**Location**: `backend/src/services/pythonAgents/`

**Key Files**:
- `main.py` - FastAPI server exposing agent endpoints
- `orchestrator.py` - LangGraph-based multi-agent coordination
- `agents/` - Individual specialized agents

**Features**:
- Advanced multi-agent orchestration using LangGraph
- Sophisticated state management
- Complex reasoning chains
- Hume AI integration for emotional intelligence
- Google Gemini & OpenAI integration

**Endpoints**:
- `GET /health` - Health check
- `GET /agents/status` - Agent status information
- `POST /study-plan` - Generate personalized study plan
- `POST /learning-resources` - Find learning resources
- `POST /assessment` - Generate assessments
- `POST /wellness-check` - Wellness monitoring
- `POST /motivation` - Motivational content

### 2. Python Agent Runner (`pythonAgentRunner.js`)

**Purpose**: Manages the Python FastAPI subprocess from Node.js

**Responsibilities**:
- Spawn Python process on startup
- Monitor Python server health
- Provide JavaScript API for Python endpoints
- Handle process lifecycle and cleanup

**Key Methods**:
```javascript
await pythonAgentRunner.start()              // Start Python server
await pythonAgentRunner.checkHealth()        // Check if healthy
await pythonAgentRunner.generateStudyPlan()  // Call Python agents
pythonAgentRunner.stop()                     // Shutdown gracefully
```

### 3. Hybrid Agent Orchestrator (`hybridAgentOrchestrator.js`)

**Purpose**: Intelligently routes requests between Python and JavaScript agents

**Strategy**:
1. **Primary**: Try Python agents (advanced AI features)
2. **Fallback**: Use JavaScript agents if Python unavailable
3. **Graceful**: Seamless degradation without failures

**Key Methods**:
```javascript
await hybridOrchestrator.initialize()         // Setup on startup
await hybridOrchestrator.generateStudyPlan()  // Smart routing
await hybridOrchestrator.getStatus()          // Check status
hybridOrchestrator.shutdown()                 // Cleanup
```

### 4. JavaScript Fallback Agents

**Location**: `backend/src/services/aiAgents/`

**Purpose**: Provide basic AI functionality when Python unavailable

**Agents**:
- `learningAgent.js` - Resource discovery
- `assessmentAgent.js` - Quiz generation
- `wellnessAgent.js` - Wellness monitoring
- `scheduleAgent.js` - Study scheduling
- `motivationAgent.js` - Motivational content
- `personalizationAgent.js` - Personalized recommendations

## Setup Instructions

### Prerequisites

1. **Node.js** (v16+) - Already installed
2. **Python** (v3.8+) - Required for advanced agents

### Installation Steps

#### 1. Install Node.js Dependencies
```powershell
cd backend
npm install
```

#### 2. Setup Python Environment
```powershell
cd backend
.\setup-python-agents.ps1
```

This script will:
- Check Python installation
- Create virtual environment
- Install all Python dependencies
- Configure the environment

#### 3. Configure Environment Variables

Ensure `.env` has:
```env
# Required for both systems
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_key
OPENAI_API_KEY=your_openai_key

# Optional
PORT=5001
```

#### 4. Start the Backend
```powershell
cd backend
npm start
```

The backend will:
1. Start Node.js Express server on port 5001
2. Automatically spawn Python FastAPI server on port 8001
3. Initialize hybrid orchestrator
4. Fall back to JavaScript if Python unavailable

## API Endpoints

### Hybrid Agent Routes

All hybrid routes automatically choose Python or JavaScript based on availability:

#### Generate Study Plan
```http
POST /api/ai-agents/hybrid/study-plan
Content-Type: application/json

{
  "target_skill": "Machine Learning",
  "experience_level": "beginner",
  "time_available": "10 hours/week",
  "learning_style": "visual"
}
```

#### Get Learning Resources
```http
POST /api/ai-agents/hybrid/resources
Content-Type: application/json

{
  "topic": "React Hooks",
  "difficulty": "intermediate",
  "resource_type": "video"
}
```

#### Generate Assessment
```http
POST /api/ai-agents/hybrid/assessment
Content-Type: application/json

{
  "topic": "JavaScript Arrays",
  "difficulty": "beginner",
  "question_count": 10
}
```

#### Wellness Check
```http
POST /api/ai-agents/hybrid/wellness
Content-Type: application/json

{
  "study_hours": 8,
  "sleep_hours": 6,
  "stress_level": "medium"
}
```

#### Get Motivation
```http
POST /api/ai-agents/hybrid/motivation
Content-Type: application/json

{
  "mood": "tired",
  "progress": 0.45,
  "challenge": "complex algorithms"
}
```

#### Check Status
```http
GET /api/ai-agents/hybrid/status
```

Response:
```json
{
  "success": true,
  "data": {
    "pythonAgentsActive": true,
    "fallbackAvailable": true,
    "agents": {
      "learning": true,
      "assessment": true,
      "wellness": true,
      "schedule": true,
      "motivation": true,
      "personalization": true
    }
  }
}
```

## Testing

### Test Python Agents Directly
```powershell
cd backend\src\services\pythonAgents
.\venv\Scripts\Activate.ps1
python main.py
```

Visit: http://localhost:8001/docs (FastAPI interactive docs)

### Test Integration
```powershell
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Test hybrid endpoints
curl http://localhost:5001/api/ai-agents/hybrid/status
```

### Test Fallback System
```powershell
# Stop Python agents (if running separately)
# Backend will automatically fall back to JavaScript

# Check status - should show pythonAgentsActive: false
curl http://localhost:5001/api/ai-agents/hybrid/status
```

## Monitoring

### Check Python Agent Logs
```powershell
# Node.js will pipe Python logs prefixed with [Python Agent]
# Watch for:
#   ✅ Python AI Agent Server is ready
#   ⚠️  Python agents unavailable, using JavaScript fallbacks
```

### Check Health
```http
GET /api/ai-agents/health
```

Returns both Node.js and Python agent status.

## Troubleshooting

### Python Agents Won't Start

**Problem**: `Python agents unavailable, using JavaScript fallbacks`

**Solutions**:
1. Check Python installation: `python --version` (need 3.8+)
2. Verify virtual environment: `cd backend\src\services\pythonAgents; .\venv\Scripts\Activate.ps1`
3. Install dependencies: `pip install -r requirements.txt`
4. Check port 8001 is available: `netstat -ano | findstr :8001`
5. Review logs for errors

### Module Import Errors

**Problem**: `ModuleNotFoundError` in Python

**Solutions**:
1. Ensure virtual environment is activated
2. Reinstall requirements: `pip install -r requirements.txt`
3. Check Python path in logs

### API Key Errors

**Problem**: `API key not found` errors

**Solutions**:
1. Verify `.env` file exists in `backend/` folder
2. Check API keys are set:
   ```env
   GEMINI_API_KEY=...
   OPENAI_API_KEY=...
   ```
3. Restart backend to reload environment

### Performance Issues

**Problem**: Slow agent responses

**Solutions**:
1. Python agents are more sophisticated but slower
2. Use JavaScript fallbacks for faster responses
3. Consider caching strategies
4. Adjust timeout values in `pythonAgentRunner.js`

## Development

### Adding New Python Agents

1. Create agent in `backend/src/services/pythonAgents/agents/new_agent.py`
2. Add to orchestrator in `orchestrator.py`
3. Add endpoint in `main.py`
4. Add method in `pythonAgentRunner.js`
5. Add method in `hybridAgentOrchestrator.js`
6. Create route in `aiAgentRoutes.js`

### Adding New JavaScript Fallback Agents

1. Create agent in `backend/src/services/aiAgents/newAgent.js`
2. Add to `hybridAgentOrchestrator.js` fallback logic
3. Test fallback when Python unavailable

## Performance Comparison

| Feature | Python Agents | JavaScript Agents |
|---------|--------------|-------------------|
| AI Sophistication | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Response Time | ~2-5 seconds | ~1-3 seconds |
| Memory Usage | ~200MB | ~50MB |
| Multi-agent Coordination | Advanced (LangGraph) | Basic |
| Emotional Intelligence | Yes (Hume AI) | No |
| Fallback Available | N/A | Always |

## Production Deployment

### Option 1: Microservices (Recommended)
- Deploy Python agents as separate service (Docker/Kubernetes)
- Configure `PYTHON_AGENTS_URL` environment variable
- Update `pythonAgentRunner.js` to use remote URL

### Option 2: Unified Deployment
- Include Python in deployment environment
- Ensure Python dependencies installed
- Configure process manager (PM2) for both services

### Option 3: JavaScript Only
- Disable Python agent initialization
- Rely entirely on JavaScript fallbacks
- Simpler deployment, reduced capabilities

## License

Same as main project.
