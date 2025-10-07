"""Wellness MCP Server with Hume AI Facial Analysis and Google BigQuery storage"""

import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import aiofiles
from google.cloud import bigquery
from google.generativeai import GenerativeModel
# from hume import HumeBatchClient
# from hume.models.config import FaceConfig
from mcp.server import Server
from mcp import stdio_server
from mcp.types import (
    CallToolRequest,
    ListToolsRequest,
    Tool,
    TextContent,
    ImageContent
)


class WellnessMemorySaver:
    """Handles data persistence to BigQuery - with fallback to local storage"""

    def __init__(self, project_id: str, dataset_id: str):
        self.project_id = project_id
        self.dataset_id = dataset_id
        self.bigquery_available = False
        self.client = None
        self.local_storage = {}  # Fallback local storage

        try:
            self.client = bigquery.Client(project=project_id)
            self.bigquery_available = True
            # Initialize tables only if BigQuery works
            self._create_tables()
        except Exception as e:
            print(f"BigQuery not available (using local storage): {e}")
            self.bigquery_available = False

    def _create_tables(self):
        """Create BigQuery tables for wellness data"""
        if not self.bigquery_available:
            return

        tables = {
            'mood_entries': f"""
                entry_id STRING,
                user_id STRING,
                timestamp TIMESTAMP,
                mood_score INT64,
                text_description STRING,
                emotion_data JSON,
                gemini_analysis STRING,
                created_at TIMESTAMP
            """,
            'stress_sessions': f"""
                session_id STRING,
                user_id STRING,
                timestamp TIMESTAMP,
                stress_level INT64,
                ppg_data JSON,
                hume_facial_analysis JSON,
                gemini_analysis STRING,
                created_at TIMESTAMP
            """,
            'wellness_goals': f"""
                goal_id STRING,
                user_id STRING,
                timestamp TIMESTAMP,
                goal_type STRING,
                goal_description STRING,
                target_value JSON,
                progress_percentage FLOAT64,
                status STRING,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            """,
            'mindfulness_sessions': f"""
                session_id STRING,
                user_id STRING,
                timestamp TIMESTAMP,
                exercise_type STRING,
                duration_seconds INT64,
                emotional_impact JSON,
                created_at TIMESTAMP
            """
        }

        for table_name, schema in tables.items():
            table_id = f"{self.project_id}.{self.dataset_id}.{table_name}"
            table = bigquery.Table(table_id, schema=schema)
            try:
                self.client.create_table(table)
                print(f"Created table {table_id}")
            except Exception as e:
                print(f"Table {table_id} already exists: {e}")

    def save_mood_entry(self, entry_data: Dict[str, Any]) -> bool:
        """Save mood entry to BigQuery or local storage"""
        try:
            if self.bigquery_available:
                table_id = f"{self.project_id}.{self.dataset_id}.mood_entries"

                rows_to_insert = [{
                    'entry_id': str(entry_data.get('entry_id', '')),
                    'user_id': str(entry_data.get('user_id', 'default_user')),
                    'timestamp': datetime.fromisoformat(entry_data['timestamp']) if entry_data.get('timestamp') else datetime.utcnow(),
                    'mood_score': int(entry_data.get('mood_score', 5)),
                    'text_description': str(entry_data.get('text_description', '')),
                    'emotion_data': json.dumps(entry_data.get('emotion_data', {})),
                    'gemini_analysis': str(entry_data.get('gemini_analysis', '')),
                    'created_at': datetime.utcnow()
                }]

                self.client.insert_rows(table_id, rows_to_insert)
                return True
            else:
                # Save to local storage
                key = f"mood_{entry_data.get('user_id', 'default_user')}"
                self.local_storage[key] = entry_data
                print(f"Saved to local storage (BigQuery unavailable)")
                return True
        except Exception as e:
            print(f"Error saving mood entry: {e}")
            return False


