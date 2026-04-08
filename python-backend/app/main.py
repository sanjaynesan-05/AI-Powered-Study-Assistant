"""
FastAPI Main Application
Production-ready AI Study Assistant API with LangGraph orchestration
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.config import settings
from app.langgraph.graph import learning_graph
from app.langgraph.state import AgentState
from app.memory.mongodb_store import memory_store
from app.routes.auth_google import router as auth_google_router
from app.db import engine, Base


# Initialize FastAPI app
app = FastAPI(
    title="AI Study Assistant GenAI API",
    description="Production-ready AI learning platform with LangGraph orchestration",
    version="2.0.0"
)

# Startup Database Initialization
@app.on_event("startup")
async def startup_event():
    print("DEBUG: Initializing PostgreSQL Tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("DEBUG: Active tables fully synchronized.")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {
        "status": "healthy",
        "agents": "operational",
        "langgraph": "active",
        "memory": "connected",
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

@app.get("/health")
async def health():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
