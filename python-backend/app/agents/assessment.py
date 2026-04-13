"""
Assessment & Evaluation Agent - Creates adaptive assessments
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict, List
import uuid

class AssessmentAgent:
    """Creates adaptive quizzes and evaluates performance"""
    
    async def generate(self, state: Dict) -> Dict:
        """Bridge method for orchestrator to generate a quiz"""
        # Convert simple dict state to AgentState if needed, or just extract values
        current_skill = state.get("current_skill", "")
        difficulty = state.get("difficulty_preference", "intermediate")
        count = state.get("question_count", 15)
        
        # Call create_quiz logic or implement directly
        return await self.create_quiz({
            "current_skill": current_skill,
            "difficulty_preference": difficulty,
            "question_count": count
        })

    async def create_quiz(self, state: Dict) -> Dict:
        """Generate MCQ quiz based on current skill and count"""
        
        current_skill = state.get("current_skill", "")
        difficulty = state.get("difficulty_preference", "intermediate")
        count = state.get("question_count", 15)
        
        prompt = f"""
        Generate a {count}-question Multiple Choice quiz on {current_skill} ({difficulty} level).
        
        OUTPUT FORMAT:
        Return ONLY valid JSON with this exact structure:
        {{
            "questions": [
                {{
                    "id": "q1",
                    "text": "The question...",
                    "options": [
                        {{ "id": "o1", "text": "Option 1", "isCorrect": true }},
                        {{ "id": "o2", "text": "Option 2", "isCorrect": false }},
                        {{ "id": "o3", "text": "Option 3", "isCorrect": false }},
                        {{ "id": "o4", "text": "Option 4", "isCorrect": false }}
                    ]
                }}
            ]
        }}
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        # Ensure 'questions' key exists and is a list
        if not isinstance(data, dict) or "questions" not in data:
            # Emergency return structure if LLM fails
            data = {"questions": []}
            
        questions = data.get("questions", [])
        
        # Sanity check: ensure question count is what we requested
        # If the LLM under-delivers, we accept what we got, but we've asked for 'count'
        
        quiz_id = f"quiz_{uuid.uuid4().hex[:8]}"
        
        return {
            "questions": questions,
            "quiz_id": quiz_id,
            "status": "success",
            "topic": current_skill
        }
    
    async def evaluate_answers(self, state: AgentState) -> Dict:
        """Evaluate user answers and detect misconceptions"""
        
        questions = state.get("quiz_questions", [])
        user_answers = state.get("user_answers", [])
        
        if not user_answers:
            return state
        
        prompt = f"""
        Evaluate quiz performance:
        
        Questions: {len(questions)}
        User Answers: {len(user_answers)}
        
        Questions and Answers:
        {self._format_qa_pairs(questions, user_answers)}
        
        Analyze:
        1. Calculate score (0.0 - 1.0)
        2. Identify misconceptions from wrong answers
        3. Determine strong areas
        4. Recommend focus areas
        5. Suggest difficulty adjustment
        
        Return JSON:
        {{
            "performance_score": 0.0-1.0,
            "misconceptions": ["misconception1", ...],
            "strong_areas": ["area1", ...],
            "weak_areas": ["area1", ...],
            "improvement_recommendations": ["rec1", ...],
            "suggested_difficulty": "easier|same|harder"
        }}
        """
        
        response = await llm_client.ainvoke(prompt)
        evaluation = llm_client.parse_json_response(response)
        
        return {
            "performance_score": evaluation.get("performance_score", 0.5),
            "misconceptions": evaluation.get("misconceptions", []),
            "strong_areas": evaluation.get("strong_areas", []),
            "weak_areas": evaluation.get("weak_areas", []),
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "evaluation": evaluation
            },
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Evaluation: Score {evaluation.get('performance_score', 0.5):.2f}"
            ]
        }
    
    def _format_qa_pairs(self, questions: List[Dict], answers: List[Dict]) -> str:
        """Format Q&A pairs for evaluation"""
        formatted = []
        for i, (q, a) in enumerate(zip(questions, answers)):
            formatted.append(f"Q{i+1}: {q.get('question_text', '')}")
            formatted.append(f"User Answer: {a.get('answer', 'No answer')}")
            formatted.append(f"Correct: {q.get('correct_answer', '')}")
            formatted.append("")
        return "\n".join(formatted)

assessment_agent = AssessmentAgent()
