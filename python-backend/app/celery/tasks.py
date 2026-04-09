import asyncio
import logging
from app.celery.worker import celery_app
from app.agents.scheduler import scheduler_agent
from app.agents.skill_graph import skill_graph_agent
from app.utils.llm import llm_client

logger = logging.getLogger(__name__)

# Utility to run async functions in a sync Celery worker
def run_async(coro):
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # This shouldn't happen in a new Celery worker thread but just in case
        import nest_asyncio
        nest_asyncio.apply()
        return asyncio.run(coro)
    return asyncio.run(coro)

@celery_app.task(name="tasks.generate_study_plan_async", bind=True)
def generate_study_plan_task(self, state_data: dict):
    """Background task for heavy study plan generation"""
    logger.info(f"Task {self.request.id} started: Study Plan Generation")
    try:
        return run_async(scheduler_agent.generate(state_data))
    except Exception as e:
        logger.error(f"Task Failed: {str(e)}")
        raise self.retry(exc=e, countdown=5)

@celery_app.task(name="tasks.analyze_skill_graph_async", bind=True)
def analyze_skill_graph_task(self, state_data: dict):
    """Background task for heavy skill graph analysis"""
    logger.info(f"Task {self.request.id} started: Skill Graph Analysis")
    try:
        return run_async(skill_graph_agent.generate(state_data))
    except Exception as e:
        logger.error(f"Task Failed: {str(e)}")
        raise self.retry(exc=e, countdown=5)
