from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import uuid

from app.db import Base

class UserInteraction(Base):
    """Stores detailed interaction history for each session"""
    __tablename__ = "user_interactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Core state data
    intent = Column(String)
    emotional_tone = Column(String)
    current_skill = Column(String)
    
    # Metrics
    performance_score = Column(Float)
    fatigue_level = Column(Float)
    stress_level = Column(Float)
    
    # Success tracking
    success = Column(Boolean, default=False)
    
    # Complex data objects stored as JSONB
    reflection_insights = Column(JSONB, default=[])
    agent_outputs = Column(JSONB, default={})
    reasoning_chain = Column(JSONB, default=[])

class UserProfile(Base):
    """Stores aggregated user profile and learning patterns"""
    __tablename__ = "user_profiles"
    
    user_id = Column(String, primary_key=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Aggregated Stats
    avg_performance = Column(Float, default=0.0)
    avg_fatigue = Column(Float, default=0.0)
    avg_stress = Column(Float, default=0.0)
    total_interactions = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    
    # Aggregated Insights
    weak_areas = Column(JSONB, default=[])
    success_patterns = Column(JSONB, default=[])
    practiced_skills = Column(JSONB, default=[])
    common_emotions = Column(JSONB, default=[])
