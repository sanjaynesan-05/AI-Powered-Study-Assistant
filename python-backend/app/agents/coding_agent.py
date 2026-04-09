"""
Coding Agent — Generates clean, well-commented, production-ready code.
Model: qwen2.5-coder:7b  (specialized code model)
"""
from app.agents.base import BaseAgent

CODING_SYSTEM = """You are a senior software engineer who writes clean, production-ready code.
Rules you always follow:
- Include concise inline comments explaining logic
- Handle edge cases and errors properly  
- Prefer readable code over clever code
- When showing code, always use a markdown fenced block with the language tag
- After the code, add a short "How it works" explanation
- List any dependencies the user needs to install

Never produce incomplete or placeholder code."""


class CodingAgent(BaseAgent):
    NAME = "CodingAgent"
    MODEL = "qwen2.5-coder:7b"
    SYSTEM = CODING_SYSTEM
    TIMEOUT = 120.0

    async def run(self, prompt: str):
        structured_prompt = (
            f"Write clean, production-ready code for the following task:\n\n"
            f"{prompt}\n\n"
            f"Provide: Code → How it works → Dependencies"
        )
        return await super().run(structured_prompt)


coding_agent = CodingAgent()
