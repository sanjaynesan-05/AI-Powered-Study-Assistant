"""
Assessment & Evaluation Agent - Creates adaptive assessments
"""
from app.langgraph.state import AgentState
from app.utils.llm import llm_client
from typing import Dict, List
import uuid

class AssessmentAgent:
    """Creates adaptive quizzes and evaluates performance"""
    
    async def create_quiz(self, state: AgentState) -> Dict:
        """Generate adaptive quiz based on current skill"""
        
        current_skill = state.get("current_skill", "")
        difficulty = state.get("difficulty_preference", "intermediate")
        resources = state.get("resources", [])
        
        prompt = f"""
        Create an adaptive quiz for {current_skill} at {difficulty} level.
        
        Generate 5 questions:
        - 3 Multiple Choice (4 options each)
        - 1 Short Answer
        - 1 Practical/Application question
        
        For each question provide:
        {{
            "question_id": "unique_id",
            "question_text": "the question",
            "question_type": "mcq|short_answer|practical",
            "options": ["A", "B", "C", "D"],  // for MCQ only
            "correct_answer": "answer or index",
            "explanation": "why this is correct",
            "difficulty_weight": 1-5,
            "skills_tested": ["skill1", "skill2"]
        }}
        
        Return JSON with questions array.
        """
        
        response = await llm_client.ainvoke(prompt)
        data = llm_client.parse_json_response(response)
        
        questions = data.get("questions", [])
        
        # Add unique IDs
        for q in questions:
            if "question_id" not in q:
                q["question_id"] = str(uuid.uuid4())
        
        quiz_id = f"quiz_{uuid.uuid4().hex[:8]}"
        
        return {
            "quiz_questions": questions,
            "agent_outputs": {
                **state.get("agent_outputs", {}),
                "assessment": {
                    "quiz_id": quiz_id,
                    "question_count": len(questions),
                    "difficulty": difficulty,
                    "estimated_time": len(questions) * 2,  # 2 min per question
                    "skill": current_skill
                }
            },
            "execution_path": [*state.get("execution_path", []), "assessment"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Assessment: Created {len(questions)} questions for {current_skill}"
            ]
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
