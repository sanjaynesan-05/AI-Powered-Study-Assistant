"""
Simple System Verification Script
Quick test to verify all components are working
"""
import sys
import os

def test_imports():
    """Test all critical imports"""
    print("\n" + "="*60)
    print("🧪 Testing Imports...")
    print("="*60)
    
    try:
        from app.main import app
        print("✅ FastAPI app imported successfully")
    except Exception as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        from app.langgraph.graph import learning_graph
        print("✅ LangGraph workflow imported successfully")
    except Exception as e:
        print(f"❌ LangGraph import failed: {e}")
        return False
    
    try:
        from app.agents import (
            orchestrator, personalization_agent, skill_graph_agent,
            reflection_agent, explainability_agent
        )
        print("✅ All agents imported successfully")
    except Exception as e:
        print(f"❌ Agents import failed: {e}")
        return False
    
    try:
        from app.memory.mongodb_store import memory_store
        print("✅ Memory store imported successfully")
    except Exception as e:
        print(f"❌ Memory store import failed: {e}")
        return False
    
    print("\n✅ All imports successful!")
    return True

def test_langgraph_compilation():
    """Test LangGraph compiles correctly"""
    print("\n" + "="*60)
    print("🧪 Testing LangGraph Compilation...")
    print("="*60)
    
    try:
        from app.langgraph.graph import learning_graph
        print("✅ LangGraph compiled successfully")
        print(f"   Graph has {len(learning_graph.nodes)} nodes")
        return True
    except Exception as e:
        print(f"❌ LangGraph compilation failed: {e}")
        return False

def test_config():
    """Test configuration"""
    print("\n" + "="*60)
    print("🧪 Testing Configuration...")
    print("="*60)
    
    try:
        from app.config import settings
        print(f"✅ Configuration loaded")
        print(f"   Environment: {settings.ENVIRONMENT}")
        print(f"   Port: {settings.PORT}")
        
        if settings.GOOGLE_AI_API_KEY:
            print(f"   Gemini API Key: {'*' * 20}...{settings.GOOGLE_AI_API_KEY[-4:]}")
        else:
            print("   ⚠️  Warning: GOOGLE_AI_API_KEY not set")
        
        return True
    except Exception as e:
        print(f"❌ Configuration failed: {e}")
        return False

def main():
    """Run all verification tests"""
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║   AI-Powered Study Assistant - Quick Verification         ║
    ║   Testing core components                                  ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    results = []
    
    # Run tests
    results.append(test_imports())
    results.append(test_langgraph_compilation())
    results.append(test_config())
    
    # Summary
    print("\n" + "="*60)
    print("📊 VERIFICATION SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    print(f"Tests Passed: {passed}/{total} ({percentage:.1f}%)")
    
    if passed == total:
        print("\n🎉 VERIFICATION SUCCESSFUL!")
        print("\n✅ All core components working")
        print("✅ Ready to start server")
        print("\nNext step: uvicorn app.main:app --reload --port 8000")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed")
        print("Please review errors above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
