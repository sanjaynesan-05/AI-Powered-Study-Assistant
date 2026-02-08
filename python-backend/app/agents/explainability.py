"""
Explainability Agent - Provides transparent explanations for all AI decisions
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict

class ExplainabilityAgent:
    """Generates clear justifications for all AI recommendations"""
    
    async def explain(self, state: AgentState) -> Dict:
        """Generate user-friendly explanations for all decisions"""
        
        reasoning_chain = state.get("reasoning_chain", [])
        agent_outputs = state.get("agent_outputs", {})
        
        prompt = f"""
        You are an Explainability Agent. Provide clear, user-friendly justifications.
        
        User asked: "{state['user_input']}"
        
        System Reasoning:
        {chr(10).join(reasoning_chain)}
        
        Generate explanations for:
        1. Why this learning path?
        2. Why this difficulty level?
        3. Why these resources?
        4. Why this schedule?
        5. Why these wellness recommendations?
        
        Format as Q&A pairs that are easy to understand.
        Use simple language, avoid jargon.
        
        Return JSON:
        {{
            "explanations_map": {{
                "Why this learning path?": "explanation",
                "Why this difficulty?": "explanation",
                ...
            }},
            "summary": "One-sentence overall explanation"
        }}
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        return {
            "explanations_map": data.get("explanations_map", {}),
            "agent_outputs": {
                **agent_outputs,
                "explainability": data
            },
            "execution_path": [*state.get("execution_path", []), "explainability"],
            "reasoning_chain": [
                *reasoning_chain,
                f"Explainability: {data.get('summary', 'Provided explanations')}"
            ]
        }

explainability_agent = ExplainabilityAgent()