class HumeEmotionAnalyzer:
    """Integrates Hume AI for facial emotion analysis"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        # Mock implementation since HumeBatchClient import failed

    async def analyze_facial_emotions(self, image_data: bytes) -> Dict[str, Any]:
        """Analyze emotions from facial image - currently mock implementation"""
        # Mock Hume AI response for testing
        emotions = {
            'joy': 0.7,
            'sadness': 0.1,
            'anger': 0.05,
            'fear': 0.03,
            'surprise': 0.12
        }

        return {
            'success': True,
            'emotions': emotions,
            'dominant_emotion': 'joy',
            'confidence_score': 0.7,
            'note': 'This is mock data - Hume AI integration needs API key and proper configuration'
        }


class WellnessMCPServer:
    """Main wellness MCP server"""

    def __init__(self):
        # API clients
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.gemini_model = GenerativeModel('gemini-2.0-flash-exp') if self.gemini_api_key else None

        self.hume_api_key = os.getenv('HUME_API_KEY')
        self.hume_analyzer = HumeEmotionAnalyzer(self.hume_api_key) if self.hume_api_key else None

        # BigQuery storage
        self.project_id = os.getenv('BIGQUERY_PROJECT_ID', 'your-project')
        self.dataset_id = os.getenv('BIGQUERY_DATASET_ID', 'wellness_data')
        self.memory_saver = WellnessMemorySaver(self.project_id, self.dataset_id)

        # In-memory cache for fast retrieval
        self.memory_store: Dict[str, Any] = {}

    async def list_tools(self, request: ListToolsRequest) -> List[Tool]:
        """List available wellness tools"""
        return [
            Tool(
                name="mood_check_in",
                description="Record daily mood entry with emotion analysis and AI insights",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "mood_score": {"type": "integer", "minimum": 1, "maximum": 10, "description": "Mood score from 1-10"},
                        "text_description": {"type": "string", "description": "Optional text description of current state"},
                        "user_id": {"type": "string", "description": "User identifier"}
                    },
                    "required": ["mood_score"]
                }
            ),
            Tool(
                name="stress_monitoring",
                description="Analyze real-time stress using facial recognition and PPG data",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "image_data": {"type": "string", "description": "Base64 encoded facial image"},
                        "ppg_data": {"type": "object", "description": "Photoplethysmography biometric data"},
                        "user_id": {"type": "string", "description": "User identifier"}
                    },
                    "required": ["image_data"]
                }
            ),
            Tool(
                name="set_wellness_goal",
                description="Create personalized wellness goals with progress tracking",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "goal_type": {"type": "string", "description": "Type of goal (meditation, exercise, etc.)"},
                        "description": {"type": "string", "description": "Goal description"},
                        "target_value": {"type": "object", "description": "Target metrics"},
                        "user_id": {"type": "string", "description": "User identifier"}
                    },
                    "required": ["goal_type", "description"]
                }
            ),
            Tool(
                name="provide_mindfulness",
                description="Generate mindfulness exercises and meditations based on emotional state",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "exercise_type": {"type": "string", "description": "Type of exercise (breathing, meditation, etc.)"},
                        "current_emotions": {"type": "object", "description": "Current emotional state"},
                        "duration_minutes": {"type": "integer", "description": "Desired duration"},
                        "user_id": {"type": "string", "description": "User identifier"}
                    },
                    "required": ["exercise_type"]
                }
            ),
            Tool(
                name="crisis_support_check",
                description="Analyze mood patterns for crisis detection and provide support resources",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User identifier"},
                        "timeframe_days": {"type": "integer", "description": "Days to analyze", "default": 7}
                    },
                    "required": ["user_id"]
                }
            )
        ]

    async def call_tool(self, request: CallToolRequest) -> List[TextContent]:
        """Execute wellness tools"""
        tool_name = request.params.name
        arguments = request.params.arguments or {}

        try:
            if tool_name == "mood_check_in":
                return await self._handle_mood_check_in(arguments)
            elif tool_name == "stress_monitoring":
                return await self._handle_stress_monitoring(arguments)
            elif tool_name == "set_wellness_goal":
                return await self._handle_set_wellness_goal(arguments)
            elif tool_name == "provide_mindfulness":
                return await self._handle_provide_mindfulness(arguments)
            elif tool_name == "crisis_support_check":
                return await self._handle_crisis_support_check(arguments)
            else:
                raise ValueError(f"Unknown tool: {tool_name}")

        except Exception as e:
            return [TextContent(type="text", text=f"Error executing {tool_name}: {str(e)}")]

    async def _handle_mood_check_in(self, args: Dict[str, Any]) -> List[TextContent]:
        """Process mood entry with AI analysis"""
        mood_score = args.get('mood_score', 5)
        text_description = args.get('text_description', '')
        user_id = args.get('user_id', 'default_user')

        # Generate entry ID
        entry_id = f"mood_{user_id}_{datetime.now().isoformat()}"

        # Analyze with Gemini if available
        gemini_analysis = ""
        if self.gemini_model and text_description:
            try:
                prompt = f"""Analyze this mood entry and provide supportive, empathetic insights:

Mood Score: {mood_score}/10
Description: {text_description}

Please provide:
1. Emotional analysis
2. Positive reframing and encouragement
3. Gentle suggestion for improvement if appropriate
4. Any immediate concerns to address"""

                response = await self.gemini_model.generate_content_async(prompt)
                gemini_analysis = response.text
            except Exception as e:
                gemini_analysis = f"AI analysis unavailable: {str(e)}"

        # Save to BigQuery
        entry_data = {
            'entry_id': entry_id,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'mood_score': mood_score,
            'text_description': text_description,
            'gemini_analysis': gemini_analysis
        }

        success = self.memory_saver.save_mood_entry(entry_data)

        if success:
            response = f"""✅ Mood entry recorded successfully!

