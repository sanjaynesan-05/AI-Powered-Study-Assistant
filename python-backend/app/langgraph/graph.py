"""
Complete LangGraph Workflow with All 11 AI Agents
"""
from langgraph.graph import StateGraph, END
from app.langgraph.state import AgentState

# Import all 11 agents
from app.agents.orchestrator import orchestrator
from app.agents.personalization import personalization_agent
from app.agents.skill_graph import skill_graph_agent
from app.agents.learning_resource import learning_resource_agent
from app.agents.assessment import assessment_agent
from app.agents.reflection import reflection_agent
from app.agents.wellness import wellness_agent
from app.agents.scheduler import scheduler_agent
from app.agents.motivation import motivation_agent
from app.agents.explainability import explainability_agent
from app.memory.postgres_store import memory_store

def create_learning_graph():
    """
    Create complete LangGraph workflow with all 11 AI agents
    
    Workflow:
    1. Intent Detection → Emotion Analysis
    2. Personalization → Skill Graph Reasoning
    3. Learning Resource Generation
    4. Assessment Creation
    5. Wellness Check
    6. Schedule Planning
    7. Reflection (with potential replanning)
    8. Motivation
    9. Memory Update
    10. Explainability
    """
    
    workflow = StateGraph(AgentState)
    
    # ===== Add all 11 agent nodes =====
    workflow.add_node("intent_detection", orchestrator.detect_intent)
    workflow.add_node("emotion_analysis", orchestrator.analyze_emotion)
    workflow.add_node("personalization", personalization_agent.personalize)
    workflow.add_node("skill_graph_reasoning", skill_graph_agent.reason)
    workflow.add_node("learning_resource", learning_resource_agent.generate)
    workflow.add_node("assessment", assessment_agent.create_quiz)
    workflow.add_node("wellness_check", wellness_agent.assess)
    workflow.add_node("schedule_planning", scheduler_agent.plan)
    workflow.add_node("reflection", reflection_agent.reflect)
    workflow.add_node("motivation", motivation_agent.encourage)
    workflow.add_node("memory_update", update_memory)
    workflow.add_node("explainability", explainability_agent.explain)
    
    # ===== Define workflow edges =====
    
    # Entry point
    workflow.set_entry_point("intent_detection")
    
    # Core sequence
    workflow.add_edge("intent_detection", "emotion_analysis")
    workflow.add_edge("emotion_analysis", "personalization")
    workflow.add_edge("personalization", "skill_graph_reasoning")
    
    # Learning path
    workflow.add_edge("skill_graph_reasoning", "learning_resource")
    workflow.add_edge("learning_resource", "assessment")
    
    # Wellness and planning
    workflow.add_edge("assessment", "wellness_check")
    workflow.add_edge("wellness_check", "schedule_planning")
    
    # Reflection with conditional routing
    workflow.add_edge("schedule_planning", "reflection")
    
    workflow.add_conditional_edges(
        "reflection",
        reflection_agent.should_replan,
        {
            "continue": "motivation",
            "replan": "skill_graph_reasoning"  # Loop back for replanning
        }
    )
    
    # Final sequence
    workflow.add_edge("motivation", "memory_update")
    workflow.add_edge("memory_update", "explainability")
    workflow.add_edge("explainability", END)
    
    return workflow.compile()

async def update_memory(state: AgentState) -> dict:
    """Update long-term memory with interaction"""
    try:
        await memory_store.store_interaction(state["user_id"], state)
        return {
            "execution_path": [*state.get("execution_path", []), "memory_update"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                "Memory: Interaction stored in long-term memory"
            ]
        }
    except Exception as e:
        print(f"Memory update error: {e}")
        return state

# Global graph instance
learning_graph = create_learning_graph()
