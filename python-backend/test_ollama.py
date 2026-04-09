import httpx
import asyncio
import json

async def main():
    payload = {
        "prompt": "In one sentence, what is machine learning?",
        "model": "llama3.2:3b",
        "temperature": 0.5
    }

    print(">> Sending request to /test-ai ...")
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post("http://127.0.0.1:8001/test-ai", json=payload)
        d = r.json()
        print(f"Status   : {r.status_code}")
        print(f"Success  : {d.get('success')}")
        print(f"Model    : {d.get('model')}")
        print(f"Elapsed  : {d.get('elapsed_seconds')}s")
        print(f"Response : {d.get('response')}")

asyncio.run(main())
