from celery import Celery
import os
from app.config import settings

# Initialize Celery app
celery_app = Celery(
    "ai_study_assistant",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.celery.tasks"]
)

# Optional configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max for AI tasks
    worker_prefetch_multiplier=1, # One task at a time per worker for GPU memory
)

if __name__ == "__main__":
    celery_app.start()
