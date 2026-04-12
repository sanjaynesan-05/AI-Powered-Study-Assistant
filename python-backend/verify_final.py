import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.path.abspath(os.path.curdir))

from app.langgraph.graph import learning_graph
from app.memory.postgres_store import memory_store
from app.db import engine, Base
from datetime import datetime

async def test_workflow():
    print("Starting Final System Verification...")
    
    # 0. Initialize Database
    print("Initializing PostgreSQL Tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        return
        
    # 1. Test state initialization
    initial_state = {
        "user_id": "test_user_postgres",
        "session_id": f"test_session_{int(datetime.utcnow().timestamp())}",
        "user_input": "I want to learn about React hooks and state management.",
        "mastered_skills": [],
        "intent": "",
        "emotional_tone": "",
        "agent_outputs": {},
        "execution_path": [],
        "reasoning_chain": [],
        "confidence_scores": {},
        "timestamp": datetime.utcnow()
    }
    
    print(f"Testing LangGraph workflow for user: {initial_state['user_id']}")
    
    try:
        # 2. Execute workflow (this will call Ollama 8b)
        print("Calling Ollama llama3:8b (this may take 30-60s)...")
        final_state = await learning_graph.ainvoke(initial_state)
        
        print("Workflow execution complete!")
        print(f"Intent Detected: {final_state.get('intent')}")
        print(f"Agent Outputs Trace: {list(final_state.get('agent_outputs', {}).keys())}")
        
        # 3. Verify PostgreSQL Storage
        print("Verifying PostgreSQL storage...")
        
        profile = await memory_store.retrieve_user_profile(initial_state["user_id"])
        
        if profile and profile.get("total_interactions", 0) > 0:
            print("PostgreSQL Persistence Verified!")
            print(f"User Profile: {profile}")
        else:
            print("PostgreSQL Persistence Failed or profile empty.")
            
    except Exception as e:
        print(f"Verification Failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_workflow())
