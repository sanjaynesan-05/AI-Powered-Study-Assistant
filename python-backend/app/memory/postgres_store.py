"""
PostgreSQL Memory Store - Long-term memory persistence
"""
from datetime import datetime
from typing import Dict, List, Optional
import json
from sqlalchemy import select, func, desc
from app.db import AsyncSessionLocal
from app.models.memory import UserInteraction, UserProfile

class LongTermMemory:
    """Persistent memory across sessions using PostgreSQL"""
    
    async def store_interaction(self, user_id: str, state: Dict):
        """Store interaction in long-term memory"""
        async with AsyncSessionLocal() as session:
            try:
                memory_entry = UserInteraction(
                    user_id=user_id,
                    intent=state.get("intent"),
                    emotional_tone=state.get("emotional_tone"),
                    current_skill=state.get("current_skill"),
                    performance_score=state.get("performance_score", 0.0),
                    fatigue_level=state.get("fatigue_level", 0.0),
                    stress_level=state.get("stress_level", 0.0),
                    success=state.get("performance_score", 0.0) > 0.7,
                    reflection_insights=state.get("reflection_insights", []),
                    agent_outputs=state.get("agent_outputs", {}),
                    reasoning_chain=state.get("reasoning_chain", [])
                )
                
                session.add(memory_entry)
                await session.commit()
                
                # Trigger background profile update (simulated for now by direct call)
                await self.update_user_profile(user_id)
                
            except Exception as e:
                print(f"PostgreSQL store interaction error: {e}")
                await session.rollback()
    
    async def retrieve_user_profile(self, user_id: str) -> Dict:
        """Retrieve aggregated user profile from memory"""
        async with AsyncSessionLocal() as session:
            try:
                # 1. Try to get existing profile
                result = await session.execute(
                    select(UserProfile).where(UserProfile.user_id == user_id)
                )
                profile = result.scalar_one_or_none()
                
                if profile:
                    return {
                        "user_id": profile.user_id,
                        "avg_performance": profile.avg_performance,
                        "avg_fatigue": profile.avg_fatigue,
                        "avg_stress": profile.avg_stress,
                        "total_interactions": profile.total_interactions,
                        "success_rate": profile.success_rate,
                        "weak_areas": profile.weak_areas,
                        "success_patterns": profile.success_patterns,
                        "practiced_skills": profile.practiced_skills
                    }
                
                # 2. If no profile, we might need to create it from scratch
                # This part is handled by update_user_profile usually, 
                # but we'll return an empty profile or prompt update
                return {}
                
            except Exception as e:
                print(f"PostgreSQL retrieve profile error: {e}")
                return {}

    async def update_user_profile(self, user_id: str):
        """Aggregate interactions to update/create user profile"""
        async with AsyncSessionLocal() as session:
            try:
                # Aggregate performance metrics
                metrics_stmt = select(
                    func.avg(UserInteraction.performance_score).label("avg_perf"),
                    func.avg(UserInteraction.fatigue_level).label("avg_fatigue"),
                    func.avg(UserInteraction.stress_level).label("avg_stress"),
                    func.count(UserInteraction.id).label("total"),
                    # Success rate: count(success=True) / total
                    func.avg(func.cast(UserInteraction.success, func.Integer)).label("success_rate")
                ).where(UserInteraction.user_id == user_id)
                
                metrics_res = await session.execute(metrics_stmt)
                metrics = metrics_res.one()
                
                if not metrics.total:
                    return

                # Get unique practiced skills
                skills_stmt = select(func.distinct(UserInteraction.current_skill)).where(UserInteraction.user_id == user_id)
                skills_res = await session.execute(skills_stmt)
                skills = [s for (s,) in skills_res.all() if s]

                # Identify weak areas (perf < 0.6)
                weak_stmt = select(
                    UserInteraction.current_skill, 
                    func.count(UserInteraction.id).label("count")
                ).where(
                    UserInteraction.user_id == user_id, 
                    UserInteraction.performance_score < 0.6
                ).group_by(UserInteraction.current_skill).order_by(desc("count")).limit(5)
                
                weak_res = await session.execute(weak_stmt)
                weak_areas = [w.current_skill for w in weak_res.all() if w.current_skill]

                # Update or Insert profile
                prof_stmt = select(UserProfile).where(UserProfile.user_id == user_id)
                prof_res = await session.execute(prof_stmt)
                profile = prof_res.scalar_one_or_none()
                
                if not profile:
                    profile = UserProfile(user_id=user_id)
                    session.add(profile)
                
                profile.avg_performance = metrics.avg_perf or 0.0
                profile.avg_fatigue = metrics.avg_fatigue or 0.0
                profile.avg_stress = metrics.avg_stress or 0.0
                profile.total_interactions = metrics.total
                profile.success_rate = metrics.success_rate or 0.0
                profile.practiced_skills = skills
                profile.weak_areas = weak_areas
                # Simplified success patterns logic
                profile.success_patterns = ["Performs best when stress is low"] if profile.avg_stress < 0.4 else []
                
                await session.commit()
                
            except Exception as e:
                print(f"PostgreSQL update profile error: {e}")
                await session.rollback()

memory_store = LongTermMemory()
