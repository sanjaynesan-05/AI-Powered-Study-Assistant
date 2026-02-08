"""
LangGraph State Schema
Defines the shared state structure for all AI agents
"""
from typing import TypedDict, List, Dict, Optional, Any
from datetime import datetime

class AgentState(TypedDict, total=False):
    """
    Global state shared across all agents in the LangGraph workflow.
    This state is passed between agents and updated as the workflow progresses.
    """
    
    # ===== User Context =====
    user_id: str
    session_id: str
    user_input: str
    intent: str
    emotional_tone: str
    
    # ===== Personalization =====
    learning_style: str              # visual, auditory, kinesthetic, reading
    difficulty_preference: str       # beginner, intermediate, advanced
    pace: str                        # slow, moderate, fast
    preferences: Dict[str, Any]
    
    # ===== Skill Graph =====
    current_skill: str
    target_skill: str
    skill_dependencies: Dict[str, List[str]]
    mastered_skills: List[str]
    skill_gaps: List[str]
    learning_path_sequence: List[str]
    
    # ===== Learning Resources =====
    resources: List[Dict[str, Any]]
    explanations: List[str]
    generated_content: Dict[str, Any]
    
    # ===== Assessment =====
    quiz_questions: List[Dict[str, Any]]
    user_answers: List[Dict[str, Any]]
    performance_score: float
    misconceptions: List[str]
    strong_areas: List[str]
    weak_areas: List[str]
    
    # ===== Wellness =====
    fatigue_level: float             # 0.0 - 1.0
    stress_level: float              # 0.0 - 1.0
    emotional_state: str             # energized, neutral, tired, stressed, overwhelmed
    wellness_recommendations: List[Dict[str, Any]]
    burnout_risk: str                # low, medium, high
    
    # ===== Schedule =====
    study_plan: Dict[str, Any]
    calendar_events: List[Dict[str, Any]]
    optimal_session_length: str
    best_study_time: str
    
    # ===== Motivation =====
    motivational_messages: List[str]
    milestones: List[Dict[str, Any]]
    achievements: List[Dict[str, Any]]
    next_goal: Dict[str, Any]
    
    # ===== Memory =====
    long_term_memory: Dict[str, Any]
    user_profile: Dict[str, Any]
    past_struggles: List[str]
    success_patterns: List[str]
    interaction_history: List[Dict[str, Any]]
    
    # ===== Reflection =====
    reflection_insights: List[str]
    improvement_suggestions: List[str]
    should_replan: bool
    confidence_in_current_path: float
    
    # ===== Explainability =====
    explanations_map: Dict[str, str]
    reasoning_chain: List[str]
    decision_justifications: Dict[str, str]
    
    # ===== Metadata =====
    agent_outputs: Dict[str, Any]
    execution_path: List[str]
    confidence_scores: Dict[str, float]
    timestamp: datetime
    errors: List[Dict[str, Any]]
