"""
Utility functions for LLM interactions - Exclusively using Local Ollama
"""
import time
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from langchain_community.chat_models import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
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
        self.GEMINI_MODEL = "gemini-1.5-flash"
        self._client = None
        self._gemini_client = None
        self.use_fallback = bool(settings.GOOGLE_AI_API_KEY)
        
    def _get_client(self):
        if self._client is None:
            self._client = ChatOllama(
                base_url=self.OLLAMA_BASE_URL,
                model=self.MODEL,
                temperature=0.7
            )
        return self._client

    def _get_gemini(self):
        if self._gemini_client is None and self.use_fallback:
            self._gemini_client = ChatGoogleGenerativeAI(
                model=self.GEMINI_MODEL,
                google_api_key=settings.GOOGLE_AI_API_KEY,
                temperature=0.7
            )
        return self._gemini_client

    async def ainvoke(self, prompt: str) -> str:
        """Async invoke LLM (Ollama first, then Gemini fallback)"""
        start = time.time()
        
        # ── 1. TRY OLLAMA FIRST ──────────────────────────────────────────
        try:
            LLM_REQUESTS.labels(model=self.MODEL, provider="ollama").inc()
            client = self._get_client()
            # 15s timeout for fast failover to cloud
            response = await asyncio.wait_for(client.ainvoke(prompt), timeout=15.0)
            
            latency = time.time() - start
            LLM_LATENCY.labels(model=self.MODEL, provider="ollama").observe(latency)
            logger.info(f"Ollama {self.MODEL} responded in {latency:.2f}s")
            return response.content
            
        except (asyncio.TimeoutError, Exception) as e:
            LLM_FAILURES.labels(model=self.MODEL, provider="ollama").inc()
            if not self.use_fallback:
                logger.error(f"Ollama failed and no fallback available: {str(e)}")
                raise
            
            logger.warning(f"Ollama failed ({type(e).__name__}), falling back to Gemini...")

        # ── 2. FALLBACK TO GEMINI ───────────────────────────────────────
        try:
            LLM_REQUESTS.labels(model=self.GEMINI_MODEL, provider="gemini").inc()
            gemini = self._get_gemini()
            if not gemini:
                raise RuntimeError("Gemini fallback not initialized (missing API key)")
                
            response = await asyncio.wait_for(gemini.ainvoke(prompt), timeout=30.0)
            
            latency = time.time() - start
            LLM_LATENCY.labels(model=self.GEMINI_MODEL, provider="gemini").observe(latency)
            logger.info(f"Gemini {self.GEMINI_MODEL} responded in {latency:.2f}s")
            return response.content
            
        except Exception as ge:
            LLM_FAILURES.labels(model=self.GEMINI_MODEL, provider="gemini").inc()
            logger.error(f"Gemini fallback also failed: {str(ge)}")
            raise RuntimeError(f"All LLM providers failed. Last error: {str(ge)}")

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

    def _get_avg_latency(self) -> float:
        """Heuristic for health check latency reporting"""
        # In a real system we'd pull this from Prometheus or a rolling window
        # For now, return a placeholder or 0.0 if not tracked
        return 0.5

    @property
    def LATENCY_THRESHOLD(self) -> float:
        return 5.0

# Global Instance
llm_client = LLMClient()
router = llm_client # For backward compatibility with files importing 'router'
