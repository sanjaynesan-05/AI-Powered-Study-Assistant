"""
Test Suite for AI Agents
"""
import pytest
import asyncio
from app.agents.orchestrator import orchestrator
from app.agents.personalization import personalization_agent
from app.agents.skill_graph import skill_graph_agent
from app.agents.reflection import reflection_agent
from app.langgraph.state import AgentState

@pytest.mark.asyncio
async def test_intent_detection():
    """Test intent detection agent"""
    state: AgentState = {
        "user_id": "test_user",
        "session_id": "test_session",
        "user_input": "I want to learn Machine Learning",
        "execution_path": [],
        "reasoning_chain": [],
        "confidence_scores": {}
    }
    
    result = await orchestrator.detect_intent(state)
    
    assert "intent" in result
    assert result["intent"] in ["learning", "assessment", "wellness", "planning", "motivation"]
    assert "current_skill" in result
    assert len(result["reasoning_chain"]) > 0

@pytest.mark.asyncio
async def test_emotion_analysis():
    """Test emotion analysis agent"""
    state: AgentState = {
        "user_id": "test_user",
        "session_id": "test_session",
        "user_input": "I'm feeling stressed about my exams",
        "execution_path": [],
        "reasoning_chain": []
    }
    
    result = await orchestrator.analyze_emotion(state)
    
    assert "emotional_tone" in result
    assert result["emotional_tone"] in ["energized", "neutral", "tired", "frustrated", "stressed", "overwhelmed"]

@pytest.mark.asyncio
async def test_personalization():
    """Test personalization agent"""
    state: AgentState = {
        "user_id": "test_user",
        "user_input": "I want to learn Python",
        "emotional_tone": "excited",
        "user_profile": {},
        "agent_outputs": {},
        "execution_path": [],
        "reasoning_chain": [],
        "confidence_scores": {}
    }
    
    result = await personalization_agent.personalize(state)
    
    assert "learning_style" in result
    assert result["learning_style"] in ["visual", "auditory", "kinesthetic", "reading"]
    assert "difficulty_preference" in result
    assert "pace" in result

def test_skill_graph_reasoning():
    """Test skill graph agent"""
    state: AgentState = {
        "target_skill": "Machine Learning",
        "mastered_skills": ["Python"],
        "agent_outputs": {},
        "execution_path": [],
        "reasoning_chain": []
    }
    
    result = asyncio.run(skill_graph_agent.reason(state))
    
    assert "current_skill" in result
    assert "skill_gaps" in result
    assert "learning_path_sequence" in result
    assert len(result["learning_path_sequence"]) > 0

@pytest.mark.asyncio
async def test_reflection_should_replan():
    """Test reflection agent replanning logic"""
    # Low confidence scenario
    state_low_confidence: AgentState = {
        "agent_outputs": {
            "reflection": {
                "confidence_in_current_path": 0.5,
                "should_replan": True
            }
        },
        "stress_level": 0.3,
        "performance_score": 0.6
    }
    
    result = reflection_agent.should_replan(state_low_confidence)
    assert result == "replan"
    
    # High confidence scenario
    state_high_confidence: AgentState = {
        "agent_outputs": {
            "reflection": {
                "confidence_in_current_path": 0.9,
                "should_replan": False
            }
        },
        "stress_level": 0.2,
        "performance_score": 0.8
    }
    
    result = reflection_agent.should_replan(state_high_confidence)
    assert result == "continue"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
