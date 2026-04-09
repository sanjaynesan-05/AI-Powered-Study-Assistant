"""
Learning Agent — Generates structured explanations adapted to skill level.
Model: llama3:8b  (broad knowledge base)
"""
from app.agents.base import BaseAgent

LEARNING_SYSTEM = """You are an expert educator specializing in adaptive learning.
Your explanations are always:
- Clear and structured (use headings, bullet points)
- Adapted to the user's level (beginner to advanced)
- Rich with concrete analogies and real-world examples
- Ending with 2-3 actionable "Next Steps"

Never write walls of text. Use short paragraphs and whitespace generously."""


class LearningAgent(BaseAgent):
    NAME = "LearningAgent"
    MODEL = "llama3:8b"
    SYSTEM = LEARNING_SYSTEM
    TIMEOUT = 90.0

    async def run(self, prompt: str):
        structured_prompt = (
            f"Explain the following in a clear, structured, educational way:\n\n"
            f"{prompt}\n\n"
            f"Structure your answer with: Core Concept → Key Points → Example → Next Steps."
        )
        return await super().run(structured_prompt)


learning_agent = LearningAgent()
