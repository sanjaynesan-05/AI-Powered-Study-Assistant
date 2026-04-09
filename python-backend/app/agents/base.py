"""
Base Agent — All agents inherit from this class.
Provides shared Ollama integration, timing, and structured response format.
"""
import time
import logging
from typing import Optional
from app.utils.ollama_client import ollama_client
from app.config import settings

logger = logging.getLogger(__name__)


class AgentResult:
    # ... (rest of AgentResult remains unchanged)
    def __init__(
        self,
        agent_name: str,
        output: str,
        model_used: str,
        elapsed: float,
        success: bool = True,
        error: Optional[str] = None,
    ):
        self.agent_name = agent_name
        self.output = output
        self.model_used = model_used
        self.elapsed = elapsed
        self.success = success
        self.error = error

    def to_dict(self) -> dict:
        return {
            "agent": self.agent_name,
            "model": self.model_used,
            "success": self.success,
            "elapsed_seconds": round(self.elapsed, 2),
            "output": self.output,
            "error": self.error,
        }


class BaseAgent:
    """
    Base class for all agents in the multi-agent system.
    """

    NAME: str = "BaseAgent"
    MODEL: str = "llama3:8b"
    DEMO_MODEL: str = "llama3.2:3b"
    SYSTEM: str = "You are a helpful AI assistant."
    TIMEOUT: float = 90.0

    def get_model(self) -> str:
        """Select the model based on DEMO_MODE flag."""
        if settings.DEMO_MODE:
            return self.DEMO_MODEL
        return self.MODEL

    async def run(self, prompt: str) -> AgentResult:
        """Execute the agent and return a structured result."""
        start = time.perf_counter()
        model = self.get_model()
        logger.info(f"[{self.NAME}] Starting → model={model} (demo={settings.DEMO_MODE})")

        try:
            output = await ollama_client.generate(
                prompt=prompt,
                model=model,
                system=self.SYSTEM,
                temperature=0.7,
            )
            elapsed = time.perf_counter() - start
            return AgentResult(
                agent_name=self.NAME,
                output=output,
                model_used=model,
                elapsed=elapsed,
            )


        except Exception as e:
            elapsed = time.perf_counter() - start
            logger.error(f"[{self.NAME}] Failed after {elapsed:.2f}s — {e}")
            return AgentResult(
                agent_name=self.NAME,
                output="",
                model_used=self.MODEL,
                elapsed=elapsed,
                success=False,
                error=str(e),
            )
