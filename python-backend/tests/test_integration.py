"""
Comprehensive Integration Tests
Tests the complete LangGraph workflow with all 11 agents
"""
import pytest
import asyncio
from app.langgraph.graph import learning_graph
from app.langgraph.state import AgentState
from datetime import datetime

@pytest.mark.asyncio
async def test_complete_workflow_learning_intent():
    """Test complete workflow for learning intent"""
    
    initial_state: AgentState = {
        "user_id": "test_user_001",
        "session_id": "test_session_001",
        "user_input": "I want to learn Machine Learning",
        "mastered_skills": ["Python", "Mathematics Basics"],
        "intent": "",
        "emotional_tone": "",
        "agent_outputs": {},
        "execution_path": [],
        "reasoning_chain": [],
        "confidence_scores": {},
        "timestamp": datetime.utcnow()
    }
    
    # Execute complete LangGraph workflow
    final_state = await learning_graph.ainvoke(initial_state)
    
    # Verify all agents executed
    assert "intent" in final_state
    assert "emotional_tone" in final_state
    assert "learning_style" in final_state
    assert "current_skill" in final_state
    assert "explanations_map" in final_state
    
    # Verify execution path includes all agents
    execution_path = final_state.get("execution_path", [])
    expected_agents = [
        "intent_detection",
        "emotion_analysis",
        "personalization",
        "skill_graph",
        "learning_resource",
        "assessment",
        "wellness",
        "scheduler",
        "reflection",
        "motivation",
        "memory_update",
        "explainability"
    ]
    
    for agent in expected_agents:
        assert any(agent in step for step in execution_path), f"Agent {agent} not in execution path"
    
    # Verify reasoning chain
    assert len(final_state.get("reasoning_chain", [])) > 0
    
    # Verify agent outputs
    agent_outputs = final_state.get("agent_outputs", {})
    assert "personalization" in agent_outputs
    assert "skill_graph" in agent_outputs
    assert "reflection" in agent_outputs
    assert "explainability" in agent_outputs
    
    print("✅ Complete workflow test PASSED")
    return final_state

@pytest.mark.asyncio
async def test_stressed_user_workflow():
    """Test workflow with stressed user - should trigger wellness interventions"""
    
    initial_state: AgentState = {
        "user_id": "test_user_002",
        "session_id": "test_session_002",
        "user_input": "I'm feeling overwhelmed and stressed about learning React",
        "mastered_skills": ["JavaScript"],
        "intent": "",
        "emotional_tone": "",
        "agent_outputs": {},
        "execution_path": [],
        "reasoning_chain": [],
        "confidence_scores": {},
        "timestamp": datetime.utcnow()
    }
    
    final_state = await learning_graph.ainvoke(initial_state)
    
    # Verify emotional state detected
    assert final_state.get("emotional_tone") in ["stressed", "overwhelmed", "frustrated"]
    
    # Verify wellness recommendations provided
    wellness_output = final_state.get("agent_outputs", {}).get("wellness", {})
    assert wellness_output is not None
    
    # Should have high stress/fatigue levels
    assert final_state.get("stress_level", 0) > 0.3 or final_state.get("fatigue_level", 0) > 0.3
    
    # Should have wellness recommendations
    assert len(final_state.get("wellness_recommendations", [])) > 0
    
    print("✅ Stressed user workflow test PASSED")
    return final_state

@pytest.mark.asyncio
async def test_skill_graph_prerequisite_detection():
    """Test skill graph correctly identifies prerequisites"""
    
    initial_state: AgentState = {
        "user_id": "test_user_003",
        "session_id": "test_session_003",
        "user_input": "I want to learn Deep Learning",
        "mastered_skills": [],  # No skills mastered
        "intent": "",
        "emotional_tone": "",
        "agent_outputs": {},
        "execution_path": [],
        "reasoning_chain": [],
        "confidence_scores": {},
        "timestamp": datetime.utcnow()
    }
    
    final_state = await learning_graph.ainvoke(initial_state)
    
    # Should identify prerequisites needed
    skill_gaps = final_state.get("skill_gaps", [])
    assert len(skill_gaps) > 0, "Should identify missing prerequisites"
    
    # Current skill should be a prerequisite, not Deep Learning
    current_skill = final_state.get("current_skill", "")
    assert current_skill != "Deep Learning", "Should start with prerequisites"
    
    # Should have learning path
    learning_path = final_state.get("learning_path_sequence", [])
    assert len(learning_path) > 0
    assert "Deep Learning" in learning_path  # Should be in path
    
    print("✅ Skill graph prerequisite detection test PASSED")
    return final_state

if __name__ == "__main__":
    print("Running comprehensive integration tests...\n")
    
    # Run tests
    asyncio.run(test_complete_workflow_learning_intent())
    asyncio.run(test_stressed_user_workflow())
    asyncio.run(test_skill_graph_prerequisite_detection())
    
    print("\n✅ All integration tests PASSED!")
