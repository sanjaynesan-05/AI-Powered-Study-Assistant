"""
Personalization Agent - Adapts to user's learning preferences
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict

class PersonalizationAgent:
    """Infers and adapts to user learning style and preferences"""
    
    async def personalize(self, state: AgentState) -> Dict:
        """Analyze user and personalize experience"""
        
        user_profile = state.get("user_profile", {})
        emotional_tone = state.get("emotional_tone", "neutral")
        
        prompt = f"""
        Personalize the learning experience for this user:
        
        User Input: {state['user_input']}
        Emotional State: {emotional_tone}
        Historical Profile: {user_profile}
        
        Infer:
        1. Learning Style: visual|auditory|kinesthetic|reading
        2. Difficulty Preference: beginner|intermediate|advanced
        3. Pace: slow|moderate|fast
        4. Preferred Content: ["video", "article", "interactive", "practice"]
        5. Session Length: 15min|30min|1hour|2hours
        
        Return JSON with reasoning for each inference.
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        return {
            "learning_style": data.get("learning_style", "visual"),
            "difficulty_preference": data.get("difficulty_preference", "intermediate"),
            "pace": data.get("pace", "moderate"),
            "preferences": {
                "content_types": data.get("preferred_content", ["video", "article"]),
                "session_length": data.get("session_length", "1hour")
            },
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "personalization": data
            },
            "execution_path": [*state.get("execution_path", []), "personalization"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Personalization: {data.get('learning_style')} learner, {data.get('difficulty_preference')} level"
            ],
            "confidence_scores": {
                **state.get("confidence_scores", {}),
                "personalization": data.get("confidence", 0.7)
            }
        }

personalization_agent = PersonalizationAgent()
