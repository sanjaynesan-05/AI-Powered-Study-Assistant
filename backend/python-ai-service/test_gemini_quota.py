"""Test Gemini API Key and Quota Status"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv('.env')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print("=" * 60)
print("🔍 GEMINI API KEY DIAGNOSTIC TEST")
print("=" * 60)

if not GEMINI_API_KEY:
    print("❌ ERROR: GEMINI_API_KEY not found in .env file")
    print("\n📝 Please add your Gemini API key to .env file:")
    print("   GEMINI_API_KEY=your_api_key_here")
    exit(1)

print(f"\n✅ API Key found: {GEMINI_API_KEY[:20]}...{GEMINI_API_KEY[-10:]}")
print(f"   Key length: {len(GEMINI_API_KEY)} characters")

print("\n🔧 Attempting to configure Gemini...")
try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini configured successfully")
except Exception as e:
    print(f"❌ Failed to configure Gemini: {e}")
    exit(1)

print("\n🧪 Testing API with simple request...")
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Say 'Hello, the API works!'")
    print("✅ API TEST SUCCESSFUL!")
    print(f"   Response: {response.text}")
    print("\n✨ Your Gemini API is working perfectly!")
    print("   The backend should now work with AI responses.")
    
except Exception as e:
    error_str = str(e)
    print(f"❌ API TEST FAILED")
    print(f"   Error: {error_str[:200]}")
    
    if "429" in error_str or "Quota exceeded" in error_str or "RATE_LIMIT_EXCEEDED" in error_str:
        print("\n" + "=" * 60)
        print("⚠️  QUOTA EXCEEDED - ACTION REQUIRED")
        print("=" * 60)
        print("\n🔴 Your API key has exceeded its rate limit quota.")
        print("   Current quota: 0 requests per minute")
        print("\n📝 SOLUTIONS:")
        print("\n1. GET A NEW API KEY (Recommended):")
        print("   • Go to: https://aistudio.google.com/app/apikey")
        print("   • Click 'Create API Key'")
        print("   • Copy the new key")
        print("   • Update backend/python-ai-service/.env:")
        print("     GEMINI_API_KEY=your_new_key_here")
        print("\n2. WAIT FOR QUOTA RESET:")
        print("   • Free tier quotas may reset daily/monthly")
        print("   • Your key shows 0 quota which may be permanent")
        print("\n3. ENABLE BILLING (For higher quotas):")
        print("   • Visit Google Cloud Console")
        print("   • Enable billing for your project")
        print("   • Get higher rate limits")
        print("\n💡 TIP: The backend will use intelligent fallback messages")
        print("   until you fix the API key issue.")
    elif "403" in error_str or "API_KEY_INVALID" in error_str:
        print("\n🔴 API KEY INVALID")
        print("   Your API key may be incorrect or expired.")
        print("   Get a new one from: https://aistudio.google.com/app/apikey")
    else:
        print(f"\n🔴 UNKNOWN ERROR: {error_str}")

print("\n" + "=" * 60)
