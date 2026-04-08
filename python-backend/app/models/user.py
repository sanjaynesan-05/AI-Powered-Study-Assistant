from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, DateTime
from typing import Optional
from datetime import datetime
import uuid

from app.db import Base

# --- Database ORM Model ---
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    picture = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
    last_login = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Pydantic API Schemas ---
class GoogleAuthRequest(BaseModel):
    credential: str

class UserResponse(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None
    google_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
