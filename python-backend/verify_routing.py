import asyncio
import time
import logging
from app.utils.llm import router, llm_client

logging.basicConfig(level=logging.INFO)

async def test_routing():
    print("🚀 Testing AI Routing System...")
    
    # 1. Test standard request (Should try Local first)
    print("\n[Test 1] Standard Request (Local Priority)")
    start = time.time()
    response = await llm_client.ainvoke("Say 'Hello from local AI'")
    print(f"Response: {response}")
    print(f"Time: {time.time() - start:.2f}s")
    
    # 2. Simulate High Latency (inject a heavy metric)
    print("\n[Test 2] High Latency Simulation (Triggering Cloud Fallback)")
    from app.utils.llm import LatencyMetric
    router.metrics.append(LatencyMetric(5.0, "llama3.2:3b", True)) # Fake a 5s latency
    
    start = time.time()
    response = await llm_client.ainvoke("Say 'Hello from cloud backup'")
    print(f"Response: {response}")
    print(f"Time: {time.time() - start:.2f}s")
    
    # 3. Check health metrics
    print("\n[Test 3] Avg Latency Check")
    avg = router._get_avg_latency()
    print(f"Average System Latency (5m window): {avg:.2f}s")

if __name__ == "__main__":
    asyncio.run(test_routing())
