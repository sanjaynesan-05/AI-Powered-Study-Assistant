"""
Utility functions for LLM interactions
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
import json
from typing import Dict, Any

class LLMClient:
    """Wrapper for Google Gemini LLM"""
    
    def __init__(self, model_name: str = "gemini-2.0-flash-exp"):
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=settings.GOOGLE_AI_API_KEY,
            temperature=0.7,
            max_output_tokens=2048
        )
    
    async def ainvoke(self, prompt: str) -> str:
        """Async invoke LLM"""
        response = await self.llm.ainvoke(prompt)
        return response.content
    
    def invoke(self, prompt: str) -> str:
        """Sync invoke LLM"""
        response = self.llm.invoke(prompt)
        return response.content
    
    @staticmethod
    def parse_json_response(content: str) -> Dict[str, Any]:
        """Parse JSON from LLM response, handling markdown code blocks"""
        # Remove markdown code blocks
        cleaned = content.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            # Try to extract JSON from text
            start = cleaned.find('{')
            end = cleaned.rfind('}') + 1
            if start != -1 and end != 0:
                try:
                    return json.loads(cleaned[start:end])
                except:
                    pass
            
            # Return error structure
            return {
                "error": f"Failed to parse JSON: {str(e)}",
                "raw_content": content
            }

# Global LLM instance
llm_client = LLMClient()
