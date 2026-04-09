"""
FastAPI Main Application
Production-ready AI Study Assistant API with LangGraph orchestration
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from datetime import datetime
import json
import logging
import os
from datetime import datetime
from typing import Optional, List
from celery.result import AsyncResult

# ── Environment Overrides ──────────────────────────────────────────────────
# Disable ChromaDB telemetry before any imports that might trigger it
os.environ["ANONYMIZED_TELEMETRY"] = "False"

from app.config import settings
from app.utils.logger import configure_logging, get_logger

# ── Bootstrap structured logging ─────────────────────────────────────────────
configure_logging()
logger = get_logger("app.main")

from app.langgraph.graph import learning_graph
from app.langgraph.state import AgentState
from app.memory.mongodb_store import memory_store
from app.api.middleware import RateLimitMiddleware
from app.api.monitoring_middleware import MonitoringMiddleware
from app.utils.llm import router as llm_router
from app.utils.metrics import metrics
from app.routes.auth_google import router as auth_google_router
from app.db import engine, Base


# Initialize FastAPI app
app = FastAPI(
    title="AI Study Assistant GenAI API",
    description="Production-ready AI learning platform with LangGraph orchestration",
    version="2.0.0"
)

# Setup Templates
templates = Jinja2Templates(directory="app/templates")

# Startup Database Initialization
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up — initializing database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("PostgreSQL tables synchronized.")
    except Exception as e:
        logger.warning(
            f"Database startup skipped (PostgreSQL not available): {e}. "
            "AI endpoints will still function normally."
        )



# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monitoring middleware — must be registered BEFORE other middlewares
app.add_middleware(MonitoringMiddleware)

# Rate Limiting Middleware
app.add_middleware(
    RateLimitMiddleware,
    redis_url=settings.REDIS_URL
)

# Include Authentication Router
app.include_router(auth_google_router)

# Request/Response Models
class LearningRequest(BaseModel):
    user_id: str
    user_input: str
    session_id: Optional[str] = None
    mastered_skills: Optional[list] = []

class LearningResponse(BaseModel):
    success: bool
    session_id: str
    intent: str
    emotional_tone: str
    current_skill: str
    learning_path: list
    agent_outputs: dict
    explanations: dict
    reasoning_chain: list
    confidence_scores: dict
    timestamp: datetime

# API Endpoints
@app.get("/")
async def root():
    return {
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

@app.get("/api/health")
async def health_check():
    # Check Ollama Latency
    avg_latency = llm_router._get_avg_latency()
    
    return {
        "status": "healthy",
        "agents": "operational",
        "langgraph": "active",
        "memory": "connected",
        "ollama": {
            "base_url": llm_router.OLLAMA_BASE_URL,
            "avg_latency_5m": f"{avg_latency:.2f}s",
            "status": "online" if avg_latency < llm_router.LATENCY_THRESHOLD else "high_load"
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/learning/process", response_model=LearningResponse)
async def process_learning_request(request: LearningRequest):
    """
    Main endpoint for processing learning requests through LangGraph
    
    This endpoint:
    1. Initializes state with user input
    2. Executes LangGraph workflow (all 11 agents)
    3. Stores interaction in long-term memory
    4. Returns comprehensive response with explanations
    """
    
    try:
        # Generate session ID if not provided
        session_id = request.session_id or f"session_{datetime.utcnow().timestamp()}"
        
        # Initialize state
        initial_state: AgentState = {
            "user_id": request.user_id,
            "session_id": session_id,
            "user_input": request.user_input,
            "mastered_skills": request.mastered_skills or [],
            "intent": "",
            "emotional_tone": "",
            "agent_outputs": {},
            "execution_path": [],
            "reasoning_chain": [],
            "confidence_scores": {},
            "timestamp": datetime.utcnow()
        }
        
        # Execute LangGraph workflow
        final_state = await learning_graph.ainvoke(initial_state)
        
        # Store in long-term memory
        await memory_store.store_interaction(request.user_id, final_state)
        
        # Build response
        return LearningResponse(
            success=True,
            session_id=session_id,
            intent=final_state.get("intent", ""),
            emotional_tone=final_state.get("emotional_tone", ""),
            current_skill=final_state.get("current_skill", ""),
            learning_path=final_state.get("learning_path_sequence", []),
            agent_outputs=final_state.get("agent_outputs", {}),
            explanations=final_state.get("explanations_map", {}),
            reasoning_chain=final_state.get("reasoning_chain", []),
            confidence_scores=final_state.get("confidence_scores", {}),
            timestamp=final_state.get("timestamp", datetime.utcnow())
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/api/memory/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile from long-term memory"""
    try:
        profile = await memory_store.retrieve_user_profile(user_id)
        return {
            "success": True,
            "user_id": user_id,
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket Manager for real-time progress updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/status/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await manager.connect(websocket)
    try:
        while True:
            # Poll Celery task status
            result = AsyncResult(task_id)
            status = {
                "task_id": task_id,
                "status": result.status,
                "progress": 100 if result.ready() else 50, # Simple progress logic
                "result": result.result if result.ready() else None,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await manager.send_personal_message(json.dumps(status), websocket)
            
            if result.ready():
                break
                
            await asyncio.sleep(1) # Poll every second
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        manager.disconnect(websocket)

@app.get("/api/agents/status")
async def get_agents_status():
    """Get status of all AI agents"""
    return {
        "total_agents": 11,
        "agents": [
            {"name": "Master Orchestrator", "status": "operational", "role": "Intent & emotion detection"},
            {"name": "Personalization", "status": "operational", "role": "Learning style adaptation"},
            {"name": "Skill Graph", "status": "operational", "role": "Prerequisite reasoning"},
            {"name": "Learning Resource", "status": "operational", "role": "Content generation"},
            {"name": "Assessment", "status": "operational", "role": "Adaptive testing"},
            {"name": "Reflection", "status": "operational", "role": "Self-improvement"},
            {"name": "Wellness", "status": "operational", "role": "Burnout prevention"},
            {"name": "Scheduler", "status": "operational", "role": "Study planning"},
            {"name": "Motivation", "status": "operational", "role": "Encouragement"},
            {"name": "Memory", "status": "operational", "role": "Long-term learning"},
            {"name": "Explainability", "status": "operational", "role": "Transparent AI"}
        ],
        "langgraph_workflow": "active",
        "self_reflection": "enabled",
        "long_term_memory": "enabled"
    }

# Additional Request Models for specific agent endpoints
class StudyPlanRequest(BaseModel):
    subject: str
    difficulty: str
    duration: str
    goals: list
    learningStyle: Optional[str] = "visual"

class LearningResourcesRequest(BaseModel):
    topic: str
    level: str
    format: Optional[list] = []
    preferences: Optional[list] = []

class AssessmentRequest(BaseModel):
    subject: str
    difficulty: str
    questionCount: Optional[int] = 10
    topics: Optional[list] = []

class WellnessRequest(BaseModel):
    stress_level: Optional[int] = 5
    study_hours: Optional[int] = 0
    sleep_hours: Optional[int] = 7
    physical_activity: Optional[str] = "moderate"

class ScheduleRequest(BaseModel):
    subjects: list
    available_hours: int
    priorities: list
    deadlines: Optional[list] = []

class MotivationRequest(BaseModel):
    current_mood: Optional[str] = "neutral"
    challenges: Optional[list] = []
    goals: Optional[list] = []
    achievements: Optional[list] = []

class PersonalizationRequest(BaseModel):
    user_id: str
    learning_preferences: Optional[dict] = {}
    performance_data: Optional[dict] = {}

# Specific Agent Endpoints
@app.post("/study-plan")
async def generate_study_plan(request: StudyPlanRequest):
    """Generate personalized study plan using Scheduler agent"""
    try:
        from app.agents.scheduler import scheduler_agent
        
        state = {
            "user_input": f"Create a study plan for {request.subject}",
            "subject": request.subject,
            "difficulty": request.difficulty,
            "duration": request.duration,
            "goals": request.goals,
            "learning_style": request.learningStyle
        }
        
        result = await scheduler_agent.generate(state)
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learning-resources")
async def get_learning_resources(request: LearningResourcesRequest):
    """Get learning resources using Learning Resource agent"""
    try:
        from app.agents.learning_resource import learning_resource_agent
        
        state = {
            "current_skill": request.topic,
            "difficulty_preference": request.level,
            "learning_style": request.preferences[0] if request.preferences else "visual"
        }
        
        result = await learning_resource_agent.generate(state)
        
        return {
            "success": True,
            "data": {
                "resources": result.get("resources", []),
                "difficulty": request.level,
                "estimated_time": "2-4 hours",
                "quality_score": 8.5
            },
            "enhanced": True,
            "ai_curated": True,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assessment")
async def generate_assessment(request: AssessmentRequest):
    """Generate assessment using Assessment agent"""
    try:
        from app.agents.assessment import assessment_agent
        
        state = {
            "current_skill": request.subject,
            "difficulty_preference": request.difficulty,
            "question_count": request.questionCount,
            "topics": request.topics
        }
        
        result = await assessment_agent.generate(state)
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/wellness-assessment")
async def wellness_assessment(request: WellnessRequest):
    """Get wellness assessment using Wellness agent"""
    try:
        from app.agents.wellness import wellness_agent
        
        state = {
            "wellness_metrics": {
                "stress_level": request.stress_level,
                "study_hours": request.study_hours,
                "sleep_hours": request.sleep_hours,
                "physical_activity": request.physical_activity
            }
        }
        
        result = await wellness_agent.generate(state)
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/schedule-optimization")
async def optimize_schedule(request: ScheduleRequest):
    """Optimize schedule using Scheduler agent"""
    try:
        from app.agents.scheduler import scheduler_agent
        
        state = {
            "subjects": request.subjects,
            "available_hours": request.available_hours,
            "priorities": request.priorities,
            "deadlines": request.deadlines
        }
        
        result = await scheduler_agent.generate(state)
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/motivation-boost")
async def get_motivation(request: MotivationRequest):
    """Get motivation boost using Motivation agent"""
    try:
        from app.agents.motivation import motivation_agent
        
        state = {
            "emotional_tone": request.current_mood,
            "challenges": request.challenges,
            "goals": request.goals,
            "achievements": request.achievements
        }
        
        result = await motivation_agent.generate(state)
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/personalization")
async def get_personalization(request: PersonalizationRequest):
    """Get personalization settings using Personalization agent"""
    try:
        from app.agents.personalization import personalization_agent
        
        state = {
            "user_id": request.user_id,
            "learning_preferences": request.learning_preferences,
            "performance_data": request.performance_data
        }
        
        result = await personalization_agent.generate(state)
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/youtube/search")
async def search_youtube(topic: str, max_results: int = 3):
    """Search for educational youtube videos"""
    try:
        from app.utils.youtube import youtube_client
        videos = await youtube_client.search_learning_videos(topic, max_results)
        return {
            "success": True,
            "data": videos,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Rich health check — includes Ollama and system status."""
    from app.utils.ollama_client import ollama_client
    from app.utils.metrics import metrics as m

    ollama_online = await ollama_client.health_check()
    snap = m.snapshot()

    return {
        "status": "healthy",
        "ollama_online": ollama_online,
        "total_requests": snap["total_requests"],
        "error_count": snap["error_count"],
        "avg_response_ms": snap["avg_response_ms"],
        "timestamp": datetime.utcnow().isoformat(),
    }


# ------------------------------------------------------------------ #
#  Ollama Integration Endpoints                                        #
# ------------------------------------------------------------------ #

class AITestRequest(BaseModel):
    prompt: str
    model: Optional[str] = "llama3.2:3b"
    system: Optional[str] = None
    temperature: float = 0.7


@app.post("/test-ai")
async def test_ai(request: AITestRequest):
    """
    Test endpoint for direct Ollama model calls.

    Supports dynamic model switching via the 'model' field.
    Available models: llama3.2:3b, llama3:8b, mistral:7b,
                      qwen2.5:3b-instruct, qwen2.5-coder:7b, KMENTOR_v2.0
    """
    from app.utils.ollama_client import ollama_client
    import time

    start = time.time()

    try:
        response_text = await ollama_client.generate(
            prompt=request.prompt,
            model=request.model,
            system=request.system,
            temperature=request.temperature,
        )
        elapsed = round(time.time() - start, 2)

        return {
            "success": True,
            "model": request.model,
            "prompt": request.prompt,
            "response": response_text,
            "elapsed_seconds": elapsed,
            "timestamp": datetime.utcnow().isoformat(),
        }

    except ConnectionRefusedError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ollama_unavailable",
                "message": str(e),
                "fix": "Run 'ollama serve' in a separate terminal.",
            },
        )
    except TimeoutError as e:
        raise HTTPException(
            status_code=504,
            detail={
                "error": "ollama_timeout",
                "message": str(e),
                "fix": "Try a lighter model (llama3.2:3b) or increase timeout.",
            },
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ollama_error",
                "message": str(e),
            },
        )


@app.get("/ollama/models")
async def list_ollama_models():
    """List all locally installed Ollama models."""
    from app.utils.ollama_client import ollama_client

    try:
        models = await ollama_client.list_models()
        is_online = await ollama_client.health_check()
        return {
            "success": True,
            "online": is_online,
            "models": models,
            "count": len(models),
        }
    except ConnectionRefusedError:
        return {
            "success": False,
            "online": False,
            "models": [],
            "message": "Ollama is not running. Start it with `ollama serve`.",
        }


@app.get("/metrics")
async def get_metrics():
    """
    Live system observability dashboard.

    Returns:
      - total_requests, error_count, average latency
      - per-agent success rates and avg duration
      - per-model call counts and avg latency
      - last 10 slow requests (>5 s)
      - intent distribution
    """
    return metrics.snapshot()


@app.delete("/metrics", include_in_schema=False)
async def reset_metrics():
    """Reset all metrics counters (dev/test use only)."""
    metrics.reset()
    return {"status": "metrics_reset"}


# ------------------------------------------------------------------ #
#  Smart AI Routing Endpoint                                           #
# ------------------------------------------------------------------ #

class SmartAIRequest(BaseModel):
    prompt: str

@app.get("/view-demo")
async def view_demo(request: Request):
    """Render the presentation dashboard."""
    return templates.TemplateResponse("demo.html", {"request": request})


@app.get("/demo")
async def demo_dashboard():
    """
    Presentation-ready diagnostic dashboard.
    Shows the current configuration of the Multi-Agent System.
    """
    from app.agents.orchestrator import orchestrator
    from app.utils.ollama_client import ollama_client
    
    ollama_online = await ollama_client.health_check()
    models = await ollama_client.list_models()
    
    return {
        "system_name": "AI Study Assistant (GenAI v2.0)",
        "demo_mode": settings.DEMO_MODE,
        "ollama_status": "online" if ollama_online else "offline",
        "models_available": models,
        "active_agents": [
            "OrchestratorAgent",
            "LearningAgent",
            "CodingAgent",
            "MentorAgent",
            "EvaluationAgent",
            "MemoryAgent"
        ],
        "demo_prompts": [
            "Explain how recursion works with a simple example.",
            "Write a Python script to scrape a website using BeautifulSoup.",
            "I want to become a full-stack developer in 6 months, help me.",
            "I am feeling overwhelmed with my final year project."
        ]
    }


@app.post("/ai")
async def smart_ai_endpoint(request: SmartAIRequest, fast_request: Request):
    """
    Multi-Agent AI endpoint (Step 4).

    Pipeline:
      1. Classify intent (qwen2.5:3b-instruct)
      2. Retrieve memory context (ChromaDB RAG)
      3. Route through specialist agent pipeline
      4. Evaluate & polish output (mistral:7b)
      5. Store interaction in memory

    Returns structured response with full agent trace.
    """
    from app.agents.orchestrator import orchestrator

    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    try:
        result = await orchestrator.run(prompt=prompt)

        # Pass intent + agents back to MonitoringMiddleware via request.state
        fast_request.state.intent = result.intent
        fast_request.state.agents = result.agents_used

        logger.info(
            f"[/ai] intent={result.intent} "
            f"agents={result.agents_used} "
            f"context={result.context_found} "
            f"elapsed={result.elapsed_total:.2f}s"
        )

        return {
            "success": True,
            "intent": result.intent,
            "agents_used": result.agents_used,
            "model_used": result.agent_details[0].get("model") if result.agent_details else "N/A",
            "context_found": result.context_found,
            "elapsed_seconds": result.elapsed_total,
            "demo_mode": settings.DEMO_MODE,
            "response": result.final_response,
            "agent_trace": result.agent_details,
        }

    except Exception as e:
        logger.exception(f"[/ai] Orchestrator failure")
        fast_request.state.intent = "error"
        raise HTTPException(
            status_code=500,
            detail={"error": "orchestrator_failure", "message": str(e)},
        )



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
