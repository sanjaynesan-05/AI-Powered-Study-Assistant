"""FastAPI application for the Student AI Assistant - Integrated with Node.js Backend."""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os

try:
    from dotenv import load_dotenv
    # Load from backend .env
    backend_env = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '.env')
    load_dotenv(backend_env)
except ImportError:
    pass

from orchestrator import create_study_assistant

app = FastAPI(
    title="Python AI Agents for Study Assistant",
    description="Multi-agent AI system integrated with Node.js backend",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5001", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class StudyRequest(BaseModel):
    user_input: str
    user_profile: Optional[Dict[str, Any]] = {}
    student_id: Optional[str] = "demo_student"

class ResourceRequest(BaseModel):
    topic: str
    level: Optional[str] = "intermediate"

class AssessmentRequest(BaseModel):
    skill: str
    difficulty: Optional[str] = "medium"

class WellnessRequest(BaseModel):
    user_data: Optional[Dict[str, Any]] = {}

class MotivationRequest(BaseModel):
    progress: Optional[Dict[str, Any]] = {}

# Global orchestrator instance
orchestrator = None

@app.on_event("startup")
async def startup_event():
    """Initialize the orchestrator on startup."""
    global orchestrator

    # Get API keys from environment
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    print(f"🐍 Python Agents Starting...")
    print(f"DEBUG: GEMINI_API_KEY found: {gemini_api_key is not None}")
    print(f"DEBUG: OPENAI_API_KEY found: {openai_api_key is not None}")

    api_key = gemini_api_key or openai_api_key

    if not api_key:
        print("⚠️ Warning: No API key found. Using demo mode.")
        api_key = "demo-key"

    if gemini_api_key:
        print("✅ Using Google Gemini API for AI operations.")
    elif openai_api_key:
        print("✅ Using OpenAI API for AI operations.")
    else:
        print("⚠️ Using demo mode with mock responses.")

    try:
        orchestrator = create_study_assistant(api_key)
        print("✅ Python AI Agent Orchestrator initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize orchestrator: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    agents_available = [
        "learning_agent",
        "schedule_agent",
        "wellness_agent",
        "assessment_agent",
        "personalization_agent",
        "motivation_agent",
        "orchestrator"
    ] if orchestrator else []

    return {
        "status": "healthy" if orchestrator else "degraded",
        "message": "Python AI agents operational" if orchestrator else "Orchestrator not initialized",
        "agents_available": agents_available,
        "type": "python_agents"
    }

@app.post("/study-plan")
async def create_study_plan(request: StudyRequest):
    """Create a personalized study plan using the multi-agent system."""
    if not orchestrator:
        raise HTTPException(
            status_code=503,
            detail="Study assistant is not available. Please check the API key configuration."
        )

    try:
        # Process the request through the orchestrator
        response = orchestrator.process_request(request.user_input, request.student_id)

        # Ensure all required keys exist
        required_keys = ["greeting", "study_plan", "learning_resources", "wellness_insights",
                        "assessment", "motivational_support", "calendar_events", "metadata"]

        for key in required_keys:
            if key not in response:
                response[key] = {} if key != "calendar_events" else []

        return {
            "success": True,
            "data": response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing study plan: {str(e)}")

@app.post("/learning-resources")
async def get_learning_resources(request: ResourceRequest):
    """Get learning resources for a specific topic."""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not available")

    try:
        user_input = f"Find me learning resources for {request.topic} at {request.level} level"
        response = orchestrator.process_request(user_input, "resource_request")
        
        return {
            "success": True,
            "resources": response.get("learning_resources", {}),
            "topic": request.topic,
            "level": request.level
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting resources: {str(e)}")

@app.post("/assessment")
async def generate_assessment(request: AssessmentRequest):
    """Generate an assessment for a specific skill."""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not available")

    try:
        user_input = f"Create an assessment quiz for {request.skill} at {request.difficulty} difficulty"
        response = orchestrator.process_request(user_input, "assessment_request")
        
        return {
            "success": True,
            "assessment": response.get("assessment", {}),
            "questions": response.get("assessment", {}).get("questions", []),
            "skill": request.skill,
            "difficulty": request.difficulty
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating assessment: {str(e)}")

@app.post("/wellness-check")
async def perform_wellness_check(request: WellnessRequest):
    """Perform a wellness check."""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not available")

    try:
        user_input = "Perform a wellness check and provide recommendations"
        response = orchestrator.process_request(user_input, "wellness_check")
        
        return {
            "success": True,
            "wellness": response.get("wellness_insights", {}),
            "recommendations": response.get("wellness_insights", {}).get("recommendations", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing wellness check: {str(e)}")

@app.post("/motivation")
async def get_motivation(request: MotivationRequest):
    """Get motivational support."""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not available")

    try:
        user_input = "Give me motivational support to keep learning"
        response = orchestrator.process_request(user_input, "motivation_request")
        
        return {
            "success": True,
            "motivation": response.get("motivational_support", {}),
            "message": response.get("motivational_support", {}).get("message", "Keep going!"),
            "tips": response.get("motivational_support", {}).get("tips", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting motivation: {str(e)}")

@app.get("/agents/status")
async def get_agents_status():
    """Get status of all Python agents."""
    if not orchestrator:
        return {"error": "Orchestrator not initialized", "status": "unavailable"}

    return {
        "status": "active",
        "orchestrator": "active",
        "learning_agent": "active",
        "schedule_agent": "active",
        "wellness_agent": "active",
        "assessment_agent": "active",
        "personalization_agent": "active",
        "motivation_agent": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
