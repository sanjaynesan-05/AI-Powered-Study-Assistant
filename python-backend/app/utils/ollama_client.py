import json
import logging
import httpx
import os
import asyncio
from typing import Optional, AsyncIterator, List
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3:8b"
DEFAULT_TIMEOUT = 60.0  # seconds
GEMINI_MODEL = "gemini-1.5-flash"

class OllamaClient:
    """HTTP client for Ollama local AI inference server with Gemini fallback"""

    def __init__(
        self,
        base_url: str = OLLAMA_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._ollama_online = None
        self._last_check = 0
        
        # Initialize Gemini if key exists
        self.use_gemini_fallback = bool(settings.GOOGLE_AI_API_KEY)
        if self.use_gemini_fallback:
            genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
            self.gemini_model = genai.GenerativeModel(GEMINI_MODEL)
            logger.info(f"[Ollama] Gemini fallback initialized with model={GEMINI_MODEL}")

    async def _check_ollama(self) -> bool:
        """Check if Ollama is online with a 30s cache to avoid frequent hanging attempts"""
        import time
        now = time.time()
        if self._ollama_online is not None and (now - self._last_check < 30):
            return self._ollama_online
            
        self._ollama_online = await self.health_check()
        self._last_check = now
        return self._ollama_online

    async def generate(
        self,
        prompt: str,
        model: str = DEFAULT_MODEL,
        system: Optional[str] = None,
        temperature: float = 0.7,
        stream: bool = False,
    ) -> str:
        """
        Send a generation request to Ollama and return the full response text.
        Falls back to Google Gemini if Ollama is unreachable.
        """
        
        # ── 1. TRY LOCAL OLLAMA FIRST ───────────────────────────────────
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_ctx": 4096,
                    "num_predict": 1000,
                },
            }
            if system:
                payload["system"] = system

            logger.info(f"[Ollama] Attempting local generation with model={model}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                text = data.get("response", "").strip()

                if text:
                    self._ollama_online = True
                    logger.info(f"[Ollama] Local OK — {len(text)} chars.")
                    return text
                    
        except (httpx.ConnectError, httpx.TimeoutException, ConnectionRefusedError) as exc:
            logger.warning(f"[Ollama] Local service unreachable: {type(exc).__name__}")
            self._ollama_online = False
        except Exception as e:
            logger.error(f"[Ollama] Local error: {str(e)}")

        # ── 2. FALLBACK TO GEMINI ───────────────────────────────────────
        if self.use_gemini_fallback:
            logger.info(f"[Ollama] Falling back to Gemini ({GEMINI_MODEL})...")
            try:
                full_prompt = f"{system}\n\n{prompt}" if system else prompt
                # Force async execution of the sync Gemini call to avoid blocking
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None, 
                    lambda: self.gemini_model.generate_content(
                        full_prompt,
                        generation_config=genai.types.GenerationConfig(
                            temperature=temperature,
                        )
                    )
                )
                
                if response and response.text:
                    logger.info(f"[Ollama] Gemini Fallback OK — {len(response.text)} chars.")
                    return response.text
                    
            except Exception as e:
                logger.error(f"[Ollama] Gemini fallback also failed: {str(e)}")

        raise ConnectionRefusedError("Both local Ollama and Gemini fallback failed.")

    async def get_embedding(
        self,
        text: str,
        model: str = "nomic-embed-text"
    ) -> List[float]:
        """
        Generate semantic embeddings. Falls back to Gemini embeddings if local fails.
        """
        # ── 1. TRY LOCAL OLLAMA FIRST ───────────────────────────────────
        try:
            payload = {"model": model, "prompt": text}
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(f"{self.base_url}/api/embeddings", json=payload)
                response.raise_for_status()
                embedding = response.json().get("embedding", [])
                if embedding:
                    return embedding
        except Exception:
            pass

        # ── 2. FALLBACK TO GEMINI EMBEDDINGS ────────────────────────────
        if self.use_gemini_fallback:
            try:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: genai.embed_content(
                        model="models/embedding-001",
                        content=text,
                        task_type="retrieval_document"
                    )
                )
                return result['embedding']
            except Exception as e:
                logger.error(f"[Ollama] Embedding fallback failed: {str(e)}")

        raise RuntimeError("Failed to generate embedding (All providers failed)")

    async def list_models(self) -> List[str]:
        """Return a list of all locally installed Ollama model names."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return [m["name"] for m in data.get("models", [])]
        except Exception:
            return ["gemini-1.5-flash (cloud-fallback)"] if self.use_gemini_fallback else []

    async def health_check(self) -> bool:
        """Ping the Ollama server. Returns True if reachable, False otherwise."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

# Shared singleton used across the application
ollama_client = OllamaClient()
