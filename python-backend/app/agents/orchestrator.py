"""
Multi-Agent Orchestrator — The brain of the AI system.

Responsibilities:
1. Classify the user intent (Ollama qwen2.5:3b-instruct)
2. Decide which specialist agents to invoke and in what order
3. Support sequential AND parallel execution patterns
4. Aggregate and return a structured final result

Pipeline types:
  • LEARNING    → MemoryAgent → LearningAgent  → EvaluationAgent
  • CODING      → MemoryAgent → CodingAgent    → EvaluationAgent
  • MENTOR      → MemoryAgent → MentorAgent
  • MOTIVATION  → MemoryAgent → MentorAgent
  • REASONING   → MemoryAgent → LearningAgent
  • CHAT        → LearningAgent (lightweight)
"""
import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import List, Optional

from app.utils.ollama_client import ollama_client
from app.utils.logger import get_logger
from app.utils.metrics import metrics
from app.agents.base import AgentResult
from app.agents.learning_agent import learning_agent
from app.agents.coding_agent import coding_agent
from app.agents.mentor_agent import mentor_agent
from app.agents.evaluation_agent import evaluation_agent
from app.agents.memory_agent import memory_agent

logger = get_logger("app.orchestrator")


CLASSIFIER_MODEL = "qwen2.5:3b-instruct"

INTENT_SYSTEM = (
    "You are a high-speed intent classifier for a multi-agent AI system.\n"
    "Return ONLY one word from: [learning, coding, mentor, motivation, reasoning, chat]\n"
    "Rules:\n"
    "- learning: explanations, concepts, study questions\n"
    "- coding: any code, debugging, programming\n"
    "- mentor: career advice, roadmaps, study strategies, long-term guidance\n"
    "- motivation: discouragement, stress, emotional support\n"
    "- reasoning: logic problems, math, analysis, pros/cons\n"
    "- chat: greetings, small talk\n"
    "Return ONLY the tag. No punctuation."
)

# ------------------------------------------------------------------ #

@dataclass
class PipelineResult:
    """Full structured output from the multi-agent pipeline."""
    intent: str
    agents_used: List[str]
    final_response: str
    context_found: bool
    elapsed_total: float
    agent_details: List[dict] = field(default_factory=list)


# ------------------------------------------------------------------ #

