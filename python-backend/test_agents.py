"""
Step 4 verification — tests the multi-agent pipeline via the /ai endpoint.
Run: venv\Scripts\python.exe test_agents.py
"""
import httpx
import asyncio
import json
import time

BASE_URL = "http://127.0.0.1:8001/ai"


async def call_ai(label: str, prompt: str):
    print(f"\n{'='*60}")
    print(f">> TEST: {label}")
    print(f"   Prompt: {prompt[:80]}...")
    
    async with httpx.AsyncClient(timeout=180) as client:
        try:
            start = time.perf_counter()
            r = await client.post(BASE_URL, json={"prompt": prompt})
            elapsed = time.perf_counter() - start
            
            if r.status_code != 200:
                print(f"   ERROR {r.status_code}: {r.text[:300]}")
                return
            
            d = r.json()
            print(f"   Intent        : {d.get('intent')}")
            print(f"   Agents Used   : {d.get('agents_used')}")
            print(f"   Context Found : {d.get('context_found')}")
            print(f"   Elapsed       : {d.get('elapsed_seconds')}s (total: {elapsed:.2f}s)")
            print(f"   Response      :\n{d.get('response', '')[:400]}...")
            
        except Exception as e:
            print(f"   EXCEPTION: {e}")


async def main():
    print("\n🚀 STEP 4 — Multi-Agent System Verification\n")

    tests = [
        ("Learning", "Explain how transformer neural networks work in simple terms."),
        ("Coding", "Write a Python async function that fetches JSON from a URL with error handling."),
        ("Mentor", "I want to become an AI engineer in 12 months. Where do I start?"),
        ("Motivation", "I keep failing my exams and I'm about to give up on my CS degree."),
        ("Chat", "Hello! How are you doing today?"),
    ]

    for label, prompt in tests:
        await call_ai(label, prompt)

    print(f"\n{'='*60}")
    print("✅ All test cases executed!")


if __name__ == "__main__":
    asyncio.run(main())
