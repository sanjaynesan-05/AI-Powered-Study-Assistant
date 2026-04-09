"""
Memory Agent — Retrieves and injects relevant past conversation context.
Uses: ChromaDB + nomic-embed-text
"""
import logging
from app.utils.memory import memory_store

logger = logging.getLogger(__name__)


class MemoryAgent:
    """Dedicated agent for semantic memory retrieval and storage."""

    NAME = "MemoryAgent"

    async def retrieve_context(self, prompt: str) -> str:
        """Retrieve relevant past interactions and return as formatted context string."""
        logger.info(f"[MemoryAgent] Retrieving context for: '{prompt[:50]}...'")
        
        context = await memory_store.retrieve(prompt)
        
        if context:
            logger.info(f"[MemoryAgent] Context found — injecting into pipeline")
            return (
                "## Relevant Context From Past Interactions\n"
                f"{context}\n"
                "---"
            )
        
        logger.info("[MemoryAgent] No relevant context found")
        return ""

    async def store_interaction(self, prompt: str, response: str):
        """Store the completed interaction in memory."""
        await memory_store.store(prompt=prompt, response=response)
        logger.info("[MemoryAgent] Interaction stored")


memory_agent = MemoryAgent()
