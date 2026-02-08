"""
Wellness & Emotion Agent - Monitors wellness and prevents burnout
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict, List
from datetime import datetime, timedelta

class WellnessAgent:
    """Monitors student wellness and provides recommendations"""
    
    async def assess(self, state: AgentState) -> Dict:
        """Assess user wellness and provide recommendations"""
        
        emotional_tone = state.get("emotional_tone", "neutral")
        user_profile = state.get("user_profile", {})
        
        prompt = f"""
        You are a Wellness Agent monitoring student health and preventing burnout.
        
        Current State:
        - Emotional Tone: {emotional_tone}
        - User Profile: {user_profile}
        
        Assess:
        1. Fatigue Level (0.0 - 1.0)
           - 0.0-0.3: Well-rested
           - 0.3-0.6: Moderate fatigue
           - 0.6-1.0: High fatigue
        
        2. Stress Level (0.0 - 1.0)
           - 0.0-0.3: Low stress
           - 0.3-0.6: Moderate stress
           - 0.6-1.0: High stress
        
        3. Emotional State: energized|neutral|tired|frustrated|stressed|overwhelmed|excited
        
        4. Burnout Risk: low|medium|high
        
        Provide:
        - wellness_recommendations: List of actionable recommendations
        - immediate_actions: If intervention needed
        - study_load_adjustment: Suggested changes
        
        Return JSON.
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        fatigue = data.get("fatigue_level", 0.3)
        stress = data.get("stress_level", 0.2)
        emotional_state = data.get("emotional_state", "neutral")
        burnout_risk = data.get("burnout_risk", "low")
        
        # Generate wellness recommendations
        recommendations = await self._generate_recommendations(fatigue, stress, emotional_state)
        
        return {
            "fatigue_level": fatigue,
            "stress_level": stress,
            "emotional_state": emotional_state,
            "burnout_risk": burnout_risk,
            "wellness_recommendations": recommendations,
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "wellness": {
                    "fatigue_level": fatigue,
                    "stress_level": stress,
                    "emotional_state": emotional_state,
                    "burnout_risk": burnout_risk,
                    "needs_intervention": fatigue > 0.7 or stress > 0.6,
                    "recommendation_count": len(recommendations)
                }
            },
            "execution_path": [*state.get("execution_path", []), "wellness"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Wellness: {emotional_state}, burnout risk {burnout_risk}"
            ]
        }
    
    async def _generate_recommendations(self, fatigue: float, stress: float, emotional_state: str) -> List[Dict]:
        """Generate personalized wellness recommendations"""
        
        recommendations = []
        
        # High fatigue recommendations
        if fatigue > 0.6:
            recommendations.append({
                "type": "immediate",
                "priority": "high",
                "title": "Take a Break",
                "description": "You're showing signs of fatigue. Take a 15-minute break.",
                "action": "Step away from screen, stretch, hydrate"
            })
        
        # High stress recommendations
        if stress > 0.6:
            recommendations.append({
                "type": "stress_management",
                "priority": "high",
                "title": "Stress Reduction",
                "description": "Try a 5-minute breathing exercise",
                "action": "Deep breathing: 4 seconds in, 4 seconds hold, 4 seconds out"
            })
        
        # General wellness
        recommendations.append({
            "type": "preventive",
            "priority": "medium",
            "title": "Stay Hydrated",
            "description": "Keep water nearby while studying",
            "action": "Drink water every 30 minutes"
        })
        
        # Emotional state specific
        if emotional_state in ["frustrated", "overwhelmed"]:
            recommendations.append({
                "type": "emotional_support",
                "priority": "high",
                "title": "Break Down Tasks",
                "description": "Large tasks can feel overwhelming. Break them into smaller steps.",
                "action": "Focus on one small task at a time"
            })
        
        return recommendations

wellness_agent = WellnessAgent()
