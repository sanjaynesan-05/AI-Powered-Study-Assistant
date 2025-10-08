import os
import json
import sys
import base64
from PIL import Image
import io
from hume import HumeBatchClient
from hume.models.config import BurstConfig, FacemeshConfig

def analyze_single_image(image_path):
    try:
        # Load the image
        with open(image_path, 'rb') as f:
            image_bytes = f.read()

        # Initialize Hume client
        hume_api_key = os.getenv("HUME_API_KEY")
        if not hume_api_key:
            raise Exception("HUME_API_KEY not found in environment")

        client = HumeBatchClient(hume_api_key)
        
        # Create configs
        configs = [BurstConfig(), FacemeshConfig()]

        # Convert image to base64
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        urls = [f"data:image/jpeg;base64,{image_b64}"]

        # Submit job
        job = client.submit_job(urls, configs)
        job.await_complete()
        
        # Get predictions
        predictions = job.get_predictions()
        
        # Mock response for testing
        result = {
            "emotion": "focused",
            "confidence": 0.85,
            "stressLevel": 35.0,
            "category": "Low Stress",
            "mockData": True
        }
        
        print(json.dumps(result))
        return 0
    except Exception as e:
        error_result = {
            "error": str(e),
            "emotion": "neutral",
            "confidence": 0.5,
            "stressLevel": 50.0,
            "category": "Moderate Stress",
            "mockData": True
        }
        print(json.dumps(error_result))
        return 1

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze a single image for emotions')
    parser.add_argument('--image', type=str, required=True, help='Path to image file')
    
    args = parser.parse_args()
    sys.exit(analyze_single_image(args.image))