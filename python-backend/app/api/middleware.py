import json
import time
import logging
from redis import asyncio as aioredis
from fastapi import Request, HTTPException, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

class RedisRateLimiter:
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        self.RATE_LIMIT = 20  # Increased limit for dev/demo
        self.WINDOW_SECONDS = 60
        self.use_memory_fallback = False
        self._memory_cache: Dict[str, Tuple[int, float]] = {} # key -> (count, expiry)

    async def is_rate_limited(self, key: str) -> bool:
        """Check if a specific key (IP) has exceeded the rate limit"""
        
        # ── 1. TRY REDIS FIRST ───────────────────────────────────────────
        if not self.use_memory_fallback:
            try:
                current_time = int(time.time())
                window_key = f"rate_limit:{key}:{current_time // self.WINDOW_SECONDS}"
                
                async with self.redis.pipeline(transaction=True) as pipe:
                    pipe.incr(window_key)
                    pipe.expire(window_key, self.WINDOW_SECONDS + 10)
                    results = await pipe.execute()
                    
                request_count = results[0]
                return request_count > self.RATE_LIMIT
            except Exception as e:
                logger.warning(f"[Redis] Connection failed, switching to in-memory fallback. Error: {str(e)}")
                self.use_memory_fallback = True

        # ── 2. IN-MEMORY FALLBACK ────────────────────────────────────────
        now = time.time()
        # Clean up old entries occasionally (10% chance per request)
        if now % 10 < 1:
            self._memory_cache = {k: v for k, v in self._memory_cache.items() if v[1] > now}

        count, expiry = self._memory_cache.get(key, (0, now + self.WINDOW_SECONDS))
        if now > expiry:
            count, expiry = 1, now + self.WINDOW_SECONDS
        else:
            count += 1
            
        self._memory_cache[key] = (count, expiry)
        return count > self.RATE_LIMIT

class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI Middleware to enforce rate limiting with Redis-to-Memory fallback"""
    
    def __init__(self, app, redis_url: str):
        super().__init__(app)
        self.limiter = RedisRateLimiter(redis_url)

    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path in ["/api/health", "/health", "/", "/metrics"]:
            return await call_next(request)
            
        try:
            client_ip = request.client.host if request.client else "unknown"
            if await self.limiter.is_rate_limited(client_ip):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return Response(
                    content=json.dumps({"detail": "Too many requests. Fallback limiter active."}),
                    status_code=429,
                    media_type="application/json"
                )
        except Exception as e:
            logger.error(f"RateLimitMiddleware safe-fail: {str(e)}")
            
        return await call_next(request)
