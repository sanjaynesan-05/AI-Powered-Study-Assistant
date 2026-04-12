"""
Utility functions for LLM interactions - Exclusively using Local Ollama
"""
import time
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from langchain_community.chat_models import ChatOllama
from app.config import settings
from prometheus_client import Counter, Histogram

logger = logging.getLogger(__name__)

# Prometheus Metrics
LLM_REQUESTS = Counter('llm_requests_total', 'Total LLM requests', ['model', 'provider'])
LLM_LATENCY = Histogram('llm_latency_seconds', 'Latency of LLM requests', ['model', 'provider'])
LLM_FAILURES = Counter('llm_failures_total', 'Total LLM failures', ['model', 'provider'])

class LLMClient:
    """Production-grade client for Local Ollama interactions"""
    
    def __init__(self):
        self.OLLAMA_BASE_URL = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
        self.MODEL = "llama3:8b"
        self._client = None
        
    def _get_client(self):
        if self._client is None:
            self._client = ChatOllama(
                base_url=self.OLLAMA_BASE_URL,
                model=self.MODEL,
                temperature=0.7
            )
        return self._client

    async def ainvoke(self, prompt: str) -> str:
        """Async invoke LLM using Ollama"""
        LLM_REQUESTS.labels(model=self.MODEL, provider="ollama").inc()
        start = time.time()
        
        try:
            client = self._get_client()
            # 30 second timeout for 8B model on consumer hardware
            response = await asyncio.wait_for(client.ainvoke(prompt), timeout=30.0)
            
            latency = time.time() - start
            LLM_LATENCY.labels(model=self.MODEL, provider="ollama").observe(latency)
            logger.info(f"Ollama {self.MODEL} responded in {latency:.2f}s")
            
            return response.content
            
        except asyncio.TimeoutError:
            LLM_FAILURES.labels(model=self.MODEL, provider="ollama").inc()
            logger.error(f"Ollama timeout after 30s for model {self.MODEL}")
            raise RuntimeError(f"Ollama model {self.MODEL} timed out.")
        except Exception as e:
            LLM_FAILURES.labels(model=self.MODEL, provider="ollama").inc()
            logger.error(f"Ollama invocation error: {str(e)}")
            raise

    def invoke(self, prompt: str) -> str:
        """Sync invoke LLM (Wrapper around async)"""
        try:
            # Use run_coroutine_threadsafe or similar if in an event loop, 
            # but for simple sync scripts we can use asyncio.run if no loop is running
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                return asyncio.run(self.ainvoke(prompt))
                
            if loop.is_running():
                # This is tricky in FastAPI, but agents usually call ainvoke
                # If we MUST have sync, we use a separate client or run in executor
                client = ChatOllama(
                    base_url=self.OLLAMA_BASE_URL,
                    model=self.MODEL,
                    temperature=0.7
                )
                response = client.invoke(prompt)
                return response.content
            else:
                return loop.run_until_complete(self.ainvoke(prompt))
                
        except Exception as e:
            logger.error(f"Ollama sync invocation error: {str(e)}")
            raise

    @staticmethod
    def parse_json_response(content: str) -> Dict[str, Any]:
        """Parse JSON from LLM response, handling markdown code blocks"""
        cleaned = content.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed direct JSON parse. Attempting text extraction. Error: {e}")
            start = cleaned.find('{')
            end = cleaned.rfind('}') + 1
            if start != -1 and end != 0:
                try:
                    return json.loads(cleaned[start:end])
                except Exception as inner_e:
                    logger.error(f"Failed to extract JSON from parsed text. Error: {inner_e}")
            
            return {
                "error": f"Failed to parse JSON: {str(e)}",
                "raw_content": content
            }

# Global Instance
llm_client = LLMClient()
router = llm_client # For backward compatibility with files importing 'router'
