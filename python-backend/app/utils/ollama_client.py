"""
Ollama Client - Production-grade HTTP client for communicating with local Ollama server.
"""
import json
import logging
import httpx
from typing import Optional, AsyncIterator

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3:8b"
DEFAULT_TIMEOUT = 60.0  # seconds


class OllamaClient:
    """HTTP client for Ollama local AI inference server"""

    def __init__(
        self,
        base_url: str = OLLAMA_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

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

        Args:
            prompt:      User prompt / instruction.
            model:       Ollama model tag (e.g. 'llama3.2:3b', 'mistral:7b').
            system:      Optional system prompt injected before the user message.
            temperature: Sampling temperature (0.0-1.0).
            stream:      Must be False for this method; use stream_generate() for streaming.

        Returns:
            The model's response as a plain string.

        Raises:
            ConnectionRefusedError: Ollama is not running / unreachable.
            TimeoutError:           Request exceeded the configured timeout.
            RuntimeError:           Unexpected HTTP / JSON errors.
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_ctx": 1024,      # Reduce context size for much faster CPU inference
                "num_predict": 300,   # Force concise, lethal answers (prevent endless rambling)
            },
        }
        if system:
            payload["system"] = system

        logger.info(f"[Ollama] Generating with model={model}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                text = data.get("response", "").strip()

                if not text:
                    raise RuntimeError("Ollama returned an empty response.")

                logger.info(f"[Ollama] OK — {len(text)} chars returned.")
                return text

        except httpx.ConnectError as exc:
            msg = (
                f"Cannot reach Ollama at {self.base_url}. "
                "Make sure Ollama is running (`ollama serve`)."
            )
            logger.error(f"[Ollama] Connection refused: {exc}")
            raise ConnectionRefusedError(msg) from exc

        except httpx.TimeoutException as exc:
            msg = (
                f"Ollama request timed out after {self.timeout}s. "
                "Try a lighter model or increase the timeout."
            )
            logger.error(f"[Ollama] Timeout: {exc}")
            raise TimeoutError(msg) from exc

        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            body = exc.response.text[:300]
            logger.error(f"[Ollama] HTTP {status}: {body}")

            if status == 404:
                raise RuntimeError(
                    f"Model '{model}' not found. "
                    "Run `ollama list` to see installed models."
                ) from exc
            raise RuntimeError(f"Ollama returned HTTP {status}: {body}") from exc

        except (json.JSONDecodeError, KeyError) as exc:
            logger.error(f"[Ollama] Unexpected response format: {exc}")
            raise RuntimeError("Failed to parse Ollama response JSON.") from exc

    async def get_embedding(
        self,
        text: str,
        model: str = "nomic-embed-text"
    ) -> list[float]:
        """
        Generate semantic embeddings for a given text using Ollama.
        """
        payload = {
            "model": model,
            "prompt": text
        }
        
        logger.info(f"[Ollama] Embedding with model={model}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                embedding = data.get("embedding", [])
                
                if not embedding:
                    raise RuntimeError("Ollama returned an empty embedding.")
                    
                return embedding
        except Exception as e:
            logger.error(f"[Ollama] Embedding failed: {str(e)}")
            raise RuntimeError(f"Failed to generate embedding: {str(e)}") from e

    async def list_models(self) -> list[str]:
        """Return a list of all locally installed Ollama model names."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return [m["name"] for m in data.get("models", [])]
        except httpx.ConnectError as exc:
            raise ConnectionRefusedError(
                f"Cannot reach Ollama at {self.base_url}."
            ) from exc

    async def health_check(self) -> bool:
        """Ping the Ollama server. Returns True if reachable, False otherwise."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False


# Shared singleton used across the application
ollama_client = OllamaClient()
