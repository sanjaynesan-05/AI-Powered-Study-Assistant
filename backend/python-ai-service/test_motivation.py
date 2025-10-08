#!/usr/bin/env python3
"""Test script for motivation endpoint with Gemini integration."""

import requests
import json
import time

def test_motivation_endpoint():
    """Test the motivation-boost endpoint."""
    url = "http://localhost:8000/motivation-boost"

    # Test data - simpler version
    test_data = {
        "current_mood": "focused",
        "challenges": ["Hello"],
        "goals": ["learning"],
        "achievements": []
    }

    try:
        print("🧪 Testing motivation-boost endpoint...")
        print(f"📤 Sending: {json.dumps(test_data, indent=2)}")

        # Increase timeout
        start_time = time.time()
        response = requests.post(url, json=test_data, timeout=60)
        end_time = time.time()

        print(f"📥 Status Code: {response.status_code}")
        print(f"⏱️  Response time: {end_time - start_time:.2f} seconds")

        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"🤖 AI Response: {result.get('motivational_message', 'No message')[:300]}...")
            print(f"📝 Response Type: {result.get('response_type', 'unknown')}")
            if 'error' in result:
                print(f"❌ Error in response: {result['error']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_motivation_endpoint()