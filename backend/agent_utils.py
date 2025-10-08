import cv2
import numpy as np
from hume import HumeStreamClient
from hume.models.config import FaceConfig
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Hume API key from environment variables
HUME_API_KEY = os.getenv('HUME_API_KEY')

async def analyze_image_for_stress(image_data):
    """
    Analyze an image for stress indicators using Hume AI.
    Returns a dictionary with emotion data and stress level.
    """
    try:
        client = HumeStreamClient(HUME_API_KEY)
        config = FaceConfig()
        
        # Start Hume job
        async with client.connect([config]) as socket:
            result = await socket.send_bytes(image_data)
            predictions = result['face']['predictions']
            
            if not predictions:
                return {'emotion': 'neutral', 'confidence': 0.0, 'stress_level': 0.0}
            
            # Get the first face prediction
            emotions = predictions[0]['emotions']
            
            # Find the strongest emotion
            max_emotion = max(emotions, key=lambda x: x['score'])
            stress_indicators = ['fear', 'anxiety', 'stress', 'worry', 'tension']
            
            # Calculate stress level based on stress-related emotions
            stress_level = sum(emotion['score'] for emotion in emotions 
                             if emotion['name'].lower() in stress_indicators)
            
            return {
                'emotion': max_emotion['name'],
                'confidence': max_emotion['score'],
                'stress_level': stress_level
            }
            
    except Exception as e:
        print(f"Error in analyze_image_for_stress: {str(e)}")
        return {'emotion': 'error', 'confidence': 0.0, 'stress_level': 0.0}

def analyze_emotion_sync(image_data):
    """
    Synchronous wrapper for the async analyze_image_for_stress function.
    """
    return asyncio.run(analyze_image_for_stress(image_data))

def get_stress_category(stress_level):
    """
    Convert numerical stress level to a category.
    """
    if stress_level < 0.2:
        return "Low"
    elif stress_level < 0.5:
        return "Moderate"
    else:
        return "High"