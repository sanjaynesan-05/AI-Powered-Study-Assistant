#!/usr/bin/env python3
"""Simple test for Flask endpoint."""

import requests
import time

# Wait for server to be ready
time.sleep(2)

try:
    response = requests.post(
        "http://localhost:8000/motivation-boost",
        json={
            "current_mood": "focused",
            "challenges": ["How do I start learning Python?"],
            "goals": ["programming"],
            "achievements": []
        },
        timeout=10
    )

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Success!")
        print(f"Message: {data.get('motivational_message', 'No message')[:100]}...")
    else:
        print(f"❌ Error: {response.text}")

except Exception as e:
    print(f"❌ Failed: {e}")