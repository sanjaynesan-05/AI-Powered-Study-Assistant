#!/usr/bin/env python3
"""Test script for the Smart Learning Resource Agent."""

import os
import asyncio
import json
from agents.learning_agent import SmartLearningResourceAgent

async def test_smart_learning_agent():
    """Test the smart learning agent with various topics."""
    
    # Check if API key is available
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not found. Please set it in your environment.")
        return
    
    print("🤖 Testing Smart Learning Resource Agent")
    print("=" * 50)
    
    # Initialize the agent
    agent = SmartLearningResourceAgent(api_key)
    
    # Test cases
    test_cases = [
        {"topic": "Python programming", "difficulty": "beginner"},
        {"topic": "Machine Learning", "difficulty": "intermediate"},
        {"topic": "JavaScript", "difficulty": "beginner"},
        {"topic": "Data Structures", "difficulty": "intermediate"}
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        topic = test_case["topic"]
        difficulty = test_case["difficulty"]
        
        print(f"\n🔍 Test {i}: {topic} ({difficulty})")
        print("-" * 40)
        
        try:
            # Get smart resource recommendations
            result = await agent.smart_resource_discovery(topic, difficulty)
            
            print(f"✅ Found {len(result['resources'])} resources")
            print(f"📊 Quality Score: {result['quality_score']:.1f}/10")
            print(f"⏱️ Estimated Time: {result['estimated_time']}")
            print(f"📚 Resources:")
            
            for j, resource in enumerate(result['resources'], 1):
                print(f"  {j}. {resource['title']}")
                print(f"     Platform: {resource['platform']}")
                print(f"     Type: {resource['type']}")
                print(f"     URL: {resource['url']}")
                print(f"     Quality: {resource.get('quality_rating', 'N/A')}/10")
                print(f"     Verified: {'✅' if resource.get('verified', False) else '❌'}")
                print()
                
        except Exception as e:
            print(f"❌ Error testing {topic}: {str(e)}")
    
    print("🎉 Smart Learning Agent test completed!")

def test_sync_compatibility():
    """Test the synchronous compatibility wrapper."""
    print("\n🔄 Testing Synchronous Compatibility")
    print("=" * 40)
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not found.")
        return
    
    from agents.learning_agent import LearningResourceAgent
    
    # Test the backward compatibility
    agent = LearningResourceAgent(api_key)
    
    try:
        result = agent.search_resources("Python programming")
        print(f"✅ Synchronous test successful!")
        print(f"📚 Found {len(result.get('resources', []))} resources")
        print(f"📊 Quality Score: {result.get('quality_score', 'N/A')}")
        
        # Show first resource as example
        if result.get('resources'):
            first_resource = result['resources'][0]
            print(f"📖 Sample Resource: {first_resource['title']}")
            print(f"🔗 URL: {first_resource['url']}")
            print(f"🏷️ Platform: {first_resource['platform']}")
    
    except Exception as e:
        print(f"❌ Synchronous test error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Smart Learning Agent Tests")
    
    # Test async functionality
    asyncio.run(test_smart_learning_agent())
    
    # Test sync compatibility
    test_sync_compatibility()
    
    print("\n✨ All tests completed!")