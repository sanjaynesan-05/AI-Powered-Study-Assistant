"""
Configuration settings for the AI Study Assistant
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Server
    PORT: int = 8001
    ENVIRONMENT: str = "development"
    DEMO_MODE: bool = True
    
    # Database - NeonDB PostgreSQL
    DATABASE_URL: str
    
    # AI Services
    GOOGLE_AI_API_KEY: str = ""
    YOUTUBE_API_KEY: str = ""
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 43200
    
    # Vector DB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    
    # Redis
"""
Configuration settings for the AI Study Assistant
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # Server
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEMO_MODE: bool = True
    
    # Database - NeonDB PostgreSQL
    DATABASE_URL: str
    
    # AI Services
    GOOGLE_AI_API_KEY: str = ""
    YOUTUBE_API_KEY: str = ""
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 43200
    
    # Vector DB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,http://localhost:3001,http://127.0.0.1:3001"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
