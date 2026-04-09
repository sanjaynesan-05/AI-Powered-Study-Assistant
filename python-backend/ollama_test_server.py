"""
Standalone Ollama test server — no database dependencies.
Run: venv\Scripts\python.exe -m uvicorn ollama_test_server:app --host 127.0.0.1 --port 8001 --reload
"""
import time
import json
import logging
import asyncio
from datetime import datetime
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger("ollama-test")

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_TIMEOUT = 120.0

# ------------------------------------------------------------------ #
app = FastAPI(
    title="Ollama Test Server",
    description="Lightweight FastAPI server to test local Ollama models — no DB required.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ #
#  Pydantic models                                                     #
# ------------------------------------------------------------------ #

class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "llama3.2:3b"
    system: Optional[str] = None
    temperature: float = 0.7


class GenerateResponse(BaseModel):
    success: bool
    model: str
    prompt: str
    response: str
    elapsed_seconds: float
    timestamp: str


# ------------------------------------------------------------------ #
#  Helpers                                                             #
# ------------------------------------------------------------------ #

async def _ollama_generate(
    prompt: str,
    model: str,
    system: Optional[str] = None,
    temperature: float = 0.7,
) -> str:
    """Call Ollama /api/generate and return the response text."""
    payload: dict = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": temperature},
    }
    if system:
        payload["system"] = system

    logger.info(f"→ Sending request to Ollama  model={model}")

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        text = data.get("response", "").strip()
        if not text:
            raise RuntimeError("Ollama returned an empty response body.")
        return text


async def _ollama_list_models() -> list[str]:
    """Return tags of all locally installed Ollama models."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
        response.raise_for_status()
        data = response.json()
        return [m["name"] for m in data.get("models", [])]


# ------------------------------------------------------------------ #
#  Endpoints                                                           #
# ------------------------------------------------------------------ #

@app.get("/")
async def root():
    return {
        "service": "Ollama Test Server",
        "status": "running",
        "ollama_url": OLLAMA_BASE_URL,
        "docs": "http://127.0.0.1:8001/docs",
    }


@app.get("/health")
async def health():
    """Ping both this server and the Ollama service."""
    ollama_online = False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            ollama_online = r.status_code == 200
    except Exception:
        pass

    return {
        "server": "healthy",
        "ollama_online": ollama_online,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/ollama/models")
async def list_models():
    """List all locally installed Ollama models."""
    try:
        models = await _ollama_list_models()
        return {
            "success": True,
            "count": len(models),
            "models": models,
        }
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ollama_unavailable",
                "message": f"Cannot reach Ollama at {OLLAMA_BASE_URL}.",
                "fix": "Run 'ollama serve' in a separate terminal and try again.",
            },
        )


@app.post("/test-ai", response_model=GenerateResponse)
async def test_ai(req: GenerateRequest):
    """
    Send a prompt to any installed Ollama model and return the response.

    Switch models dynamically via the 'model' field.
    Installed models:
        llama3.2:3b, llama3:8b, mistral:7b,
        qwen2.5:3b-instruct, qwen2.5-coder:7b,
        nomic-embed-text, KMENTOR_v2.0
    """
    start = time.perf_counter()

    try:
        text = await _ollama_generate(
            prompt=req.prompt,
            model=req.model,
            system=req.system,
            temperature=req.temperature,
        )
    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ollama_unavailable",
                "message": f"Cannot reach Ollama at {OLLAMA_BASE_URL}.",
                "fix": "Run 'ollama serve' and ensure the model is pulled.",
            },
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail={
                "error": "ollama_timeout",
                "message": f"Model '{req.model}' timed out after {DEFAULT_TIMEOUT}s.",
                "fix": "Try a lighter model like llama3.2:3b or increase DEFAULT_TIMEOUT.",
            },
        )
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "model_not_found",
                    "message": f"Model '{req.model}' is not installed in Ollama.",
                    "fix": f"Run: ollama pull {req.model}",
                },
            )
        raise HTTPException(status_code=500, detail={"error": str(exc)})
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail={"error": str(exc)})

    elapsed = round(time.perf_counter() - start, 2)
    logger.info(f"✓ Response received in {elapsed}s  model={req.model}")

    return GenerateResponse(
        success=True,
        model=req.model,
        prompt=req.prompt,
        response=text,
        elapsed_seconds=elapsed,
        timestamp=datetime.utcnow().isoformat(),
    )
