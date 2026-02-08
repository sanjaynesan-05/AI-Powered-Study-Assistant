"""
Motivation & Coach Agent - Provides personalized motivation and coaching
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict, List

class MotivationAgent:
    """Provides personalized motivation and coaching"""
    
    async def encourage(self, state: AgentState) -> Dict:
        """Generate personalized motivational content"""
        
        current_skill = state.get("current_skill", "")
        performance = state.get("performance_score", 0.5)
        emotional_state = state.get("emotional_state", "neutral")
        fatigue = state.get("fatigue_level", 0.3)
        misconceptions = state.get("misconceptions", [])
        
        prompt = f"""
        You are a Motivation Coach for a student learning {current_skill}.
        
        Student State:
        - Performance Score: {performance:.2f}
        - Emotional State: {emotional_state}
        - Fatigue Level: {fatigue:.2f}
        - Misconceptions: {len(misconceptions)}
        
        Provide personalized motivation:
        
        1. Primary Message (warm, encouraging, specific to their situation)
        2. Daily Affirmation (positive, empowering)
        3. Progress Celebration (if applicable)
        4. Next Achievable Goal (specific, realistic)
        5. Energy Boost Message (if tired)
        
        Adapt tone based on emotional state:
        - If struggling (low performance): empathetic, reframe failures as learning
        - If succeeding (high performance): celebratory, challenge to next level
        - If tired: gentle, encouraging rest
        - If stressed: calming, break down into smaller steps
        - If frustrated: patient, show progress made
        
        Return JSON:
        {{
            "primary_message": "main motivational message",
            "daily_affirmation": "positive affirmation",
            "progress_celebration": "celebration if applicable",
            "next_goal": {{
                "goal": "specific goal",
                "motivation": "why this goal",
                "estimated_time": "time to achieve"
            }},
            "energy_boost": {{
                "message": "encouraging message",
                "type": "celebration|encouragement|rest_reminder"
            }}
        }}
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        # Identify milestones
        milestones = self._identify_milestones(state)
        
        return {
            "motivational_messages": [data.get("primary_message", "You're doing great!")],
            "milestones": milestones,
            "next_goal": data.get("next_goal", {}),
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "motivation": {
                    "primary_message": data.get("primary_message", ""),
                    "daily_affirmation": data.get("daily_affirmation", ""),
                    "next_goal": data.get("next_goal", {}).get("goal", ""),
                    "tone": self._determine_tone(emotional_state, performance)
                }
            },
            "execution_path": [*state.get("execution_path", []), "motivation"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Motivation: {data.get('primary_message', '')[:50]}..."
            ]
        }
    
    def _identify_milestones(self, state: AgentState) -> List[Dict]:
        """Identify achieved milestones"""
        
        milestones = []
        performance = state.get("performance_score", 0)
        
        if performance > 0.8:
            milestones.append({
                "type": "high_performance",
                "title": "Excellent Performance! 🎉",
                "description": "You scored above 80%",
                "achieved_at": "now"
            })
        
        if performance > 0.6:
            milestones.append({
                "type": "good_progress",
                "title": "Good Progress! 👍",
                "description": "You're understanding the concepts well",
                "achieved_at": "now"
            })
        
        # Check if completed a skill
        mastered_skills = state.get("mastered_skills", [])
        if mastered_skills:
            milestones.append({
                "type": "skill_mastery",
                "title": f"Mastered {len(mastered_skills)} Skills! 🏆",
                "description": f"You've mastered: {', '.join(mastered_skills[-3:])}",
                "achieved_at": "now"
            })
        
        return milestones
    
    def _determine_tone(self, emotional_state: str, performance: float) -> str:
        """Determine appropriate motivational tone"""
        
        if emotional_state in ["frustrated", "overwhelmed"]:
            return "empathetic_supportive"
        elif emotional_state in ["tired", "stressed"]:
            return "gentle_encouraging"
        elif performance > 0.7:
            return "celebratory_challenging"
        elif performance < 0.4:
            return "patient_reframing"
        else:
            return "encouraging_positive"

motivation_agent = MotivationAgent()
