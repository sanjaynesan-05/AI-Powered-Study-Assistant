"""List available Gemini models for this API key"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv('.env')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print("🔍 Listing Available Gemini Models...\n")

if not GEMINI_API_KEY:
    print("❌ No API key found")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

try:
    print("📋 Available models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  ✅ {model.name}")
            print(f"     Description: {model.description[:100]}...")
            print()
except Exception as e:
    print(f"❌ Error: {e}")
