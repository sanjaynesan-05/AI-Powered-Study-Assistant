"""Minimal Flask Backend for AI Mentor - Works Without Complex Dependencies"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv('.env')
except ImportError:
    pass

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ google-generativeai not installed. Install with: pip install google-generativeai")

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for frontend
CORS(app, origins=['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Configure Gemini if available
if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        print("✅ Gemini AI configured successfully")
    except Exception as e:
        print(f"❌ Failed to configure Gemini: {e}")
        model = None
else:
    model = None
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY not found in environment")
    if not GEMINI_AVAILABLE:
        print("❌ google-generativeai package not available")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Python AI Service (Minimal)",
        "timestamp": datetime.now().isoformat(),
        "gemini_configured": model is not None,
        "api_key_present": bool(GEMINI_API_KEY)
    }), 200

@app.route('/motivation-boost', methods=['POST'])
def motivation_boost():
    """Generate motivational message using Gemini."""
    try:
        data = request.get_json()
        logger.info(f"Motivation request: {data}")
        
        if not model:
            return jsonify({
                "success": False,
                "data": {
                    "motivational_message": "🌟 Keep going! Every step forward is progress. You're doing great!",
                    "primary_message": "Stay focused and believe in yourself!"
                },
                "error": "Gemini not configured",
                "timestamp": datetime.now().isoformat()
            }), 200
        
        # Extract data
        challenges = data.get('challenges', ['studying'])
        goals = data.get('goals', ['learning'])
        mood = data.get('current_mood', 'focused')
        
        # Create prompt
        prompt = f"""You are an encouraging AI study mentor. A student is feeling {mood} and working on {', '.join(goals)}.
They are facing challenges with: {', '.join(challenges)}.

Provide a warm, encouraging, and actionable motivational message in 2-3 sentences. Be supportive and specific to their situation.
Focus on practical encouragement."""
        
        # Generate response
        response = model.generate_content(prompt)
        message = response.text
        
        return jsonify({
            "success": True,
            "data": {
                "motivational_message": message,
                "primary_message": message,
                "message": message
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in motivation-boost: {str(e)}")
        return jsonify({
            "success": False,
            "data": {
                "motivational_message": "🚀 You're on the right path! Keep learning and growing every day.",
                "primary_message": "Stay curious and keep pushing forward!"
            },
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 200

@app.route('/learning-resources', methods=['POST'])
def learning_resources():
    """Get learning resources."""
    try:
        data = request.get_json()
        topic = data.get('topic', 'programming')
        
        if not model:
            return jsonify({
                "success": False,
                "error": "Gemini not configured",
                "timestamp": datetime.now().isoformat()
            }), 200
        
        prompt = f"""You are an educational resource curator. Suggest 5 high-quality learning resources for: {topic}

For each resource, provide:
- Type (video, article, course, documentation, book)
- Title
- Brief description (1 sentence)
- Difficulty level (beginner, intermediate, advanced)

Format as JSON array."""
        
        response = model.generate_content(prompt)
        
        return jsonify({
            "success": True,
            "data": {
                "resources": response.text,
                "topic": topic
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in learning-resources: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/study-plan', methods=['POST'])
def study_plan():
    """Generate study plan."""
    try:
        data = request.get_json()
        
        if not model:
            return jsonify({
                "success": False,
                "error": "Gemini not configured",
                "timestamp": datetime.now().isoformat()
            }), 200
        
        topic = data.get('topic', 'general learning')
        duration = data.get('duration', '1 week')
        
        prompt = f"""Create a structured study plan for learning {topic} over {duration}.
Include:
- Daily goals
- Key topics to cover
- Suggested time allocation
- Milestones

Keep it practical and achievable."""
        
        response = model.generate_content(prompt)
        
        return jsonify({
            "success": True,
            "data": {
                "plan": response.text,
                "topic": topic
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in study-plan: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Minimal Python AI Service...")
    print(f"🔑 GEMINI_API_KEY: {'✅ Found' if GEMINI_API_KEY else '❌ Missing'}")
    print(f"🤖 Gemini Model: {'✅ Ready' if model else '❌ Not Available'}")
    print("\n📡 Starting Flask server on http://localhost:8000")
    print("\n📋 Available endpoints:")
    print("   GET  /health - Health check")
    print("   POST /motivation-boost - Get motivation")
    print("   POST /learning-resources - Get resources")
    print("   POST /study-plan - Generate study plan")
    print("\n" + "="*50)
    
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False)
