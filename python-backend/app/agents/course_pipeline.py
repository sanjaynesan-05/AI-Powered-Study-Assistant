import json
import asyncio
import time
from typing import Dict, Any, List
from pydantic import ValidationError
import urllib.parse

from app.schemas.course_schema import CourseSchema, MockTestSchema, FullLearningResponseSchema
from app.utils.llm import llm_client
from app.utils.logger import get_logger
from app.utils.youtube import youtube_client

logger = get_logger("app.agents.course_pipeline")

def is_valid_url(url: str) -> bool:
    return bool(url and isinstance(url, str) and url.startswith("http"))

class CoursePipeline:
    def __init__(self):
        self.max_retries = 3

    async def generate_full_learning(self, goal: str) -> Dict[str, Any]:
        """Main orchestrated pipeline: Course -> Parallel(Resources, Mock Test)"""
        logger.info(f"🚀 Starting Full Learning Pipeline for goal: {goal}")
        
        state = {"course_data": None, "mock_test_data": None, "warnings": []}
        
        async def _execute():
            # 1. Generate core course structure
            state["course_data"] = await self._generate_course_with_retry(goal)
            if not state["course_data"]:
                state["warnings"].append("Course structure generation failed. Using fallback.")
                state["course_data"] = self._get_fallback_course(goal)
                
            all_topics = []
            for module in state["course_data"].get("modules", []):
                for topic in module.get("topics", []):
                    all_topics.append(topic["topic_name"])
                    
            # 2. Parallel: Fetch Resources and Generate Mock Test
            mock_test_task = asyncio.create_task(self._generate_mock_test_with_retry(goal, state["course_data"]))
            resources_task = asyncio.create_task(self._attach_resources(state["course_data"], all_topics))
            
            gathered = await asyncio.gather(mock_test_task, resources_task, return_exceptions=True)
            mock_res, resource_res = gathered[0], gathered[1]
            
            if isinstance(mock_res, Exception) or not mock_res:
                 state["warnings"].append(f"Mock test failure: {str(mock_res) if isinstance(mock_res, Exception) else 'Empty Return'}")
                 state["mock_test_data"] = {"test_name": f"{goal} Assessment", "questions": []}
            else:
                 state["mock_test_data"] = mock_res
                 
            if isinstance(resource_res, Exception):
                 state["warnings"].append(f"Resource attachment failure: {resource_res}")
            else:
                 state["course_data"] = resource_res

        try:
             await asyncio.wait_for(_execute(), timeout=20.0)
        except asyncio.TimeoutError:
             logger.error("⏱️ Pipeline execution timed out at 20 seconds.")
             state["warnings"].append("Request timed out. Proceeding with partial data.")
             if not state["course_data"]:
                 raise Exception("Request timed out completely before course generation.")
             if not state["mock_test_data"]:
                 state["mock_test_data"] = {"test_name": f"{goal} Assessment", "questions": []}
                 
        return {
            "course": state["course_data"],
            "mock_test": state["mock_test_data"],
            "warnings": state["warnings"]
        }

    async def _generate_course_with_retry(self, goal: str) -> Dict:
        """Generate Course structure with validation + retry"""

        
        prompt = f"""
        You are an elite AI educational architect.
        Generate a complete, comprehensive learning course for: "{goal}".
        
        STRICT RULES:
        - Must have at least 2 modules.
        - Each module must have at least 2 topics.
        - Each topic must have subtopics (list of strings).
        - DO NOT include the 'resources' key in your output; that will be handled later.
        - NO placeholders. Return ONLY valid JSON.
        
        OUTPUT SCHEMA:
        {{
            "course_name": "{goal} Mastery",
            "difficulty": "Beginner to Intermediate",
            "estimated_duration": "4 weeks",
            "modules": [
                {{
                    "module_title": "string",
                    "description": "string",
                    "topics": [
                        {{
                            "topic_name": "string",
                            "difficulty": "string",
                            "subtopics": ["string", "string"]
                        }}
                    ]
                }}
            ]
        }}
        """
        
        for attempt in range(self.max_retries):
            try:
                response = await llm_client.ainvoke(prompt)
                data = llm_client.parse_json_response(response)
                
                # Check required fields
                if "course_name" in data and "modules" in data and len(data["modules"]) >= 2:
                    valid_topics = True
                    for m in data["modules"]:
                         if not m.get("topics") or len(m["topics"]) == 0:
                              valid_topics = False
                    if valid_topics:
                         return data
                         
                logger.warning(f"Attempt {attempt + 1}: Course structure invalid. Retrying...")
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                
        return None
        
    async def _generate_mock_test_with_retry(self, goal: str, course_data: Dict) -> Dict:
        """Generate Mock Test with validation + retry"""
        
        course_context = json.dumps([m["module_title"] for m in course_data.get("modules", [])])
        
        prompt = f"""
        Generate a mock test for the topic: "{goal}".
        The test should test knowledge derived from these modules: {course_context}.
        
        STRICT RULES:
        - Must contain exactly 5 REAL questions.
        - Each question must have exactly 4 options.
        - You must specify the exact correct answer.
        - Include an explanation for why the answer is correct.
        - Output ONLY valid JSON.
        
        OUTPUT SCHEMA:
        {{
            "test_name": "{goal} Assessment",
            "questions": [
                {{
                    "question": "string",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "exactly matching one of the options",
                    "explanation": "string",
                    "difficulty": "Beginner|Intermediate|Advanced"
                }}
            ]
        }}
        """
        
        for attempt in range(self.max_retries):
            try:
                response = await llm_client.ainvoke(prompt)
                data = llm_client.parse_json_response(response)
                
                if "questions" in data:
                     # Validate with pydantic
                     MockTestSchema(**data)
                     return data
                     
                logger.warning(f"Attempt {attempt + 1}: Mock Test structure invalid. Retrying...")
            except ValidationError as e:
                logger.warning(f"Attempt {attempt + 1} Mock Test validation failed: {e}. Retrying...")
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} Mock Test failed: {e}")
                
        return None

    async def _attach_resources(self, course_data: Dict, all_topics: List[str]) -> Dict:
        """Fetch resources in parallel for top topics, use placeholders for rest"""
        top_topics = all_topics[:3]
        
        tasks = []
        for topic in top_topics:
             tasks.append(youtube_client.search_learning_videos(topic, max_results=1))
             
        youtube_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        resource_map = {}
        for index, topic in enumerate(top_topics):
             videos = youtube_results[index]
             if not isinstance(videos, Exception) and videos:
                  url = videos[0]["url"]
                  if not is_valid_url(url):
                      encoded_topic = urllib.parse.quote(topic)
                      url = f"https://www.youtube.com/results?search_query={encoded_topic}"
                      
                  resource_map[topic] = [{
                       "type": "video",
                       "title": videos[0]["title"],
                       "url": url
                  }]
             else:
                  resource_map[topic] = self._get_fallback_resource(topic)
                  
        for module in course_data.get("modules", []):
             for topic in module.get("topics", []):
                  t_name = topic["topic_name"]
                  if t_name in resource_map:
                       topic["resources"] = resource_map[t_name]
                  else:
                       topic["resources"] = self._get_fallback_resource(t_name)
                       
        return course_data

    def _get_fallback_resource(self, topic: str) -> List[Dict]:
        return [{
            "type": "article",
            "title": f"Comprehensive Guide to {topic}",
            "url": "https://www.freecodecamp.org/news/search/?q=" + topic.replace(" ", "%20")
        }]
        
    def _get_fallback_course(self, goal: str) -> Dict:
        return {
            "course_name": f"{goal} Fundamentals",
            "difficulty": "Beginner",
            "estimated_duration": "2 weeks",
            "modules": [
                {
                    "module_title": "Introduction to Concept",
                    "description": f"Learn the basics of {goal}",
                    "topics": [
                        {
                            "topic_name": "Core Principles",
                            "difficulty": "Beginner",
                            "subtopics": ["Definition", "History"]
                        },
                        {
                            "topic_name": "Setting Up",
                            "difficulty": "Beginner",
                            "subtopics": ["Installation", "First Steps"]
                        }
                    ]
                },
                {
                    "module_title": "Advanced Topics",
                    "description": f"Dive deeper into {goal}",
                    "topics": [
                        {
                            "topic_name": "Best Practices",
                            "difficulty": "Intermediate",
                            "subtopics": ["Patterns", "Anti-patterns"]
                        }
                    ]
                }
            ]
        }

    def _get_fallback_mock_test(self, goal: str) -> Dict:
        return {
            "test_name": f"Basic {goal} Assessment",
            "questions": [
                {
                    "question": f"What is the primary purpose of {goal}?",
                    "options": ["Solving problems", "Making coffee", "Playing games", "Sleeping"],
                    "correct_answer": "Solving problems",
                    "explanation": "It helps solve complex problems.",
                    "difficulty": "Beginner"
                }
            ] * 5  # Ensure exactly 5 questions
        }

course_pipeline = CoursePipeline()
