"""
Master Orchestrator Agent - Coordinates all AI agents using LangGraph
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict

class MasterOrchestrator:
    """Analyzes intent and coordinates agent execution"""
    
    async def detect_intent(self, state: AgentState) -> Dict:
        """Detect user intent from input"""
        
        prompt = f"""
        Analyze this student request and determine the primary intent:
        
        User Input: "{state['user_input']}"
        
        Classify intent as ONE of:
        - learning: wants to learn a new skill/topic
        - assessment: wants to test knowledge
        - wellness: feeling tired/stressed/overwhelmed
        - planning: needs study schedule/plan
        - motivation: needs encouragement
        - explanation: wants clarification on something
        - career: career guidance/resume help
        
        Return JSON:
        {{
            "intent": "primary_intent",
            "confidence": 0.0-1.0,
            "secondary_intents": ["intent1", "intent2"],
            "extracted_topic": "topic if mentioned",
            "urgency": "low|medium|high"
        }}
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        return {
            "intent": data.get("intent", "learning"),
            "current_skill": data.get("extracted_topic", "General Studies"),
            "target_skill": data.get("extracted_topic", "General Studies"),
            "execution_path": ["intent_detection"],
            "reasoning_chain": [f"Intent: {data.get('intent')} (confidence: {data.get('confidence', 0.5):.2f})"],
            "confidence_scores": {"intent_detection": data.get("confidence", 0.5)}
        }
    
    async def analyze_emotion(self, state: AgentState) -> Dict:
        """Analyze emotional tone of user input"""
        
        prompt = f"""
        Analyze the emotional tone of this message:
        
        "{state['user_input']}"
        
        Determine:
        - emotional_tone: energized|neutral|tired|frustrated|stressed|overwhelmed|excited|confused
        - sentiment: positive|neutral|negative
        - needs_support: true|false
        
        Return JSON.
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        return {
            "emotional_tone": data.get("emotional_tone", "neutral"),
            "execution_path": [*state.get("execution_path", []), "emotion_analysis"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Emotion: {data.get('emotional_tone')} ({data.get('sentiment')} sentiment)"
            ]
        }

orchestrator = MasterOrchestrator()
