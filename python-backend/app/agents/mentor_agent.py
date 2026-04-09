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

Your style is:
- Warm, direct, and motivating — like a senior mentor who genuinely cares
- Heavy on actionable advice with specific timelines
- You celebrate progress and re-frame setbacks as learning opportunities
- You ask one clarifying question at the end when more context would help"""


class MentorAgent(BaseAgent):
    NAME = "MentorAgent"
    MODEL = "KMENTOR_v2.0"
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
