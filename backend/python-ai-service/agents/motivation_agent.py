"""Motivation Agent - Provides emotional support and encouragement."""
from typing import Dict, List, Any
import random
import json
from datetime import datetime
import google.generativeai as genai
class MotivationAgent:
    """Agent for keeping students engaged and emotionally supported."""
    def __init__(self, gemini_api_key: str):
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.affirmations = [
            "You're capable of amazing things when you put your mind to it.",
            "Every expert was once a beginner. You're right where you need to be.",
            "Your brain is getting stronger with every concept you learn.",
            "Mistakes are proof that you're trying - that's something to be proud of!",
            "You're building knowledge that will serve you for the rest of your life.",
            "Learning is a journey, not a race. Celebrate your progress.",
            "You have the power to master this material, one step at a time.",
            "Your dedication to learning sets you apart from the crowd."
        ]
        self.encouraging_messages = {
            "excellent_performance": [
                "Outstanding work! You're mastering this material brilliantly.",
                "Exceptional performance! Keep up this incredible momentum.",
                "You're absolutely crushing it! This level of understanding is impressive."
            ],
            "good_performance": [
                "Great job! You're building a solid foundation.",
                "Well done! Your hard work is paying off.",
                "Nice work! You're making excellent progress."
            ],
            "needs_improvement": [
                "Keep pushing forward! Every expert has faced challenges like this.",
                "You're building resilience with every attempt. That's valuable too!",
                "Learning takes time. You're getting stronger every day."
            ],
            "struggling": [
                "Remember: every journey has difficult stretches. You've got this!",
                "Take a moment to breathe. You're capable of more than you know.",
                "This challenge is shaping you into an even stronger learner."
            ]
        }
    def generate_motivational_response(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized motivational content based on context using Gemini AI."""
        try:
            # Extract user input from context
            challenges = context.get("challenges", [])
            user_prompt = challenges[0] if challenges else context.get("prompt", "")
            current_mood = context.get("current_mood", "neutral")
            goals = context.get("goals", [])
            achievements = context.get("achievements", [])

            if user_prompt:
                # Use Gemini to generate conversational response
                return self._generate_chat_response(user_prompt, current_mood, goals, achievements)
            else:
                # Fallback to static motivational content
                return self._generate_static_motivation(context)

        except Exception as e:
            print(f"Error generating AI response: {e}")
            return self._generate_static_motivation(context)

    def _generate_chat_response(self, user_prompt: str, current_mood: str, goals: List[str], achievements: List[str]) -> Dict[str, Any]:
        """Generate AI-powered chat response using Gemini."""
        try:
            # Create context-aware prompt for Gemini
            context_prompt = f"""
You are an AI Study Mentor - a friendly, encouraging, and knowledgeable tutor who helps students with their learning journey.

USER CONTEXT:
- Current mood: {current_mood}
- Learning goals: {', '.join(goals) if goals else 'General learning'}
- Recent achievements: {', '.join(achievements) if achievements else 'Building knowledge'}

USER QUESTION/MESSAGE: {user_prompt}

Please provide a helpful, encouraging response that:
1. Directly addresses their question or concern
2. Provides relevant learning advice or information
3. Maintains a supportive and motivating tone
4. If appropriate, suggests next steps or resources
5. Keeps the response conversational and natural

Response should be comprehensive but not overwhelming - aim for 2-4 paragraphs maximum.
"""

            print(f"🤖 Sending to Gemini: {context_prompt[:200]}...")

            # Generate response using Gemini
            response = self.model.generate_content(context_prompt)
            ai_response = response.text.strip()

            print(f"🤖 Gemini Response: {ai_response[:200]}...")

            # Extract key information for structured response
            return {
                "primary_message": ai_response,
                "motivational_message": ai_response,
                "response_type": "chat_response",
                "context": {
                    "mood": current_mood,
                    "goals": goals,
                    "achievements": achievements
                },
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to static response
            return self._generate_fallback_chat_response(user_prompt, current_mood)

    def _generate_fallback_chat_response(self, user_prompt: str, current_mood: str) -> Dict[str, Any]:
        """Generate fallback chat response when Gemini is unavailable."""
        # More intelligent fallback responses based on user input
        prompt_lower = user_prompt.lower()

        if "python" in prompt_lower or "programming" in prompt_lower:
            response_text = "I'd love to help you with Python programming! Python is a great language to start with. You can begin by installing Python from python.org, then try some basic tutorials. What specific aspect of Python are you interested in - syntax, data structures, or building projects?"
        elif "javascript" in prompt_lower or "js" in prompt_lower:
            response_text = "JavaScript is fantastic for web development! Start with the basics of variables, functions, and DOM manipulation. FreeCodeCamp and MDN Web Docs have excellent resources. What would you like to build with JavaScript?"
        elif "help" in prompt_lower or "how" in prompt_lower:
            response_text = "I'm here to help you with your learning journey! I can assist with programming concepts, study techniques, career guidance, and staying motivated. What specific topic or question do you have in mind?"
        elif "start" in prompt_lower or "begin" in prompt_lower:
            response_text = "Starting a new learning journey is exciting! The key is to start small and be consistent. Set achievable goals, create a study schedule, and don't be afraid to ask questions. What subject are you looking to begin learning?"
        else:
            base_responses = {
                "focused": f"I can see you're focused and ready to learn! That's a great mindset. Regarding your question about '{user_prompt}', I'd recommend breaking it down into smaller, manageable steps. How can I help you get started?",
                "tired": f"I notice you might be feeling tired, but you're still reaching out for help - that's commendable! When you're rested, we can tackle '{user_prompt}' together. For now, remember that quality learning happens when you're well-rested.",
                "stressed": f"Learning can be stressful sometimes, but you're taking a positive step by asking for help. Let's take this one step at a time. Regarding '{user_prompt}', we can work through this together at a pace that feels comfortable.",
                "confused": f"It's completely normal to feel confused when learning something new. That's actually a sign that you're engaging deeply with the material. About '{user_prompt}' - let's break this down into simpler concepts.",
                "happy": f"Great to see you're in a positive mood for learning! That enthusiasm will carry you far. I'm excited to help you with '{user_prompt}'. What aspect would you like to explore first?",
                "neutral": f"I'm here to support your learning journey! Regarding '{user_prompt}', I can provide guidance, resources, and encouragement. What specific area would you like to focus on?"
            }
            response_text = base_responses.get(current_mood, base_responses["neutral"])

        return {
            "primary_message": response_text,
            "motivational_message": response_text,
            "response_type": "fallback_chat",
            "context": {"mood": current_mood},
            "timestamp": datetime.now().isoformat(),
            "note": "Using intelligent fallback - Gemini API key needs to be configured for full AI responses"
        }

    def _generate_static_motivation(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate static motivational content (original implementation)."""
        performance_level = context.get("performance_level", "good_performance")
        emotional_state = context.get("emotional_state", "neutral")
        fatigue_level = context.get("fatigue_level", 0.3)
        progress_milestone = context.get("progress_milestone", False)

        response = {
            "primary_message": self._get_primary_message(performance_level, emotional_state),
            "affirmation": random.choice(self.affirmations),
            "encouragement": self._generate_encouragement(performance_level, emotional_state),
            "progress_celebration": self._celebrate_progress(context),
            "support_elements": self._provide_support(fatigue_level, emotional_state),
            "next_goal": self._suggest_next_goal(context),
            "response_type": "static_motivation"
        }
        return response
    def _get_primary_message(self, performance_level: str, emotional_state: str) -> str:
        """Get the main motivational message."""
        messages = self.encouraging_messages.get(performance_level, self.encouraging_messages["good_performance"])
        if emotional_state == "tired":
            messages = [msg + " Remember to take care of yourself too!" for msg in messages]
        elif emotional_state == "stressed":
            messages = [msg + " Take a deep breath - you've got this!" for msg in messages]
        elif emotional_state == "confused":
            messages = ["You're making progress even when it doesn't feel like it!"]
        elif emotional_state == "focused":
            messages = [msg + " Your concentration is paying off!" for msg in messages]
        return random.choice(messages)
    def _generate_encouragement(self, performance_level: str, emotional_state: str) -> Dict[str, Any]:
        """Generate detailed encouragement."""
        encouragement = {
            "immediate": "",
            "long_term": "",
            "specific_action": ""
        }
        if performance_level == "excellent_performance":
            encouragement["immediate"] = "You're excelling in ways that matter!"
        elif performance_level == "needs_improvement":
            encouragement["immediate"] = "This is hard, and that's okay. Hard things make us grow."
        else:
            encouragement["immediate"] = "You're making meaningful progress every day."
        encouragement["long_term"] = random.choice([
            "Remember why you started. That passion brought you here.",
            "The skills you're building now will open incredible doors.",
            "Every concept you master increases your capabilities exponentially.",
            "You're developing mental resilience that lasts a lifetime.",
            "Knowledge compounds over time - you're investing in your future self."
        ])
        encouragement["specific_action"] = self._get_specific_action(performance_level, emotional_state)
        return encouragement
    def _get_specific_action(self, performance_level: str, emotional_state: str) -> str:
        """Suggest a specific actionable encouragement."""
        actions = []
        if performance_level in ["needs_improvement", "struggling"]:
            actions.extend([
                "Break this into smaller, manageable steps.",
                "Try teaching this concept to someone else (real or imaginary).",
                "Compare your current understanding to where you were a week ago.",
                "Focus on understanding one key concept deeply rather than rushing through many."
            ])
        else:
            actions.extend([
                "Build on this success by tackling a related challenge.",
                "Share what you've learned with someone - teaching reinforces learning.",
                "Reflect on what strategies helped you succeed here.",
                "Set a small reward for reaching your next milestone."
            ])
        if emotional_state == "tired":
            actions.append("Take a 5-minute walk or stretch break to recharge.")
        elif emotional_state == "stressed":
            actions.append("Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.")
        elif emotional_state == "confused":
            actions.append("Step away briefly, then come back with fresh eyes.")
        elif emotional_state == "happy":
            actions.append("Ride this positive momentum to tackle the next challenge!")
        return random.choice(actions)
    def _celebrate_progress(self, context: Dict[str, Any]) -> str:
        """Celebrate progress milestones."""
        milestone_messages = []
        if context.get("progress_milestone"):
            milestone_messages.extend([
                "🎉 Milestone achieved! You've grown so much!",
                "🌟 Progress celebration! Pat yourself on the back!",
                "⭐ Achievement unlocked! You're making real progress!",
                "🏆 Goal reached! You deserve to feel proud of this!"
            ])
        if context.get("days_studied", 0) > 0:
            days = context["days_studied"]
            if days % 7 == 0:  # Weekly milestone
                milestone_messages.append(f"📅 Week {days//7} complete! Consistency is your superpower!")
            elif days in [1, 7, 30]:  # Special day counts
                milestone_messages.append(f"🎯 {days} day{'s' if days != 1 else ''} of consistent learning! That's commitment!")
        if context.get("topics_mastered", 0) > 0:
            topics = context["topics_mastered"]
            milestone_messages.append(f"🧠 {topics} topic{'s' if topics != 1 else ''} mastered! Your knowledge is growing!")
        if not milestone_messages:
            improvement_rate = context.get("improvement_rate", 0)
            if improvement_rate > 0:
                milestone_messages.append(f"📈 Improving by {improvement_rate:.1f}% - that's real growth!")
            else:
                milestone_messages.append("💪 Every study session makes you stronger!")
        return random.choice(milestone_messages) if milestone_messages else random.choice([
            "🌱 Small steps, big changes. You're growing!",
            "💡 Learning is progress. Progress is success.",
            "🔥 Keep the learning fire burning!"
        ])
    def _provide_support(self, fatigue_level: float, emotional_state: str) -> List[Dict[str, Any]]:
        """Provide supportive elements based on current state."""
        supports = []
        if fatigue_level > 0.7:
            supports.append({
                "type": "rest_reminder",
                "message": "Your body and mind need rest to perform at their best.",
                "action": "Consider a short break or earlier bedtime tonight."
            })
        if fatigue_level > 0.5:
            supports.append({
                "type": "energy_boost",
                "message": "Keep hydrated and fuel your brain with healthy snacks.",
                "action": "Drink water and eat something nutritious soon."
            })
        if emotional_state == "confused":
            supports.append({
                "type": "perspective_shift",
                "message": "Confusion is often a sign you're about to have an 'aha!' moment.",
                "action": "Be patient with yourself - clarity often comes after wrestling with ideas."
            })
        if emotional_state == "stressed":
            supports.append({
                "type": "stress_relief",
                "message": "Learning works best when your nervous system is calm.",
                "action": "Try box breathing: inhale for 4 counts, hold for 4, exhale for 4."
            })
        if emotional_state == "tired":
            supports.append({
                "type": "gentle_encouragement",
                "message": "Even tired minds can learn - you're capable of more than you think.",
                "action": "If possible, study during your peak energy time tomorrow."
            })
        supports.append({
            "type": "self_compassion",
            "message": "Be kind to yourself on this learning journey.",
            "action": "Acknowledge that learning is challenging and you're doing your best."
        })
        return supports[:3]  # Limit to 3 supports
    def _suggest_next_goal(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Suggest the next achievable goal."""
        performance_level = context.get("performance_level", "good_performance")
        current_topic = context.get("current_topic", "your studies")
        goals = {
            "excellent_performance": [
                {"goal": f"Master an advanced concept in {current_topic}",
                 "timeline": "this week",
                 "reward": "A special treat or celebration"},
                {"goal": "Help someone else understand a concept you've mastered",
                 "timeline": "within 2 days",
                 "reward": "The satisfaction of teaching"}
            ],
            "good_performance": [
                {"goal": f"Complete one more practice session on {current_topic}",
                 "timeline": "today",
                 "reward": "Time for something enjoyable"},
                {"goal": "Review what you've learned this week",
                 "timeline": "tomorrow",
                 "reward": "A sense of accomplishment"}
            ],
            "needs_improvement": [
                {"goal": f"Spend focused time on difficult parts of {current_topic}",
                 "timeline": "next study session",
                 "reward": "Celebrate the effort, regardless of outcome"},
                {"goal": "Break down one complex concept into smaller parts",
                 "timeline": "today",
                 "reward": "Progress is the real victory"}
            ]
        }
        goal_set = goals.get(performance_level, goals["good_performance"])
        selected_goal = random.choice(goal_set)
        return {
            "goal": selected_goal["goal"],
            "timeline": selected_goal["timeline"],
            "reward": selected_goal["reward"],
            "motivation": "Small goals create big momentum!"
        }
    def create_daily_motivation(self, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create daily motivational content for sustained engagement."""
        context = user_context or {
            "performance_trend": random.choice(["improving", "steady", "challenging"]),
            "study_streak": random.randint(0, 10),
            "time_of_day": datetime.now().strftime("%H:%M")
        }
        daily_motivation = {
            "greeting": self._get_time_based_greeting(),
            "daily_affirmation": random.choice(self.affirmations),
            "focus_message": self._get_focus_message(context),
            "streak_celebration": self._celebrate_streak(context.get("study_streak", 0)),
            "wellness_reminder": self._get_wellness_reminder()
        }
        return daily_motivation
    def _get_time_based_greeting(self) -> str:
        """Get appropriate greeting based on time of day."""
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return random.choice(["Good morning!", "Rise and shine!", "Morning motivation time!"])
        elif 12 <= hour < 17:
            return random.choice(["Good afternoon!", "Hope your day's going well!", "Afternoon focus!"])
        elif 17 <= hour < 22:
            return random.choice(["Good evening!", "Evening study session!", "Evening motivation!"])
        else:
            return random.choice(["Burning the midnight oil?", "Late night learning!", "Night owl studying!"])
    def _get_focus_message(self, context: Dict) -> str:
        """Get focused motivational message."""
        trend = context.get("performance_trend", "steady")
        if trend == "improving":
            return "You're on an upward trajectory - keep the momentum going!"
        elif trend == "challenging":
            return "Every expert faces challenges. You're building resilience!"
        else:
            return "Consistent effort creates lasting results. You're on the right path!"
    def _celebrate_streak(self, streak: int) -> str:
        """Celebrate study streak."""
        if streak == 0:
            return "Every journey starts with a single step. Ready to begin?"
        elif streak == 1:
            return "First day down! The habit is forming! 🎯"
        elif streak < 7:
            return f"{streak} days in a row! Building momentum! 🔥"
        elif streak < 30:
            return f"{streak} day streak! You're unstoppable! ⚡"
        else:
            return f"{streak} days of consistent learning! Legendary! 🏆"
    def _get_wellness_reminder(self) -> str:
        """Get wellness reminder."""
        reminders = [
            "Remember to stay hydrated while learning.",
            "Take regular breaks to keep your mind sharp.",
            "Movement energizes learning - stand up and stretch!",
            "Healthy eating fuels brain power.",
            "Good sleep is your secret learning weapon.",
            "A positive mindset enhances understanding."
        ]
        return random.choice(reminders)
def get_motivational_support(context: Dict[str, Any], api_key: str) -> Dict[str, Any]:
    """Helper function to get motivational support."""
    agent = MotivationAgent(api_key)
    return agent.generate_motivational_response(context)
def get_daily_motivation(user_context: Dict = None, api_key: str = None) -> Dict[str, Any]:
    """Helper function to get daily motivation."""
    agent = MotivationAgent(api_key or "dummy_key")
    return agent.create_daily_motivation(user_context)

def generate_motivation(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main function expected by Flask server for generating motivation."""
    import os
    api_key = os.getenv('GEMINI_API_KEY', 'dummy_key')

    # Extract parameters from request
    current_mood = request_data.get('current_mood', 'neutral')
    challenges = request_data.get('challenges', [])
    goals = request_data.get('goals', [])
    achievements = request_data.get('achievements', [])

    # Create context for motivation agent
    context = {
        "emotional_state": current_mood,
        "challenges": challenges,
        "goals": goals,
        "achievements": achievements,
        "performance_level": "good_performance",
        "fatigue_level": 0.3,
        "progress_milestone": len(achievements) > 0
    }

    # Handle case where there's a specific prompt/question
    if challenges and len(challenges) > 0:
        context["prompt"] = challenges[0]

    try:
        agent = MotivationAgent(api_key)
        response = agent.generate_motivational_response(context)

        print(f"🤖 Agent response: {response}")

        # Format response for frontend compatibility
        formatted_response = {
            "motivational_message": response.get("primary_message", "I'm here to help you with your learning journey!"),
            "affirmation": response.get("affirmation", ""),
            "encouragement": response.get("encouragement", {}),
            "support_elements": response.get("support_elements", []),
            "response_type": response.get("response_type", "chat_response"),
            "timestamp": response.get("timestamp", datetime.now().isoformat())
        }

        print(f"📤 Formatted response: {formatted_response}")
        return formatted_response
    except Exception as e:
        print(f"Error in generate_motivation: {e}")
        # Fallback response
        return {
            "motivational_message": "I'm here to support your learning journey! What would you like to know or discuss?",
            "affirmation": "You're taking positive steps toward your goals.",
            "encouragement": {"immediate": "Keep going!", "long_term": "Every step counts."},
            "support_elements": [{"type": "general", "message": "Learning is a process - be patient with yourself."}],
            "response_type": "fallback",
            "timestamp": datetime.now().isoformat()
        }