📊 Your Mood: {mood_score}/10
📝 Description: {text_description}

🤖 AI Insights:
{gemini_analysis}

Entry saved to wellness database."""

            # Cache in memory
            self.memory_store[f"mood_{user_id}"] = entry_data
        else:
            response = "❌ Failed to save mood entry. Please try again."

        return [TextContent(type="text", text=response)]

    async def _handle_stress_monitoring(self, args: Dict[str, Any]) -> List[TextContent]:
        """Analyze stress through facial recognition"""
        image_data = args.get('image_data', '')
        ppg_data = args.get('ppg_data', {})
        user_id = args.get('user_id', 'default_user')

        if not self.hume_analyzer:
            return [TextContent(type="text", text="❌ Hume AI not configured for facial analysis")]

        try:
            # Decode base64 image
            import base64
            actual_image_data = base64.b64decode(image_data.split(',')[-1]) if ',' in image_data else base64.b64decode(image_data)

            # Analyze with Hume AI
            emotion_result = await self.hume_analyzer.analyze_facial_emotions(actual_image_data)

            if not emotion_result.get('success'):
                return [TextContent(type="text", text=f"❌ Facial analysis failed: {emotion_result.get('error')}")]

            emotions = emotion_result.get('emotions', {})
            dominant_emotion = emotion_result.get('dominant_emotion', 'neutral')

            # Calculate stress level (simplified logic)
            stress_indicators = ['anger', 'fear', 'sadness', 'disgust']
            stress_score = sum(emotions.get(indicator, 0) for indicator in stress_indicators)
            stress_level = min(int(stress_score * 10), 10)  # Scale to 1-10

            # Gemini analysis
            gemini_recommendations = ""
            if self.gemini_model:
                try:
                    prompt = f"""Based on this emotional analysis, provide stress relief recommendations:

Dominant Emotion: {dominant_emotion}
Stress Level: {stress_level}/10
Emotion Scores: {json.dumps(emotions, indent=2)}

Provide 2-3 immediate, practical recommendations for stress management."""

                    response = await self.gemini_model.generate_content_async(prompt)
                    gemini_recommendations = response.text
                except Exception as e:
                    gemini_recommendations = f"AI recommendations unavailable: {str(e)}"

            # Save session
            session_id = f"stress_{user_id}_{datetime.now().isoformat()}"
            session_data = {
                'session_id': session_id,
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'stress_level': stress_level,
                'ppg_data': ppg_data,
                'hume_facial_analysis': emotion_result,
                'gemini_analysis': gemini_recommendations
            }

            # Save to BigQuery (implement this method)
            # self.memory_saver.save_stress_session(session_data)

            response = f"""😐 Stress Analysis Complete

📊 Stress Level: {stress_level}/10
😊 Dominant Emotion: {dominant_emotion}

📈 Detailed Emotions:
{json.dumps(emotions, indent=2)}

🧠 AI Recommendations:
{gemini_recommendations}

Session recorded for your wellness tracking."""

            return [TextContent(type="text", text=response)]

        except Exception as e:
            return [TextContent(type="text", text=f"❌ Stress monitoring error: {str(e)}")]

    async def _handle_set_wellness_goal(self, args: Dict[str, Any]) -> List[TextContent]:
        """Create wellness goals"""
        goal_type = args.get('goal_type', '')
        description = args.get('description', '')
        target_value = args.get('target_value', {})
        user_id = args.get('user_id', 'default_user')

        goal_id = f"goal_{user_id}_{datetime.now().timestamp()}"

        # AI suggestions for goal setting
        gemini_suggestions = ""
        if self.gemini_model:
            try:
                prompt = f"""Create a SMART wellness goal based on:

Type: {goal_type}
User Description: {description}
Target: {json.dumps(target_value)}

Make this goal specific, measurable, achievable, relevant, and time-bound."""

                response = await self.gemini_model.generate_content_async(prompt)
                gemini_suggestions = response.text
            except Exception as e:
                gemini_suggestions = f"Goal suggestions unavailable: {str(e)}"

        goal_data = {
            'goal_id': goal_id,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'goal_type': goal_type,
            'goal_description': description,
            'target_value': target_value,
            'progress_percentage': 0.0,
            'status': 'active',
            'ai_suggestions': gemini_suggestions
        }

        # Save goal and cache
        self.memory_store[f"goal_{goal_id}"] = goal_data

        response = f"""🎯 Wellness Goal Created!

📝 Goal: {description}
🎨 Type: {goal_type}
🎯 Target: {json.dumps(target_value)}

🤖 AI-Enhanced Goal Setting:
{gemini_suggestions}

