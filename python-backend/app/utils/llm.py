"""
Utility functions for LLM interactions with production-grade routing
"""
import time
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.chat_models import ChatOllama
from app.config import settings
from prometheus_client import Counter, Histogram

logger = logging.getLogger(__name__)

# Prometheus Metrics
LLM_REQUESTS = Counter('llm_requests_total', 'Total LLM requests', ['model', 'provider'])
LLM_LATENCY = Histogram('llm_latency_seconds', 'Latency of LLM requests', ['model', 'provider'])
LLM_FAILURES = Counter('llm_failures_total', 'Total LLM failures', ['model', 'provider'])

class LatencyMetric:
    def __init__(self, ttft: float, model: str, success: bool):
        self.ttft = ttft
        self.model = model
        self.success = success
        self.timestamp = time.time()

class ProductionLatencyRouter:
    """Intelligently routes requests between Local Ollama and Cloud Gemini based on latency/health"""
    
    def __init__(self):
        self.metrics: List[LatencyMetric] = []
        self.LATENCY_THRESHOLD = 1.5  # 1.5 seconds SLA
        self.OLLAMA_BASE_URL = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
        self._local_model = "llama3.2:3b"
        self._cloud_model = "gemini-1.5-flash"
        self._clients = {}

    def _get_ollama_client(self):
        if "ollama" not in self._clients:
            self._clients["ollama"] = ChatOllama(
                base_url=self.OLLAMA_BASE_URL,
                model=self._local_model,
                temperature=0.7
            )
        return self._clients["ollama"]

    def _get_gemini_client(self):
        if "gemini" not in self._clients:
            self._clients["gemini"] = ChatGoogleGenerativeAI(
                model=self._cloud_model,
                google_api_key=settings.GOOGLE_AI_API_KEY,
                temperature=0.7
            )
        return self._clients["gemini"]

    def _get_avg_latency(self) -> float:
        recent = [m.ttft for m in self.metrics if m.timestamp > (time.time() - 300)] # last 5m
        if not recent:
            return 0.0
        return sum(recent) / len(recent)

    async def route_invoke(self, prompt: str) -> str:
        avg_lat = self._get_avg_latency()
        
        # Decide Strategy: Prefer Local unless it's slow or we have many failures
        use_cloud = avg_lat > self.LATENCY_THRESHOLD
        
        if not use_cloud:
            try:
                LLM_REQUESTS.labels(model=self._local_model, provider="ollama").inc()
                start = time.time()
                client = self._get_ollama_client()
                # Use a timeout for local model to prevent hanging
                response = await asyncio.wait_for(client.ainvoke(prompt), timeout=15.0)
                ttft = time.time() - start
                
                LLM_LATENCY.labels(model=self._local_model, provider="ollama").observe(ttft)
                self.metrics.append(LatencyMetric(ttft, self._local_model, True))
                logger.info(f"Routed to Local Ollama ({ttft:.2f}s)")
                return response.content
            except Exception as e:
                LLM_FAILURES.labels(model=self._local_model, provider="ollama").inc()
                logger.warning(f"Local Ollama failed: {str(e)}. Falling back to Cloud.")
                self.metrics.append(LatencyMetric(15.0, self._local_model, False))
                # Fall through to cloud
        
        # Cloud Fallback
        LLM_REQUESTS.labels(model=self._cloud_model, provider="google").inc()
        start = time.time()
        client = self._get_gemini_client()
        response = await client.ainvoke(prompt)
        ttft = time.time() - start
        
        LLM_LATENCY.labels(model=self._cloud_model, provider="google").observe(ttft)
        logger.info(f"Routed to Cloud Gemini ({ttft:.2f}s) [High Latency={use_cloud}]")
        return response.content

# Global Router Instance
router = ProductionLatencyRouter()

class LLMClient:
    """Wrapper that utilizes the ProductionLatencyRouter for all LLM calls"""
    
    async def ainvoke(self, prompt: str) -> str:
        """Async invoke LLM via Router"""
        try:
            return await router.route_invoke(prompt)
        except Exception as e:
            logger.error(f"Critical error during LLM invocation: {str(e)}")
            raise
    
    def invoke(self, prompt: str) -> str:
        """Sync invoke LLM (Note: Production router prefers async, but we provide sync wrapper)"""
        # For sync, we use a simple loop runner or just fallback immediately to gemini for simplicity if needed
        # but to keep it safe we run the async route in a loop if possible, or just gemini sync.
        try:
            client = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=settings.GOOGLE_AI_API_KEY,
                temperature=0.7
            )
            response = client.invoke(prompt)
            return response.content
        except Exception as e:
            logger.error(f"Error during sync LLM invocation: {str(e)}")
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

llm_client = LLMClient()

