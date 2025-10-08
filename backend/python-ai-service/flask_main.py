"""Flask application for the Student AI Assistant - Integrated with Frontend."""
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
import os
from datetime import datetime

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv('.env')  # Try current directory first
    if not os.getenv("GEMINI_API_KEY"):
        backend_env = os.path.join(os.path.dirname(__file__), '.env')
        load_dotenv(backend_env)
except ImportError:
    pass  # dotenv not available, will rely on system env vars

# Import your existing Python agents
try:
    from orchestrator import create_study_assistant
    print("✅ Successfully imported orchestrator")
except ImportError as e:
    print(f"❌ Failed to import orchestrator: {e}")
    create_study_assistant = None

# Try to import individual agents (adjust these imports based on your actual agent structure)
try:
    from agents.learning_agent import get_learning_resources, SmartLearningResourceAgent
    print("✅ Successfully imported learning agent with smart discovery")
except ImportError as e:
    print(f"⚠️ Learning agent not found: {e}")
    get_learning_resources = None
    SmartLearningResourceAgent = None

try:
    from agents.assessment_agent import generate_assessment
    print("✅ Successfully imported assessment agent")
except ImportError as e:
    print(f"⚠️ Assessment agent not found: {e}")
    generate_assessment = None

try:
    from agents.wellness_agent import generate_wellness_assessment
    print("✅ Successfully imported wellness agent")
except ImportError as e:
    print(f"⚠️ Wellness agent not found: {e}")
    generate_wellness_assessment = None

try:
    from agents.schedule_agent import optimize_schedule
    print("✅ Successfully imported schedule agent")
except ImportError as e:
    print(f"⚠️ Schedule agent not found: {e}")
    optimize_schedule = None

try:
    from agents.motivation_agent import generate_motivation
    print("✅ Successfully imported motivation agent")
except ImportError as e:
    print(f"⚠️ Motivation agent not found: {e}")
    generate_motivation = None

try:
    from agents.personalization_agent import get_personalization
    print("✅ Successfully imported personalization agent")
