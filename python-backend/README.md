# Python Backend - AI Study Assistant GenAI

Production-ready Python backend with LangGraph orchestration and 11 specialized AI agents.

## Quick Start

### 1. Install Dependencies
```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```env
GOOGLE_AI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. Run Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Access API
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

## Project Structure

```
python-backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Settings configuration
│   ├── agents/                 # 11 AI Agents
│   │   ├── orchestrator.py     # Master Orchestrator
│   │   ├── personalization.py
│   │   ├── skill_graph.py
│   │   ├── learning_resource.py
│   │   ├── assessment.py
│   │   ├── reflection.py
│   │   ├── wellness.py
│   │   ├── scheduler.py
│   │   ├── motivation.py
│   │   ├── memory.py
│   │   └── explainability.py
│   ├── langgraph/              # LangGraph orchestration
│   │   ├── state.py            # State schema
│   │   ├── graph.py            # Workflow definition
│   │   └── nodes.py            # Graph nodes
│   ├── memory/                 # Memory systems
│   │   ├── mongodb_store.py
│   │   └── vector_store.py
│   ├── models/                 # Pydantic models
│   ├── api/                    # API routes
│   │   └── routes/
│   └── utils/                  # Utilities
│       └── llm.py
├── requirements.txt
└── .env
```

## API Endpoints

### Learning
- `POST /api/learning/process` - Process learning request with LangGraph
- `GET /api/learning/status/{session_id}` - Get session status

### Assessment
- `POST /api/assessment/generate` - Generate adaptive quiz
- `POST /api/assessment/evaluate` - Evaluate answers

### Wellness
- `GET /api/wellness/check/{user_id}` - Wellness assessment
- `POST /api/wellness/recommend` - Get wellness recommendations

### Memory
- `GET /api/memory/profile/{user_id}` - Get user profile from memory
- `GET /api/memory/patterns/{user_id}` - Get learning patterns

## Features

- ✅ LangGraph stateful orchestration
- ✅ 11 specialized AI agents
- ✅ Self-reflecting AI
- ✅ Long-term memory (MongoDB + Vector DB)
- ✅ Explainable AI
- ✅ Skill graph reasoning
- ✅ Emotion-aware adaptation
- ✅ Autonomous replanning

## Development

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black app/

# Lint
flake8 app/
```
