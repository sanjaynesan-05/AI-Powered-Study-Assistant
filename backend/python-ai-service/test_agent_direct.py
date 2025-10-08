#!/usr/bin/env python3
"""Direct test of motivation agent."""

import os
import sys
sys.path.append('.')

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv('.env')
    print(f"✅ Loaded .env file, GEMINI_API_KEY: {os.getenv('GEMINI_API_KEY', 'NOT_SET')[:20]}...")
except ImportError:
    print("⚠️ dotenv not available")

from agents.motivation_agent import generate_motivation

def test_motivation_agent():
    """Test the motivation agent directly."""
    print("🧪 Testing motivation agent directly...")

    # Test data
    test_data = {
        "current_mood": "focused",
        "challenges": ["Hello, how can you help me with learning?"],
        "goals": ["programming"],
        "achievements": []
    }

    try:
        print(f"📤 Input: {test_data}")
        result = generate_motivation(test_data)
        print("✅ Success!")
        print(f"🤖 Response: {result}")
        print(f"📝 Message: {result.get('motivational_message', 'No message')[:200]}...")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_motivation_agent()