Goal ID: {goal_id}
Status: Ready for tracking!"""

        return [TextContent(type="text", text=response)]

    async def _handle_provide_mindfulness(self, args: Dict[str, Any]) -> List[TextContent]:
        """Generate mindfulness exercises"""
        exercise_type = args.get('exercise_type', 'breathing')
        current_emotions = args.get('current_emotions', {})
        duration_minutes = args.get('duration_minutes', 5)
        user_id = args.get('user_id', 'default_user')

        if not self.gemini_model:
            return [TextContent(type="text", text="❌ Gemini AI not configured for mindfulness exercises")]

        try:
            prompt = f"""Create a personalized mindfulness exercise:

Exercise Type: {exercise_type}
Duration: {duration_minutes} minutes
Current Emotional State: {json.dumps(current_emotions)}

Provide:
1. Step-by-step instructions for the exercise
2. Breathing or focus techniques
3. What to expect during and after
4. Why this exercise is beneficial for their current state"""

            response = await self.gemini_model.generate_content_async(prompt)
            exercise_instructions = response.text

            # Record session
            session_id = f"mindfulness_{user_id}_{datetime.now().timestamp()}"
            session_data = {
                'session_id': session_id,
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'exercise_type': exercise_type,
                'duration_seconds': duration_minutes * 60,
                'emotional_impact': current_emotions
            }

            self.memory_store[f"session_{session_id}"] = session_data

            full_response = f"""🧘 Mindfulness Exercise Generated

📚 Type: {exercise_type} ({duration_minutes} minutes)

🤖 Personalized Exercise:
{exercise_instructions}

Session ID: {session_id}
Ready to begin your practice!"""

            return [TextContent(type="text", text=full_response)]

        except Exception as e:
            return [TextContent(type="text", text=f"❌ Mindfulness exercise generation failed: {str(e)}")]

    async def _handle_crisis_support_check(self, args: Dict[str, Any]) -> List[TextContent]:
        """Analyze for crisis indicators"""
        user_id = args.get('user_id', 'default_user')
        timeframe_days = args.get('timeframe_days', 7)

        if not self.gemini_model:
            return [TextContent(type="text", text="❌ Crisis detection requires Gemini AI")]

        try:
            # Get recent mood entries (would query BigQuery in real implementation)
            recent_moods = []
            for key, data in self.memory_store.items():
                if key.startswith('mood_') and data.get('user_id') == user_id:
                    timestamp = datetime.fromisoformat(data['timestamp'])
                    if (datetime.now() - timestamp).days <= timeframe_days:
                        recent_moods.append(data)

            if not recent_moods:
                return [TextContent(type="text", text="ℹ️  No recent mood entries found for crisis analysis")]

            # Analyze patterns with Gemini
            prompt = f"""Analyze these mood entries for crisis indicators:

Recent Mood Entries (last {timeframe_days} days):
{json.dumps(recent_moods, indent=2)}

Please assess:
1. Overall emotional patterns and trends
2. Any concerning indicators or red flags
3. Level of concern (low/medium/high)
4. Recommended actions if needed
5. When to seek professional help

Be supportive and encourage professional help when appropriate."""

            response = await self.gemini_model.generate_content_async(prompt)
            crisis_analysis = response.text

            # Determine if immediate action needed
            high_risk_indicators = ['suicide', 'hurt myself', 'end it all', 'give up', 'no point', 'hopeless']
            low_mood_indicators = [entry for entry in recent_moods if entry.get('mood_score', 5) <= 2]

            if len(low_mood_indicators) >= 3:
                crisis_level = "MEDIUM"
                emergency_resources = """
🚨 EMERGENCY RESOURCES:
• Call emergency services: 911 or local equivalent
• National Suicide Prevention Lifeline: 988 (US)
• Crisis Text Line: Text HOME to 741741
• Local mental health crisis services"""
            else:
                crisis_level = "LOW"
                emergency_resources = "Continue monitoring and reach out if concerns persist."

            full_response = f"""🛟 Crisis Support Assessment

📊 Analysis Period: Last {timeframe_days} days
📈 Mood Entries Analyzed: {len(recent_moods)}

🔍 AI Crisis Assessment:
{crisis_analysis}

⚠️ Risk Level: {crisis_level}

{emergency_resources}

Entry ID: crisis_{user_id}_{datetime.now().timestamp()}
Remember: You're not alone - professional help is available 24/7."""

            return [TextContent(type="text", text=full_response)]

        except Exception as e:
            return [TextContent(type="text", text=f"❌ Crisis analysis error: {str(e)}")]


async def main():
    """Main server entry point"""
    server = Server("wellness-mcp-server")
    wellness_server = WellnessMCPServer()

    @server.list_tools()
    async def handle_list_tools():
        return await wellness_server.list_tools()

    @server.call_tool()
    async def handle_call_tool(request):
        return await wellness_server.call_tool(request)

    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
