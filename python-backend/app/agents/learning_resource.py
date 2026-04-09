"""
Learning Resource Agent - Generates explanations and curates resources
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from app.config import settings
from typing import Dict, List
import aiohttp

from app.memory.vector_store import vector_store
from app.utils.embeddings import embedding_engine

class LearningResourceAgent:
    """Generates AI explanations and curates external resources with RAG support"""
    
    async def generate(self, state: AgentState) -> Dict:
        """Generate personalized learning resources with contextual RAG memory"""
        
        current_skill = state.get("current_skill", "")
        learning_style = state.get("learning_style", "visual")
        difficulty = state.get("difficulty_preference", "intermediate")
        
        # 1. RAG: Retrieve context from vector store
        context_docs = []
        try:
            # Look up existing material on the skill
            results = await vector_store.query(
                collection_name="subject_materials",
                query_texts=[current_skill],
                n_results=3
            )
            context_docs = results.get("documents", [[]])[0]
            if context_docs:
                logger.info(f"RAG: Found {len(context_docs)} relevant context pieces for {current_skill}")
        except Exception as e:
            logger.warning(f"RAG Retrieval failed: {e}")
        
        # 2. Generate AI explanation with context
        explanation = await self._generate_explanation(current_skill, learning_style, difficulty, context_docs)
        
        # 3. Curate external resources
        resources = await self._curate_resources(current_skill, learning_style, difficulty)
        
        return {
            "resources": resources,
            "explanations": [explanation],
            "generated_content": {
                "explanation": explanation,
                "resource_count": len(resources)
            },
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "learning_resource": {
                    "explanation": explanation[:200] + "...",
                    "resource_count": len(resources),
                    "adapted_to": learning_style,
                    "difficulty": difficulty
                }
            },
            "execution_path": [*state.get("execution_path", []), "learning_resource"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Learning: Generated {len(resources)} resources for {current_skill} ({learning_style} style)"
            ]
        }
    
    async def _generate_explanation(self, skill: str, style: str, difficulty: str, context: List[str] = None) -> str:
        """Generate AI-powered explanation adapted to learning style with contextual insights"""
        
        style_instructions = {
            "visual": "Use visual metaphors, diagrams descriptions, and spatial analogies. Describe how things look and relate visually.",
            "auditory": "Use rhythmic patterns, verbal mnemonics, and sound analogies. Make it easy to remember by hearing.",
            "kinesthetic": "Use hands-on examples, physical metaphors, and action-based learning. Focus on doing and experiencing.",
            "reading": "Use detailed text, clear definitions, and comprehensive written examples. Be thorough and structured."
        }
        
        context_str = "\n".join([f"- {c}" for c in context]) if context else "No additional context available."
        
        prompt = f"""
        Explain {skill} to a {difficulty} level learner with {style} learning style.
        
        USE THE FOLLOWING CONTEXTUAL FACTS IF RELEVANT:
        {context_str}
        
        STYLE INSTRUCTIONS:
        {style_instructions.get(style, style_instructions['visual'])}
        
        Provide:
        1. Core Concept (2-3 sentences)
        2. Real-World Analogy (relatable example)
        3. Key Takeaways (3-5 bullet points)
        4. Common Misconceptions to Avoid (2-3 points)
        5. Next Steps (what to learn after this)
        
        Make it engaging, clear, and memorable. Use simple language.
        """
        
        response = await llm_client.ainvoke(prompt)
        return response
    
    async def _curate_resources(self, skill: str, style: str, difficulty: str) -> List[Dict]:
        """Curate external learning resources"""
        
        resources = []
        
        # YouTube videos (for visual/auditory learners)
        if style in ["visual", "auditory"]:
            videos = await self._search_youtube(skill, difficulty)
            resources.extend(videos[:5])
        
        # Generate practice exercises
        exercises = await self._generate_practice_exercises(skill, difficulty)
        resources.extend(exercises)
        
        return resources
    
    async def _search_youtube(self, query: str, difficulty: str) -> List[Dict]:
        """Search YouTube for educational videos"""
        
        search_query = f"{query} tutorial {difficulty} explained"
        url = "https://www.googleapis.com/youtube/v3/search"
        
        params = {
            "part": "snippet",
            "q": search_query,
            "type": "video",
            "videoCategoryId": "27",  # Education
            "maxResults": 10,
            "key": settings.YOUTUBE_API_KEY,
            "order": "relevance"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return [
                            {
                                "title": item["snippet"]["title"],
                                "type": "video",
                                "platform": "YouTube",
                                "url": f"https://youtube.com/watch?v={item['id']['videoId']}",
                                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                                "description": item["snippet"]["description"][:200],
                                "channel": item["snippet"]["channelTitle"]
                            }
                            for item in data.get("items", [])
                        ]
        except Exception as e:
            print(f"YouTube API error: {e}")
        
        return []
    
    async def _generate_practice_exercises(self, skill: str, difficulty: str) -> List[Dict]:
        """Generate practice exercises using AI"""
        
        prompt = f"""
        Create 3 practice exercises for {skill} at {difficulty} level.
        
        For each exercise provide:
        - title: str
        - description: str
        - estimated_time: str (e.g., "15 minutes")
        - difficulty: str
        
        Return JSON array of exercises.
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        exercises = data.get("exercises", [])
        for ex in exercises:
            ex["type"] = "practice"
            ex["platform"] = "AI Generated"
        
        return exercises

learning_resource_agent = LearningResourceAgent()