TOPIC_PROMPTS = {

    "Mental Wellness": """SYSTEM OVERRIDE:
You are a licensed mental health counselor and academic wellness coach specializing in student well-being.

Your responsibilities:
- Provide empathetic, non-judgmental support
- Help manage stress, anxiety, burnout, and academic pressure
- Suggest practical coping strategies (breathing, time management, mindset shifts)
- Encourage healthy habits (sleep, breaks, digital detox)
- Promote balance between academic and personal life

Response Guidelines:
- Be calm, supportive, and reassuring
- Avoid clinical diagnosis
- Use simple, comforting language
- Provide actionable steps (not just theory)

Output Format:
1. Understanding the issue
2. Practical suggestions
3. Encouraging closing note
""",

    "Career Guidance": """SYSTEM OVERRIDE:
You are an elite tech career strategist and industry mentor.

Your responsibilities:
- Provide step-by-step career roadmaps
- Guide on resume building, portfolio creation, and LinkedIn optimization
- Suggest in-demand skills based on industry trends
- Provide interview preparation strategies (HR + technical)
- Recommend real-world projects and certifications

Response Guidelines:
- Be practical and actionable
- Focus on current industry standards
- Avoid generic advice

Output Format:
1. Current situation analysis
2. Career roadmap (step-by-step)
3. Skills to focus
4. Resources/tools
5. Next immediate actions
""",

    "GenAI": """SYSTEM OVERRIDE:
You are a senior AI architect specializing in Generative AI systems.

Your responsibilities:
- Explain LLMs, transformers, embeddings, RAG pipelines
- Provide prompt engineering techniques
- Suggest architectures for GenAI apps
- Cover tools like OpenAI, LangChain, vector DBs, Ollama
- Optimize performance and cost

Response Guidelines:
- Be technical but clear
- Use real-world architecture examples
- Include best practices

Output Format:
1. Concept explanation
2. Architecture/design
3. Tools & stack
4. Optimization tips
""",

    "Data Information Security": """SYSTEM OVERRIDE:
You are a Principal Cybersecurity Engineer.

Your responsibilities:
- Provide security-first recommendations
- Cover encryption, authentication, zero-trust, IAM
- Identify vulnerabilities and mitigation strategies
- Suggest secure coding practices

Response Guidelines:
- Be strict and precise
- Highlight risks clearly
- Always include best practices

Output Format:
1. Risk analysis
2. Recommended solution
3. Tools/technologies
4. Security best practices
""",

    "Cloud Computing Analysis": """SYSTEM OVERRIDE:
You are a Senior Cloud Solutions Architect and DevOps expert.

Your responsibilities:
- Design scalable cloud architectures (AWS, Azure, GCP)
- Optimize cost and performance
- Suggest deployment strategies (Docker, Kubernetes, serverless)
- Handle monitoring, CI/CD, and reliability

Response Guidelines:
- Be architecture-focused
- Provide diagrams (text-based if needed)
- Suggest real services (e.g., AWS Lambda, EC2)

Output Format:
1. Architecture overview
2. Service selection
3. Deployment strategy
4. Cost optimization
""",

    "Brain Computer Interface": """SYSTEM OVERRIDE:
You are a Neuroscience researcher specializing in Brain-Computer Interfaces (BCI).

Your responsibilities:
- Explain EEG signal processing and neural decoding
- Discuss real-world BCI systems and applications
- Cover hardware + software integration
- Provide insights into future developments

Response Guidelines:
- Be scientific but understandable
- Avoid speculation without basis
- Use examples

Output Format:
1. Concept explanation
2. Technical components
3. Applications
4. Future scope
""",

    "MLOps": """SYSTEM OVERRIDE:
You are a Head of MLOps and production ML systems expert.

Your responsibilities:
- Design ML pipelines (training → deployment → monitoring)
- Handle model versioning, CI/CD, and scaling
- Suggest tools (MLflow, Kubeflow, Docker, Airflow)
- Ensure reliability and performance

Response Guidelines:
- Focus on production systems
- Include real workflows
- Avoid theoretical ML

Output Format:
1. Pipeline design
2. Tools & stack
3. Deployment strategy
4. Monitoring & scaling
""",

    "Robotic Process Automation (RPA)": """SYSTEM OVERRIDE:
You are a Senior RPA Developer and automation architect.

Your responsibilities:
- Design automation workflows
- Suggest tools like UiPath, Automation Anywhere
- Optimize business processes
- Reduce manual effort and errors

Response Guidelines:
- Focus on practical automation
- Provide workflow steps
- Include real use cases

Output Format:
1. Problem breakdown
2. Automation workflow
3. Tools/platforms
4. Optimization tips
"""
}

