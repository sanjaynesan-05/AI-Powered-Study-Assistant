"""
Schedule & Planner Agent - Creates optimized study schedules
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict, List
from datetime import datetime, timedelta

class SchedulerAgent:
    """Creates personalized study schedules and plans"""
    
    async def plan(self, state: AgentState) -> Dict:
        """Generate optimized study schedule"""
        
        current_skill = state.get("current_skill", "")
        learning_path = state.get("learning_path_sequence", [])
        resources = state.get("resources", [])
        wellness = state.get("agent_outputs", {}).get("wellness", {})
        preferences = state.get("preferences", {})
        
        prompt = f"""
        Create a personalized study schedule:
        
        Learning Goal: {current_skill}
        Learning Path: {learning_path}
        Available Resources: {len(resources)}
        Wellness State: Fatigue {wellness.get('fatigue_level', 0.3)}, Stress {wellness.get('stress_level', 0.2)}
        Preferences: {preferences}
        
        Create a schedule with:
        1. Daily study sessions (realistic timing)
        2. Break schedule (prevent burnout)
        3. Session duration (based on wellness)
        4. Best time of day for each topic
        5. Weekly milestones
        
        Return JSON:
        {{
            "study_plan": {{
                "total_duration": "X weeks",
                "sessions_per_week": 3-5,
                "session_length": "30min-2hours"
            }},
            "sessions": [
                {{
                    "day": "Monday",
                    "session_number": 1,
                    "topic": "topic name",
                    "duration": "1 hour",
                    "recommended_time": "morning|afternoon|evening",
                    "breaks": ["15 min after 45 min"],
                    "resources_to_use": ["resource1"]
                }}
            ],
            "calendar_events": [
                {{
                    "title": "Learn X",
                    "start_time": "ISO datetime",
                    "duration_minutes": 60,
                    "description": "Study session"
                }}
            ]
        }}
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        study_plan = data.get("study_plan", {})
        sessions = data.get("sessions", [])
        calendar_events = self._generate_calendar_events(sessions)
        
        return {
            "study_plan": study_plan,
            "calendar_events": calendar_events,
            "optimal_session_length": study_plan.get("session_length", "1 hour"),
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "scheduler": {
                    "total_duration": study_plan.get("total_duration", "4 weeks"),
                    "sessions_count": len(sessions),
                    "sessions_per_week": study_plan.get("sessions_per_week", 3),
                    "wellness_integrated": True
                }
            },
            "execution_path": [*state.get("execution_path", []), "scheduler"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Scheduler: Created {len(sessions)} sessions over {study_plan.get('total_duration', '4 weeks')}"
            ]
        }
    
    def _generate_calendar_events(self, sessions: List[Dict]) -> List[Dict]:
        """Generate calendar events from sessions"""
        
        events = []
        start_date = datetime.now()
        
        for i, session in enumerate(sessions[:10]):  # Limit to 10 events
            event_date = start_date + timedelta(days=i)
            
            # Determine time based on recommendation
            time_of_day = session.get("recommended_time", "morning")
            if time_of_day == "morning":
                event_date = event_date.replace(hour=9, minute=0)
            elif time_of_day == "afternoon":
                event_date = event_date.replace(hour=14, minute=0)
            else:  # evening
                event_date = event_date.replace(hour=18, minute=0)
            
            events.append({
                "title": f"Study: {session.get('topic', 'Learning Session')}",
                "start_time": event_date.isoformat(),
                "duration_minutes": self._parse_duration(session.get("duration", "1 hour")),
                "description": f"Session {session.get('session_number', i+1)}",
                "type": "study_session"
            })
        
        return events
    
    def _parse_duration(self, duration_str: str) -> int:
        """Parse duration string to minutes"""
        duration_str = duration_str.lower()
        if "hour" in duration_str:
            hours = int(duration_str.split()[0])
            return hours * 60
        elif "min" in duration_str:
            return int(duration_str.split()[0])
        return 60  # default 1 hour

scheduler_agent = SchedulerAgent()
