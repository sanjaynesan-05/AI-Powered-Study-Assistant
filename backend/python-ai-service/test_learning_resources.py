#!/usr/bin/env python3
"""Test the learning resources API endpoint."""

import requests
import json

def test_learning_resources_api():
    """Test the learning-resources endpoint."""
    url = "http://localhost:8000/learning-resources"

    payload = {
        "topic": "Python programming",
        "level": "beginner"
    }

    try:
        print("🧪 Testing learning resources API endpoint...")
        print(f"📤 Sending: {payload}")

        response = requests.post(url, json=payload, timeout=30)

        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!")
            print(f"🤖 Enhanced: {result.get('enhanced', 'N/A')}")
            print(f"🤖 AI Curated: {result.get('ai_curated', 'N/A')}")
            if result.get('data') and result['data'].get('resources'):
                resources = result['data']['resources']
                print(f"📚 Resources found: {len(resources)}")
                for i, resource in enumerate(resources[:2]):  # Show first 2
                    print(f"  {i+1}. {resource.get('title', 'No title')}")
                    print(f"     Platform: {resource.get('platform', 'N/A')}")
                    print(f"     Type: {resource.get('type', 'N/A')}")
                    if resource.get('content'):
                        content_preview = resource['content'][:100] + "..." if len(resource['content']) > 100 else resource['content']
                        print(f"     Content: {content_preview}")
                    print()
            return True
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False

if __name__ == "__main__":
    test_learning_resources_api()