class MultiAgentOrchestrator:
    """
    Coordinates agent selection, execution, and response aggregation.
    """

    async def classify_intent(self, prompt: str) -> str:
        """Use qwen2.5:3b-instruct to classify the user's intent."""
        try:
            result = await ollama_client.generate(
                prompt=f"Classify: '{prompt}'",
                model=CLASSIFIER_MODEL,
                system=INTENT_SYSTEM,
                temperature=0.0,
            )
            intent = result.lower().strip().rstrip(".").strip("[]")
            valid = {"learning", "coding", "mentor", "motivation", "reasoning", "chat"}
            return intent if intent in valid else "learning"
        except Exception as e:
            logger.error(f"[Orchestrator] Classification failed: {e}")
            return "learning"

    def _record_agent_result(self, result: AgentResult) -> None:
        """Push an agent's result into the MetricsStore."""
        metrics.record_agent(
            agent_name=result.agent_name,
            duration_ms=result.elapsed * 1000,
            success=result.success,
        )
        metrics.record_model_call(
            model=result.model_used,
            duration_ms=result.elapsed * 1000,
        )

    async def _run_pipeline(
        self,
        intent: str,
        prompt: str,
        context: str,
    ) -> tuple[List[AgentResult], str]:
        """
        Execute the correct agent pipeline for the detected intent.
        Returns (agent_results, final_answer).
        """
        # Build context-enriched prompt if memory found something
        enriched = f"{context}\n\nUser Request: {prompt}" if context else prompt

        # Check if the user selected a special topic (e.g., "Context: GenAI\n\nQuestion: ...")
        # Extract the topic from the prompt string if present
        if "Context: " in prompt and "\n\nQuestion:" in prompt:
            try:
                extracted_topic = prompt.split("Context: ")[1].split("\n\nQuestion:")[0].strip()
                if extracted_topic in TOPIC_PROMPTS:
                    # Inject the specialized System Prompt directly into the working prompt
                    enriched = TOPIC_PROMPTS[extracted_topic] + enriched
            except IndexError:
                pass

        # ── CODING pipeline ─────────────────────────────────────────────────
        if intent == "coding":
            draft_result = await coding_agent.run(enriched)
            self._record_agent_result(draft_result)

            if draft_result.success:
                eval_result = await evaluation_agent.run(
                    original_prompt=prompt,
                    draft_response=draft_result.output,
                )
                self._record_agent_result(eval_result)
                final = eval_result.output if eval_result.success else draft_result.output
                return [draft_result, eval_result], final

            return [draft_result], draft_result.output or "Code generation failed."

        # ── MENTOR / MOTIVATION pipeline ────────────────────────────────────
        if intent in ("mentor", "motivation"):
            result = await mentor_agent.run(enriched)
            self._record_agent_result(result)
            return [result], result.output or "Could not generate mentoring response."

        # ── LEARNING / REASONING pipeline ───────────────────────────────────
        if intent in ("learning", "reasoning"):
            draft_result = await learning_agent.run(enriched)
            self._record_agent_result(draft_result)

            if draft_result.success:
                eval_result = await evaluation_agent.run(
                    original_prompt=prompt,
                    draft_response=draft_result.output,
                )
                self._record_agent_result(eval_result)
                final = eval_result.output if eval_result.success else draft_result.output
                return [draft_result, eval_result], final

            return [draft_result], draft_result.output or "Learning response failed."

        # ── CHAT / fallback ─────────────────────────────────────────────────
        result = await learning_agent.run(prompt)
        self._record_agent_result(result)
        return [result], result.output or "I'm here to help! Could you tell me more?"

    async def run(self, prompt: str) -> PipelineResult:
        """
        Full pipeline:
          1. Classify intent
          2. Retrieve memory context (parallel with classification when possible)
          3. Route to correct agent pipeline
          4. Store interaction in memory
          5. Return structured PipelineResult
        """
        pipeline_start = time.perf_counter()

        # 1+2. Classify intent and retrieve memory CONCURRENTLY
        intent_task = asyncio.create_task(self.classify_intent(prompt))
        memory_task = asyncio.create_task(memory_agent.retrieve_context(prompt))

        intent, context = await asyncio.gather(intent_task, memory_task)
        logger.info(f"[Orchestrator] Intent={intent} | Context={'found' if context else 'none'}")

        # 3. Execute the correct pipeline
        agent_results, final_response = await self._run_pipeline(intent, prompt, context)

        elapsed = time.perf_counter() - pipeline_start

        # 4. Store interaction in background (do not await)
        asyncio.create_task(
            memory_agent.store_interaction(prompt=prompt, response=final_response)
        )

        # 5. Build structured result
        return PipelineResult(
            intent=intent,
            agents_used=[r.agent_name for r in agent_results],
            final_response=final_response,
            context_found=bool(context),
            elapsed_total=round(elapsed, 2),
            agent_details=[r.to_dict() for r in agent_results],
        )

    # ------------------------------------------------------------------ #
    #  Legacy LangGraph compatibility shims                               #
    #  The old graph.py references these method names.                    #
    # ------------------------------------------------------------------ #

    async def detect_intent(self, state: dict) -> dict:
        """LangGraph-compatible shim: classify intent from AgentState."""
        user_input = state.get("user_input", "")
        intent = await self.classify_intent(user_input)
        return {
            "intent": intent,
            "current_skill": state.get("current_skill", "General Studies"),
            "target_skill": state.get("target_skill", "General Studies"),
            "execution_path": [*state.get("execution_path", []), "intent_detection"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                f"Intent detected: {intent}",
            ],
            "confidence_scores": {"intent_detection": 0.85},
        }

    async def analyze_emotion(self, state: dict) -> dict:
        """LangGraph-compatible shim: simple emotion analysis."""
        return {
            "emotional_tone": "neutral",
            "execution_path": [*state.get("execution_path", []), "emotion_analysis"],
            "reasoning_chain": [
                *state.get("reasoning_chain", []),
                "Emotion: neutral (default shim)",
            ],
        }


# Singleton
orchestrator = MultiAgentOrchestrator()
