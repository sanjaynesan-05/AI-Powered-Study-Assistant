import httpx
import asyncio
import json
import time

async def test_ai_request(name, prompt):
    print(f"\n--- Testing: {name} ---")
    print(f"Prompt: {prompt}")
    
    url = "http://127.0.0.1:8001/ai"
    payload = {"prompt": prompt}
    
    async with httpx.AsyncClient(timeout=120) as client:
        try:
            start = time.time()
            response = await client.post(url, json=payload)
            data = response.json()
            
            print(f"Status     : {response.status_code}")
            print(f"Context    : {'FOUND' if data.get('context_found') else 'NONE'}")
            print(f"Model Used : {data.get('model_used')}")
            print(f"Response   : {data.get('response')}")
            print(f"Time       : {time.time() - start:.2f}s")
            
        except Exception as e:
            print(f"Error: {str(e)}")

async def main():
    print("🚀 Starting RAG Memory Verification...")
    
    # 1. Store a fact
    await test_ai_request("Fact Storage", "Tell me a fun fact about Blue and remember that Blue is my favorite color.")
    
    # Wait a bit for async memory storage to finish
    print("⏳ Waiting for async storage...")
    await asyncio.sleep(5)
    
    # 2. Retrieve the fact
    await test_ai_request("Memory Recall", "What is my favorite color and why do I like it?")
    
    # 3. Different topic (should not have context)
    await test_ai_request("Irrelevant Query", "How many continents are there in the world?")

if __name__ == "__main__":
    asyncio.run(main())
