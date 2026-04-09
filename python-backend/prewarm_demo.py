"""
Pre-warm Models — Run this BEFORE your live demo.
It ensures all required LLMs are loaded into VRAM for zero-latency first responses.
"""
import asyncio
import httpx
import time

MODELS = [
    "qwen2.5:3b-instruct",  # Intent/Reasoning
    "llama3.2:3b",         # General/Demo Learning
    "qwen2.5-coder:7b",    # Coding
    "mistral:7b",          # Evaluation (Prod)
    "nomic-embed-text",     # Memory
    "KMENTOR_v2.0"          # Mentor
]

OLLAMA_URL = "http://localhost:11434/api/generate"

async def warm_model(model: str):
    print(f"🔥 Pre-warming {model}...")
    payload = {
        "model": model,
        "prompt": "hi",
        "stream": False
    }
    
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            if response.status_code == 200:
                elapsed = time.perf_counter() - start
                print(f"✅ {model} is READY! (loaded in {elapsed:.2f}s)")
            else:
                print(f"❌ Failed to load {model}: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Error loading {model}: {e}")

async def main():
    print("\n🚀 STARTING PRE-WARM SEQUENCE FOR LIVE DEMO\n")
    print("="*50)
    
    # Run in sequence to avoid VRAM overflow during loading
    for model in MODELS:
        await warm_model(model)
        
    print("="*50)
    print("\n🎉 ALL MODELS ARE LOADED! You are ready for the presentation.\n")

if __name__ == "__main__":
    asyncio.run(main())
