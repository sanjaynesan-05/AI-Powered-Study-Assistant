"""
YouTube API utility for AI Study Assistant
"""
import httpx
import logging
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class YouTubeClient:
    """Client for interacting with YouTube Data API v3"""
    
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.base_url = "https://www.googleapis.com/youtube/v3"
        
    async def search_learning_videos(self, topic: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """Search for educational videos on a specific topic"""
        if not self.api_key or self.api_key == "YOUR_YOUTUBE_API_KEY":
            logger.warning("YouTube API key is missing or invalid. Returning empty results.")
            return []
            
        url = f"{self.base_url}/search"
        params = {
            "part": "snippet",
            "q": f"{topic} tutorial OR course OR explanation",
            "type": "video",
            "maxResults": max_results,
            "relevanceLanguage": "en",
            "safeSearch": "moderate",
            "videoCaption": "closedCaption",  # Prefers videos with captions (often educational)
            "key": self.api_key
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                
                if response.status_code == 403:
                    logger.error("YouTube API Quota Exceeded or API Key Invalid (403 Forbidden)")
                    return []
                    
                response.raise_for_status()
                data = response.json()
                
                videos = []
                for item in data.get("items", []):
                    videos.append({
                        "id": item["id"]["videoId"],
                        "title": item["snippet"]["title"],
                        "description": item["snippet"]["description"],
                        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
                        "channel": item["snippet"]["channelTitle"],
                        "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                    })
                    
                return videos
                
        except httpx.HTTPStatusError as e:
            logger.error(f"YouTube API returned HTTP error: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"YouTube API request failed: {str(e)}")
            return []

youtube_client = YouTubeClient()
