"""
Configuration settings for the AI Study Assistant
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Server
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Database
    MONGODB_URI: str
    
    # AI Services
    GOOGLE_AI_API_KEY: str
    YOUTUBE_API_KEY: str
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 43200
    
    # Vector DB
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
