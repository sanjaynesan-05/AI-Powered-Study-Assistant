"""
API Endpoint Tests
Tests all FastAPI endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["version"] == "2.0.0"
    assert data["agents"] == 11
    print("✅ Root endpoint test PASSED")

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["agents"] == "operational"
    print("✅ Health check test PASSED")

def test_agents_status():
    """Test agents status endpoint"""
    response = client.get("/api/agents/status")
    assert response.status_code == 200
    data = response.json()
    assert data["total_agents"] == 11
    assert len(data["agents"]) == 11
    assert data["langgraph_workflow"] == "active"
    print("✅ Agents status test PASSED")

def test_learning_process_endpoint():
    """Test main learning process endpoint"""
    request_data = {
        "user_id": "test_user",
        "user_input": "I want to learn Python",
        "mastered_skills": []
    }
    
    response = client.post("/api/learning/process", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] == True
    assert "session_id" in data
    assert "intent" in data
    assert "emotional_tone" in data
    assert "agent_outputs" in data
    assert "explanations" in data
    assert "reasoning_chain" in data
    
    print("✅ Learning process endpoint test PASSED")
    print(f"   Intent detected: {data['intent']}")
    print(f"   Emotional tone: {data['emotional_tone']}")
    print(f"   Agents executed: {len(data['agent_outputs'])}")

if __name__ == "__main__":
    print("Running API endpoint tests...\n")
    
    test_root_endpoint()
    test_health_check()
    test_agents_status()
    test_learning_process_endpoint()
    
    print("\n✅ All API tests PASSED!")
