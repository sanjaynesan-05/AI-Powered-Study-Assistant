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

# Initialize FastAPI app
app = FastAPI(
    title="AI Study Assistant GenAI API",
    description="Production-ready AI learning platform with LangGraph orchestration",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
