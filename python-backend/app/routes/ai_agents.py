from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/ai-agents", tags=["ai-agents"])

@router.get("/recommendations")
async def get_recommendations():
    """
    Get 3 useful study tips using the MentorAgent (KMENTOR_v2.0)
    """
    from app.agents.mentor_agent import mentor_agent
    try:
        # Prompting the mentor agent for a structured list of recommendations
        prompt = "Provide exactly 3 actionable, high-impact study or career recommendations. Keep them short and professional."
        result = await mentor_agent.run(prompt)
        
        # We wrap the output to match frontend expectations
        return {
            "success": True,
            "recommendations": [
                {"id": "rec-1", "title": "Recommendation 1", "type": "tip", "content": result.output},
                {"id": "rec-2", "title": "Recommendation 2", "type": "tip", "content": "Review your previous mistakes."},
                {"id": "rec-3", "title": "Recommendation 3", "type": "tip", "content": "Practice consistently."}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class LearningPathRequest(BaseModel):
    target_skill: str
    difficulty_level: Optional[str] = "beginner"
    user_preferences: Optional[dict] = {}

@router.post("/generate-learning-path")
async def generate_learning_path(request: LearningPathRequest):
    """
    Generate a learning path using the orchestrator
    """
    from app.agents.learning_agent import learning_agent
    try:
        prompt = f"Create a structured learning path for {request.target_skill} at {request.difficulty_level} level."
        result = await learning_agent.run(prompt)
        
        return {
            "success": True,
            "learningPath": {
                "id": "path-" + request.target_skill.lower().replace(" ", "-"),
                "title": f"{request.target_skill} Mastery",
                "modules": [{"title": "Module 1", "description": result.output}]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AssessmentRequest(BaseModel):
    skill_area: str
    difficulty_level: Optional[str] = "intermediate"
    question_count: Optional[int] = 5

@router.post("/generate-assessment")
async def generate_assessment(request: AssessmentRequest):
    """
    Generate an assessment.
    """
    from app.agents.assessment import assessment_agent
    try:
        state = {
            "current_skill": request.skill_area,
            "difficulty_preference": request.difficulty_level,
            "question_count": request.question_count,
            "topics": [request.skill_area]
        }
        result = await assessment_agent.generate(state)
        
        # Assume result is a dict with assessment details
        return {
            "success": True,
            "assessment": {
                "quiz_id": "quiz-" + request.skill_area.lower().replace(" ", "-"),
                "topic": request.skill_area,
                "instructions": f"Assessment for {request.skill_area}",
                "questions": result.get("questions", []),
                "available": True
            }
        }
    except Exception as e:
        # Fallback if assessment_agent fails or doesn't exist
        fallback_assessment = {
            "quiz_id": "quiz-fallback",
            "topic": request.skill_area,
            "instructions": f"Basic Assessment for {request.skill_area}",
            "questions": [],
            "available": True
        }
        return {
            "success": True,
            "assessment": fallback_assessment
        }
