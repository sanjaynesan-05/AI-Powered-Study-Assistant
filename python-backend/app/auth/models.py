from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    credential: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    profilePicture: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    role: str
    profilePicture: Optional[str] = None
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    token: str

    class Config:
        populate_by_name = True
