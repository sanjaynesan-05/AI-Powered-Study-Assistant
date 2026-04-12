"""
Model Router - Smartly selects the best Ollama model based on user input task classification.
"""
import logging
from typing import Dict, Tuple
from app.utils.ollama_client import ollama_client

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
#  Model Configuration Mapping                                        #
# ------------------------------------------------------------------ #

# Mapping tasks to the fastest suited models for CPU
MODEL_MAP = {
    "chat": "llama3.2:3b",
    "motivation": "llama3.2:3b",
    "coding": "qwen2.5-coder:7b",
    "learning": "llama3.2:3b",
    "reasoning": "qwen2.5:3b-instruct",
    "mentor": "llama3.2:3b",
}

# The model used for classification itself
CLASSIFIER_MODEL = "qwen2.5:3b-instruct"

# ------------------------------------------------------------------ #
#  Smart Router Logic                                                  #
# ------------------------------------------------------------------ #

async def classify_task(prompt: str) -> str:
    """
    Classify the incoming prompt into a specific task category.
    Returns: One of [chat, motivation, coding, reasoning, learning, mentor].
    """
    # ... (system_prompt remains the same)
    system_prompt = (
        "You are a high-speed request classifier for an AI Study Assistant system. "
        "Your job is to categorize the user's input into exactly ONE of the following tags: "
        "[chat, motivation, coding, reasoning, learning, mentor].\n\n"
        "Rules:\n"
        "1. Return ONLY the one-word tag.\n"
        "2. No punctuation, no explanation, no apology.\n"
        "3. If unsure, return 'learning'.\n\n"
        "Tags Guide:\n"
        "- 'motivation': Discouraged, seeking help, stress, emotions.\n"
        "- 'coding': Code snippets, technical bugs, software engineering.\n"
        "- 'learning': General explanations, study material, facts.\n"
        "- 'reasoning': Complex logic, math, analysis.\n"
        "- 'mentor': Career advice, study strategies, guidance.\n"
        "- 'chat': Greeting, small talk, general conversation."
    )

    try:
        logger.info(f"[Router] Classifying prompt with {CLASSIFIER_MODEL}...")
        category = await ollama_client.generate(
            prompt=f"Category for: '{prompt}'",
            model=CLASSIFIER_MODEL,
            system=system_prompt,
            temperature=0.0
        )
        
        # Clean up the output to be safe
        category = category.lower().strip().replace(".", "").replace("[", "").replace("]", "")
        
        if category not in MODEL_MAP:
            logger.warning(f"[Router] Classifier returned unknown tag: '{category}'. Falling back to 'learning'.")
            return "learning"
            
        return category

    except Exception as e:
        logger.error(f"[Router] Classification failed: {str(e)}")
        return "learning"

def select_model(task: str) -> str:
    """Select the model based on the classified task."""
    return MODEL_MAP.get(task, "llama3.2:3b")

async def get_routed_response(prompt: str) -> Dict[str, str]:
    """
    Entry point: Detects task, selects model, and generates response.
    Returns: dict with [task, model_used, response]
    """
    if not prompt.strip():
        return {
            "task": "error",
            "model_used": "none",
            "response": "Prompt cannot be empty."
        }

    # 1. Detect Task (Classify ONLY the core prompt part if it's augmented, 
    # but for simplicity we classify the whole thing)
    task = await classify_task(prompt=prompt)
    
    # 2. Select Model
    model_used = select_model(task=task)
    
    logger.info(f"[Router] Routing to {model_used} for task={task}")

    # 3. Generate Response
    try:
        response = await ollama_client.generate(
            prompt=prompt,
            model=model_used
        )
        
        return {
            "task": task,
            "model_used": model_used,
            "response": response
        }
    except Exception as e:
        import traceback
        logger.error(f"[Router] Routed generation failed: {str(e)}\n{traceback.format_exc()}")
        return {
            "task": task,
            "model_used": model_used,
            "response": f"Failed to generate response: {str(e)}"
        }
