"""Step 5 verification — checks /health and /metrics endpoints after one /ai call."""
import httpx
import asyncio
import json

BASE = "http://127.0.0.1:8001"


async def main():
    async with httpx.AsyncClient(timeout=120) as c:
        # 1. Fire one real request to populate metrics
        print(">> Sending /ai request ...")
        r = await c.post(f"{BASE}/ai", json={"prompt": "Write a quick Python hello world program"})
        d = r.json()
        print(f"   status={r.status_code} intent={d.get('intent')} agents={d.get('agents_used')}")
        print(f"   X-Request-ID: {r.headers.get('X-Request-ID', 'MISSING')}")

        # 2. Health check
        r = await c.get(f"{BASE}/health")
        print("\n>> /health response:")
        print(json.dumps(r.json(), indent=2))

        # 3. Metrics
        r = await c.get(f"{BASE}/metrics")
        print("\n>> /metrics response:")
        print(json.dumps(r.json(), indent=2))


if __name__ == "__main__":
    asyncio.run(main())
