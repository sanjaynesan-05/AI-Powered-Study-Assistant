"""
Evaluation Agent — Reviews and improves another agent's output for quality.
Model: mistral:7b  (strong analytical and reasoning model)
"""
from app.agents.base import BaseAgent

EVALUATION_SYSTEM = """You are a strict quality-control AI that reviews and improves AI responses.
Your task:
1. Read the original question and the draft answer
2. Identify any gaps, inaccuracies, or unclear sections
3. Produce a FINAL, IMPROVED version of the answer

Rules:
- Keep what is good. Only rewrite what is unclear or incomplete
- Do NOT add filler phrases like "Great question!" or "Sure!"
- Your output must be the final polished answer — not a critique
- If the draft is already high quality, return it with only minor polish"""


class EvaluationAgent(BaseAgent):
    NAME = "EvaluationAgent"
    MODEL = "mistral:7b"
    DEMO_MODEL = "qwen2.5:3b-instruct"
    SYSTEM = EVALUATION_SYSTEM
    TIMEOUT = 90.0

    async def run(self, original_prompt: str, draft_response: str):  # type: ignore[override]
        review_prompt = (
            f"## Original Question\n{original_prompt}\n\n"
            f"## Draft Answer (to improve)\n{draft_response}\n\n"
            f"## Your Task\n"
            f"Review the draft. Fix any issues. Output the final, polished answer ONLY — "
            f"no preamble, no meta-commentary."
        )
        return await super().run(review_prompt)


evaluation_agent = EvaluationAgent()
