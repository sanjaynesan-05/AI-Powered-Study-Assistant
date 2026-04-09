import httpx
import asyncio
import json

async def test_case(name, prompt):
    print(f"\n--- Testing: {name} ---")
    print(f"Prompt: {prompt}")
    
    url = "http://127.0.0.1:8000/ai"
    payload = {"prompt": prompt}
    
    async with httpx.AsyncClient(timeout=120) as client:
        try:
            response = await client.post(url, json=payload)
            data = response.json()
            
            print(f"Status     : {response.status_code}")
            print(f"Task       : {data.get('task')}")
            print(f"Model Used : {data.get('model_used')}")
            print(f"Response Snippet: {data.get('response')[:200]}...")
            
        except Exception as e:
            print(f"Error: {str(e)}")

async def main():
    test_prompts = [
        ("Motivation", "I'm feeling discouraged about my study progress and I don't know if I can do this."),
        ("Coding", "How do I create a fastAPI server with a postgres database? Show me code."),
        ("Learning", "Can you explain how neural networks work like I'm five years old?"),
        ("Mentor", "Can you give me a roadmap to become a senior machine learning engineer?")
    ]

    print("🚀 Starting Smart Router Verification...")
    for name, prompt in test_prompts:
        await test_case(name, prompt)

if __name__ == "__main__":
    asyncio.run(main())
