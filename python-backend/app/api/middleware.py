import time
import logging
from redis import asyncio as aioredis
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

logger = logging.getLogger(__name__)

class RedisRateLimiter:
    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        self.RATE_LIMIT = 10  # 10 requests
        self.WINDOW_SECONDS = 60  # per 60 seconds

    async def is_rate_limited(self, key: str) -> bool:
        """Check if a specific key (IP) has exceeded the rate limit"""
        try:
            current_time = int(time.time())
            window_key = f"rate_limit:{key}:{current_time // self.WINDOW_SECONDS}"
            
            async with self.redis.pipeline(transaction=True) as pipe:
                pipe.incr(window_key)
                pipe.expire(window_key, self.WINDOW_SECONDS)
                results = await pipe.execute()
                
            request_count = results[0]
            return request_count > self.RATE_LIMIT
        except Exception as e:
            logger.error(f"Redis Rate Limiter Error: {str(e)}")
            # Fallback: Allow request if Redis is down to prevent blocking legitimate traffic
            return False

class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI Middleware to enforce Redis-based rate limiting"""
    
    def __init__(self, app, redis_url: str):
        super().__init__(app)
        self.limiter = RedisRateLimiter(redis_url)

    async def dispatch(self, request: Request, call_next):
        # Allow health checks and root without limiting
        if request.url.path in ["/api/health", "/health", "/"]:
            return await call_next(request)
            
        client_ip = request.client.host
        if await self.limiter.is_rate_limited(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
            
        return await call_next(request)
