"""
MongoDB Memory Store - Long-term memory persistence
"""
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Dict, List, Optional
from app.config import settings

class LongTermMemory:
    """Persistent memory across sessions using MongoDB"""
    
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        self.db = self.client.ai_study_assistant
        self.memory_collection = self.db.user_memory
        self.profiles_collection = self.db.user_profiles
    
    async def store_interaction(self, user_id: str, state: Dict):
        """Store interaction in long-term memory"""
        
        memory_entry = {
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            "intent": state.get("intent"),
            "emotional_tone": state.get("emotional_tone"),
            "performance_score": state.get("performance_score"),
            "fatigue_level": state.get("fatigue_level"),
            "stress_level": state.get("stress_level"),
            "skills_practiced": state.get("current_skill"),
            "resources_used": len(state.get("resources", [])),
            "reflection_insights": state.get("reflection_insights", []),
            "success": state.get("performance_score", 0) > 0.7,
            "agent_outputs": state.get("agent_outputs", {})
        }
        
        await self.memory_collection.insert_one(memory_entry)
    
    async def retrieve_user_profile(self, user_id: str) -> Dict:
        """Retrieve aggregated user profile from memory"""
        
        # Check if profile exists
        profile = await self.profiles_collection.find_one({"user_id": user_id})
        if profile:
            return profile
        
        # Aggregate from interactions
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$sort": {"timestamp": -1}},
            {"$limit": 100},
            {"$group": {
                "_id": "$user_id",
                "avg_performance": {"$avg": "$performance_score"},
                "avg_fatigue": {"$avg": "$fatigue_level"},
                "avg_stress": {"$avg": "$stress_level"},
                "common_emotions": {"$push": "$emotional_tone"},
                "practiced_skills": {"$push": "$skills_practiced"},
                "total_interactions": {"$sum": 1},
                "success_rate": {"$avg": {"$cond": ["$success", 1, 0]}}
            }}
        ]
        
        result = await self.memory_collection.aggregate(pipeline).to_list(1)
        
        if result:
            profile = result[0]
            profile["weak_areas"] = await self._identify_weak_areas(user_id)
            profile["success_patterns"] = await self._find_success_patterns(user_id)
            return profile
        
        return {}
    
    async def _identify_weak_areas(self, user_id: str) -> List[str]:
        """Identify topics where user struggles"""
        pipeline = [
            {"$match": {"user_id": user_id, "performance_score": {"$lt": 0.6}}},
            {"$group": {"_id": "$skills_practiced", "struggle_count": {"$sum": 1}}},
            {"$sort": {"struggle_count": -1}},
            {"$limit": 5}
        ]
        
        results = await self.memory_collection.aggregate(pipeline).to_list(5)
        return [r["_id"] for r in results if r["_id"]]
    
    async def _find_success_patterns(self, user_id: str) -> List[str]:
        """Find patterns in successful learning sessions"""
        successful = await self.memory_collection.find({
            "user_id": user_id,
            "success": True
        }).sort("timestamp", -1).limit(20).to_list(20)
        
        patterns = []
        if successful:
            avg_fatigue = sum(s.get("fatigue_level", 0) for s in successful) / len(successful)
            if avg_fatigue < 0.4:
                patterns.append("Performs best when well-rested")
        
        return patterns

memory_store = LongTermMemory()
