#!/usr/bin/env python3
"""Test the motivation API endpoint."""

import requests
import json

def test_motivation_api():
    """Test the motivation-boost endpoint."""
    url = "http://localhost:8000/motivation-boost"

    payload = {
        "current_mood": "curious",
        "challenges": ["I'm struggling with understanding recursion in programming"],
        "goals": ["programming"],
        "achievements": []
    }

    try:
        print("🧪 Testing motivation API endpoint...")
        print(f"📤 Sending: {payload}")

        response = requests.post(url, json=payload, timeout=30)

        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!")
            print(f"🤖 Response type: {result.get('response_type', 'unknown')}")
            print(f"📝 Message preview: {result.get('motivational_message', 'No message')[:200]}...")
            return True
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False

if __name__ == "__main__":
    test_motivation_api()