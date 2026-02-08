"""
Reflection Agent - Self-improving AI that critiques and improves system behavior
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict

class ReflectionAgent:
    """Analyzes agent outputs and suggests improvements"""
    
    async def reflect(self, state: AgentState) -> Dict:
        """Analyze previous agent outputs and suggest improvements"""
        
        agent_outputs = state.get("agent_outputs", {})
        performance_score = state.get("performance_score", 0.5)
        emotional_state = state.get("emotional_state", "neutral")
        
        prompt = f"""
        You are a Reflection Agent analyzing the AI learning system's performance.
        
        User Input: {state['user_input']}
        Intent: {state.get('intent')}
        Emotional State: {emotional_state}
        Performance Score: {performance_score}
        
        Agent Outputs:
        {self._format_agent_outputs(agent_outputs)}
        
        Analyze:
        1. What worked well?
        2. What could be improved?
        3. Is the difficulty appropriate?
        4. Is the emotional state being addressed?
        5. Should we adjust the learning path?
        
        Provide:
        - reflection_insights: List[str] (observations)
        - improvement_suggestions: List[str] (actionable improvements)
        - should_replan: bool (true if major adjustment needed)
        - confidence_in_current_path: 0.0-1.0
        - recommended_adjustments: Dict
        
        Return JSON.
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        return {
            "reflection_insights": data.get("reflection_insights", []),
            "improvement_suggestions": data.get("improvement_suggestions", []),
            "should_replan": data.get("should_replan", False),
            "confidence_in_current_path": data.get("confidence_in_current_path", 0.7),
            "agent_outputs": {
                **agent_outputs,
                "reflection": data
            },
            "execution_path": [*state.get("execution_path", []), "reflection"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Reflection: Confidence {data.get('confidence_in_current_path', 0.7):.2f}, Replan: {data.get('should_replan', False)}"
            ]
        }
    
    def should_replan(self, state: AgentState) -> str:
        """Decide if we need to replan"""
        reflection = state.get("agent_outputs", {}).get("reflection", {})
        
        should_replan = (
            reflection.get("confidence_in_current_path", 1.0) < 0.6 or
            state.get("stress_level", 0) > 0.7 or
            state.get("performance_score", 1.0) < 0.4 or
            reflection.get("should_replan", False)
        )
        
        return "replan" if should_replan else "continue"
    
    def _format_agent_outputs(self, outputs: Dict) -> str:
        """Format agent outputs for prompt"""
        formatted = []
        for agent, output in outputs.items():
            formatted.append(f"- {agent}: {str(output)[:100]}...")
        return "\n".join(formatted)

reflection_agent = ReflectionAgent()