except ImportError as e:
    print(f"⚠️ Personalization agent not found: {e}")
    get_personalization = None

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for frontend (React on port 3001)
CORS(app, origins=[
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_fallback_response(message="Service temporarily unavailable"):
    """Create a fallback response when agents are not available."""
    return {
        "success": False,
        "data": {"message": message},
        "error": "Agent not available",
        "timestamp": datetime.now().isoformat(),
        "fallback": True
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify service is running."""
    agents_status = {
        "orchestrator": create_study_assistant is not None,
        "learning_agent": get_learning_resources is not None,
        "assessment_agent": generate_assessment is not None,
        "wellness_agent": generate_wellness_assessment is not None,
        "schedule_agent": optimize_schedule is not None,
        "motivation_agent": generate_motivation is not None,
        "personalization_agent": get_personalization is not None
    }
    
    available_agents = [name for name, available in agents_status.items() if available]
    
    return jsonify({
        "status": "healthy",
        "service": "Python AI Service",
        "timestamp": datetime.now().isoformat(),
        "port": 8000,
        "agents_status": agents_status,
        "available_agents": available_agents,
        "total_agents": len(available_agents)
    }), 200

@app.route('/study-plan', methods=['POST'])
def generate_study_plan():
    """Generate a study plan using the Python orchestrator."""
    try:
        data = request.get_json()
        logger.info(f"Received study plan request: {data}")
        
        if not create_study_assistant:
            return jsonify(create_fallback_response("Study plan agent not available")), 503
        
        # Create orchestrator instance with API key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            # Fall back to direct learning agent
            from agents.learning_agent import generate_study_plan as direct_generate_study_plan
            result = direct_generate_study_plan(data)
            return jsonify({
                "success": True,
                "data": result,
                "timestamp": datetime.now().isoformat()
            }), 200
        
        orchestrator = create_study_assistant(api_key)
        
        # For now, let's use the learning agent directly since the orchestrator is complex
        from agents.learning_agent import generate_study_plan as direct_generate_study_plan
        result = direct_generate_study_plan(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in study-plan: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/learning-resources', methods=['POST'])
def get_learning_resources_endpoint():
    """Get learning resources using Python learning agent with smart discovery."""
    try:
        data = request.get_json()
        logger.info(f"Received learning resources request: {data}")
        
        # Use smart learning agent if available
        api_key = os.getenv('GEMINI_API_KEY')
        if SmartLearningResourceAgent and api_key:
            try:
                smart_agent = SmartLearningResourceAgent(api_key)
                topic = data.get('topic', 'general programming')
                difficulty = data.get('level', 'intermediate')
                
                # Use async method in sync context
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    result = loop.run_until_complete(smart_agent.smart_resource_discovery(topic, difficulty))
                finally:
                    loop.close()
                
                return jsonify({
                    "success": True,
                    "data": result,
                    "enhanced": True,
                    "ai_curated": True,
                    "timestamp": datetime.now().isoformat()
                }), 200
                
            except Exception as smart_error:
                logger.warning(f"Smart agent failed, falling back to basic agent: {smart_error}")
                # Fall back to basic agent
        
        # Fallback to basic learning agent
        if not get_learning_resources:
            return jsonify(create_fallback_response("Learning resources agent not available")), 503
        
        # Call your Python learning agent
        result = get_learning_resources(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "enhanced": False,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in learning-resources: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/assessment', methods=['POST'])
def get_assessment_endpoint():
    """Generate assessment using Python assessment agent."""
    try:
        data = request.get_json()
        logger.info(f"Received assessment request: {data}")
        
        if not generate_assessment:
            return jsonify(create_fallback_response("Assessment agent not available")), 503
        
        # Call your Python assessment agent
        result = generate_assessment(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in assessment: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/wellness-assessment', methods=['POST'])
def wellness_assessment_endpoint():
    """Get wellness assessment using Python wellness agent."""
    try:
        data = request.get_json()
        logger.info(f"Received wellness assessment request: {data}")
        
        if not generate_wellness_assessment:
            return jsonify(create_fallback_response("Wellness agent not available")), 503
        
        # Call your Python wellness agent
        result = generate_wellness_assessment(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in wellness-assessment: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/schedule-optimization', methods=['POST'])
def schedule_optimization_endpoint():
    """Optimize schedule using Python schedule agent."""
    try:
        data = request.get_json()
        logger.info(f"Received schedule optimization request: {data}")
        
        if not optimize_schedule:
            return jsonify(create_fallback_response("Schedule optimization agent not available")), 503
        
        # Call your Python schedule agent
        result = optimize_schedule(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in schedule-optimization: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/motivation-boost', methods=['POST'])
def motivation_boost_endpoint():
    """Get motivation boost using Python motivation agent."""
    try:
        data = request.get_json()
        logger.info(f"Received motivation boost request: {data}")
        
        if not generate_motivation:
            return jsonify(create_fallback_response("Motivation agent not available")), 503
        
        # Call your Python motivation agent
        result = generate_motivation(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in motivation-boost: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/personalization', methods=['POST'])
def personalization_endpoint():
    """Get personalization using Python personalization agent."""
    try:
        data = request.get_json()
        logger.info(f"Received personalization request: {data}")
        
        if not get_personalization:
            return jsonify(create_fallback_response("Personalization agent not available")), 503
        
        # Call your Python personalization agent
        result = get_personalization(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in personalization: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Generic catch-all route for testing
@app.route('/test', methods=['GET', 'POST'])
def test_endpoint():
    """Test endpoint to verify the service is responding."""
    return jsonify({
        "success": True,
        "message": "Python AI Service is working!",
        "method": request.method,
        "timestamp": datetime.now().isoformat(),
        "data": request.get_json() if request.method == 'POST' else None
    }), 200

if __name__ == '__main__':
    print("🚀 Starting Python AI Service (Flask Backend)...")
    print("🔧 Initializing AI agents...")
    
    # Check if API keys are available
    gemini_key = os.getenv('GEMINI_API_KEY')
    openai_key = os.getenv('OPENAI_API_KEY')
    
    print(f"🔑 GEMINI_API_KEY: {'✅ Found' if gemini_key else '❌ Missing'}")
    print(f"🔑 OPENAI_API_KEY: {'✅ Found' if openai_key else '❌ Missing'}")
    
    # List available agents
    agents = [
        ("Orchestrator", create_study_assistant),
        ("Learning Agent", get_learning_resources),
        ("Assessment Agent", generate_assessment),
        ("Wellness Agent", generate_wellness_assessment),
        ("Schedule Agent", optimize_schedule),
        ("Motivation Agent", generate_motivation),
        ("Personalization Agent", get_personalization)
    ]
    
    print("\n🤖 Agent Status:")
    for name, agent in agents:
        status = "✅ Available" if agent else "❌ Not Available"
        print(f"   {name}: {status}")
    
    print("\n🌐 CORS enabled for frontend:")
    print("   - http://localhost:3001 (Primary)")
    print("   - http://127.0.0.1:3001")
    print("   - http://localhost:3000 (Fallback)")
    print("   - http://127.0.0.1:3000")
    
    print("\n📡 Starting Flask server on port 8000...")
    print("🔗 Frontend should connect to: http://localhost:8000")
    print("\n📋 Available endpoints:")
    print("   GET  /health - Health check")
    print("   POST /study-plan - Generate study plan")
    print("   POST /learning-resources - Get learning resources")
    print("   POST /assessment - Generate assessment")
    print("   POST /wellness-assessment - Wellness assessment")
    print("   POST /schedule-optimization - Optimize schedule")
    print("   POST /motivation-boost - Motivation boost")
    print("   POST /personalization - Personalization")
    print("   GET|POST /test - Test endpoint")
    
    app.run(host='0.0.0.0', port=8000, debug=True)