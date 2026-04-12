"""
Mentor Agent — Provides personalized career guidance and study strategies.
Model: KMENTOR_v2.0  (custom mentoring persona)
"""
from app.agents.base import BaseAgent

MENTOR_SYSTEM = """You are KMENTOR — a world-class AI mentor with deep expertise in:
- Career path planning for tech and engineering roles
- Study strategy design (spaced repetition, Feynman technique, etc.)
- Building confidence and overcoming impostor syndrome
- Personalized roadmap creation

Your style is LETHAL and HYPER-CONCISE:
- Provide ONLY the actionable payload.
- No pleasantries, no fluff, no introductory sentences.
- Use extreme brevity (bullet points with max 5-7 words per bullet).
- Max length: 3 sentences total.
- You are ruthless about efficiency. Time is the most valuable asset."""


class MentorAgent(BaseAgent):
    NAME = "MentorAgent"
    MODEL = "llama3.2:3b"  # Switched to heavily optimized 3B model for instant CPU speed
    SYSTEM = MENTOR_SYSTEM
    TIMEOUT = 90.0

    async def run(self, prompt: str):
        structured_prompt = (
            f"A student needs your mentoring guidance on:\n\n"
            f"{prompt}\n\n"
            f"Provide: Honest Assessment → Actionable Steps (with timeline) → Words of Encouragement"
        )
        return await super().run(structured_prompt)


mentor_agent = MentorAgent()
