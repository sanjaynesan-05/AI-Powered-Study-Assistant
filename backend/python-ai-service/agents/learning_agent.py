"""Learning Resource Agent - AI-powered smart resource discovery with real URL validation."""
import json
import os
import asyncio
import aiohttp
import requests
from typing import Dict, List, Any
import google.generativeai as genai
from urllib.parse import urljoin, quote
import re

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False

class SmartLearningResourceAgent:
    """AI-powered agent for discovering and validating high-quality learning resources."""
    
    def __init__(self, gemini_api_key: str):
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.youtube_api_key = os.getenv("GOOGLE_API_KEY")
        self.google_books_api_key = self.youtube_api_key
        
        # Initialize session for HTTP requests with better headers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        if GOOGLE_API_AVAILABLE and self.youtube_api_key:
            try:
                self.youtube_service = build('youtube', 'v3', developerKey=self.youtube_api_key)
                self.books_service = build('books', 'v1', developerKey=self.google_books_api_key)
            except Exception as e:
                print(f"Failed to initialize Google APIs: {e}")
                self.youtube_service = None
                self.books_service = None
        else:
            self.youtube_service = None
            self.books_service = None

    async def smart_resource_discovery(self, topic: str, difficulty: str = "intermediate") -> Dict[str, Any]:
        """AI-powered smart resource discovery with URL validation."""
        print(f"🔍 Starting smart resource discovery for: {topic} (Level: {difficulty})")
        
        # Step 1: AI generates curated resource suggestions
        ai_resources = await self._ai_curated_resources(topic, difficulty)
        
        # Step 2: Validate and enhance resources
        validated_resources = await self._validate_and_enhance_resources(ai_resources, topic)
        
        # Step 3: Get additional platform-specific resources
        platform_resources = await self._get_platform_specific_resources(topic, difficulty)
        
        # Combine and rank all resources
        all_resources = validated_resources + platform_resources
        ranked_resources = self._rank_resources(all_resources, topic, difficulty)
        
        return {
            "resources": ranked_resources[:6],  # Top 6 resources
            "difficulty": difficulty,
            "estimated_time": self._calculate_study_time(ranked_resources[:6]),
            "quality_score": self._calculate_quality_score(ranked_resources[:6]),
            "learning_path_suggested": True
        }

    async def _ai_curated_resources(self, topic: str, difficulty: str) -> List[Dict[str, Any]]:
        """Use AI to generate curated, high-quality resource recommendations."""
        try:
            prompt = f"""As an expert educator and learning resource curator, recommend the BEST 5-6 high-quality learning resources for: "{topic}" at {difficulty} level.

IMPORTANT GUIDELINES:
1. Only suggest resources from these TRUSTED platforms:
   - Official documentation sites
   - GeeksforGeeks (use working URL patterns)
   - MDN Web Docs (for web technologies)
   - Real Python (for Python topics)
   - W3Schools (for web development)
   - Coursera/edX (for courses)
   - YouTube (educational channels only)
   - Stack Overflow (for Q&A)
   - GitHub (for code examples)

2. For GeeksforGeeks, use these PROVEN URL patterns:
   - https://www.geeksforgeeks.org/python-tutorial/
   - https://www.geeksforgeeks.org/data-structures/
   - https://www.geeksforgeeks.org/algorithms/
   - https://www.geeksforgeeks.org/machine-learning/
   - https://www.geeksforgeeks.org/artificial-intelligence/

3. Ensure URLs are:
   - Actually accessible and working
   - From reputable educational sources
   - Appropriate for the difficulty level
   - Cover the topic comprehensively

Return JSON array with:
- title: Descriptive, accurate title
- platform: Source platform name
- type: "tutorial", "documentation", "course", "article", "video"
- url: WORKING, accessible URL
- description: What learner will gain (2-3 sentences)
- difficulty_match: How well it matches requested difficulty (1-10)
- quality_rating: Educational quality rating (1-10)

Topic: {topic}
Difficulty: {difficulty}

Return ONLY the JSON array."""

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Lower temperature for more reliable URLs
                    max_output_tokens=1200
                )
            )
            
            content = response.text.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            
            resources = json.loads(content.strip())
            
            # Validate the AI response structure
            validated = []
            for resource in resources:
                if all(key in resource for key in ['title', 'platform', 'type', 'url', 'description']):
                    resource['source'] = 'ai_curated'
                    resource['quality_rating'] = resource.get('quality_rating', 8)
                    resource['difficulty_match'] = resource.get('difficulty_match', 8)
                    validated.append(resource)
            
            return validated
            
        except Exception as e:
            print(f"AI resource curation error: {e}")
            return await self._fallback_quality_resources(topic, difficulty)

    async def _validate_and_enhance_resources(self, resources: List[Dict], topic: str) -> List[Dict]:
        """Validate URLs and enhance resource information."""
        validated = []
        
        for resource in resources:
            try:
                # Quick URL validation
                url = resource.get('url', '')
                if await self._validate_url(url):
                    resource['url_status'] = 'accessible'
                    resource['verified'] = True
                else:
                    # Try to fix common URL issues
                    fixed_url = await self._fix_url(url, resource.get('platform', ''), topic)
                    if fixed_url and await self._validate_url(fixed_url):
                        resource['url'] = fixed_url
                        resource['url_status'] = 'fixed_and_accessible'
                        resource['verified'] = True
                    else:
                        resource['url_status'] = 'inaccessible'
                        resource['verified'] = False
                        continue  # Skip inaccessible resources
                
                validated.append(resource)
                
            except Exception as e:
                print(f"Resource validation error for {resource.get('url', 'unknown')}: {e}")
                continue
        
        return validated

    async def _validate_url(self, url: str) -> bool:
        """Quickly validate if a URL is accessible."""
        if not url or not url.startswith('http'):
            return False
        
        try:
            # Use a quick HEAD request to check accessibility
            response = self.session.head(url, timeout=5, allow_redirects=True)
            return response.status_code < 400
        except:
            try:
                # Fallback to GET request with small timeout
                response = self.session.get(url, timeout=3, stream=True)
                return response.status_code < 400
            except:
                return False

    async def _fix_url(self, url: str, platform: str, topic: str) -> str:
        """Attempt to fix broken URLs using platform-specific patterns."""
        if not url:
            return ""
        
        # GeeksforGeeks URL fixes
        if 'geeksforgeeks' in platform.lower():
            topic_slug = self._create_url_slug(topic)
            
            # Common GeeksforGeeks patterns that actually work
            working_patterns = [
                f"https://www.geeksforgeeks.org/{topic_slug}/",
                f"https://www.geeksforgeeks.org/{topic_slug}-tutorial/",
                f"https://www.geeksforgeeks.org/{topic_slug}-in-python/",
                f"https://www.geeksforgeeks.org/introduction-to-{topic_slug}/",
            ]
            
            for pattern in working_patterns:
                if await self._validate_url(pattern):
                    return pattern
        
        # W3Schools URL fixes
        elif 'w3schools' in platform.lower():
            topic_slug = self._create_url_slug(topic)
            w3_patterns = [
                f"https://www.w3schools.com/{topic_slug}/",
                f"https://www.w3schools.com/{topic_slug}/default.asp",
            ]
            
            for pattern in w3_patterns:
                if await self._validate_url(pattern):
                    return pattern
        
        return ""

    async def _get_platform_specific_resources(self, topic: str, difficulty: str) -> List[Dict]:
        """Get resources from specific platforms using their APIs or known patterns."""
        resources = []
        
        # YouTube resources (if API available)
        if self.youtube_service:
            youtube_resources = await self._get_verified_youtube_resources(topic)
            resources.extend(youtube_resources)
        
        # Add more platform-specific resource gathering here
        # Official documentation resources
        doc_resources = await self._get_official_documentation(topic)
        resources.extend(doc_resources)
        
        return resources

    async def _get_verified_youtube_resources(self, topic: str) -> List[Dict]:
        """Get verified educational YouTube resources."""
        try:
            # Focus on educational channels with high-quality content
            educational_channels = [
                "freeCodeCamp.org",
                "Traversy Media", 
                "The Net Ninja",
                "Programming with Mosh",
                "Corey Schafer",
                "Tech With Tim"
            ]
            
            search_query = f"{topic} tutorial"
            request = self.youtube_service.search().list(
                part="snippet",
                q=search_query,
                type="video",
                order="relevance",
                maxResults=10,
                videoCategoryId="27"  # Education category
            )
            response = request.execute()
            
            verified_videos = []
            for item in response.get("items", []):
                channel_title = item["snippet"]["channelTitle"]
                
                # Prioritize known educational channels
                quality_score = 8 if any(edu_channel.lower() in channel_title.lower() 
                                       for edu_channel in educational_channels) else 6
                
                video_id = item["id"]["videoId"]
                verified_videos.append({
                    "title": item["snippet"]["title"],
                    "platform": "YouTube",
                    "type": "video",
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "description": item["snippet"]["description"][:200] + "...",
                    "channel": channel_title,
                    "quality_rating": quality_score,
                    "verified": True,
                    "source": "youtube_api"
                })
            
            return verified_videos[:3]  # Top 3 videos
            
        except Exception as e:
            print(f"YouTube resource error: {e}")
            return []

    async def _get_official_documentation(self, topic: str) -> List[Dict]:
        """Get official documentation resources for the topic."""
        doc_resources = []
        topic_lower = topic.lower()
        
        # Python documentation
        if 'python' in topic_lower:
            doc_resources.append({
                "title": "Official Python Documentation",
                "platform": "Python.org",
                "type": "documentation",
                "url": "https://docs.python.org/3/",
                "description": "Comprehensive official Python documentation with tutorials, library reference, and language reference.",
                "quality_rating": 10,
                "verified": True,
                "source": "official_docs"
            })
        
        # JavaScript documentation
        if any(js_term in topic_lower for js_term in ['javascript', 'js', 'web development']):
            doc_resources.append({
                "title": "MDN Web Docs - JavaScript",
                "platform": "MDN Web Docs",
                "type": "documentation", 
                "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                "description": "Mozilla's comprehensive JavaScript documentation with tutorials, references, and best practices.",
                "quality_rating": 10,
                "verified": True,
                "source": "official_docs"
            })
        
        return doc_resources

    def _create_url_slug(self, topic: str) -> str:
        """Create a URL-friendly slug from topic."""
        slug = topic.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)  # Remove special characters
        slug = re.sub(r'[-\s]+', '-', slug)   # Replace spaces and multiple hyphens
        slug = slug.strip('-')                # Remove leading/trailing hyphens
        
        # Handle common topic transformations
        replacements = {
            'machine-learning': 'machine-learning',
            'artificial-intelligence': 'artificial-intelligence', 
            'data-science': 'data-science',
            'web-development': 'web-development',
            'programming': 'programming-language'
        }
        
        return replacements.get(slug, slug)

    def _rank_resources(self, resources: List[Dict], topic: str, difficulty: str) -> List[Dict]:
        """Rank resources by quality, relevance, and accessibility."""
        for resource in resources:
            score = 0
            
            # Base quality rating
            score += resource.get('quality_rating', 5) * 2
            
            # Verification bonus
            if resource.get('verified', False):
                score += 5
            
            # Platform reputation bonus
            platform = resource.get('platform', '').lower()
            if any(trusted in platform for trusted in ['official', 'mdn', 'python.org', 'docs']):
                score += 8
            elif any(good in platform for good in ['geeksforgeeks', 'w3schools', 'real python']):
                score += 6
            elif 'youtube' in platform and resource.get('quality_rating', 0) >= 7:
                score += 5
            
            # Difficulty match bonus
            score += resource.get('difficulty_match', 5)
            
            # Type preference (tutorials and documentation score higher)
            resource_type = resource.get('type', '').lower()
            if resource_type in ['tutorial', 'documentation']:
                score += 3
            elif resource_type == 'course':
                score += 2
            
            resource['final_score'] = score
        
        # Sort by final score (descending)
        return sorted(resources, key=lambda x: x.get('final_score', 0), reverse=True)

    def _calculate_study_time(self, resources: List[Dict]) -> str:
        """Calculate estimated study time based on resource types."""
        total_minutes = 0
        
        for resource in resources:
            resource_type = resource.get('type', '').lower()
            if resource_type == 'video':
                total_minutes += 45  # Average educational video
            elif resource_type == 'tutorial':
                total_minutes += 90  # Hands-on tutorial
            elif resource_type == 'documentation':
                total_minutes += 60  # Reading documentation
            elif resource_type == 'course':
                total_minutes += 180  # Course section
            else:
                total_minutes += 30  # Article/other
        
        hours = total_minutes // 60
        minutes = total_minutes % 60
        
        if hours == 0:
            return f"{minutes} minutes"
        elif minutes == 0:
            return f"{hours} hours"
        else:
            return f"{hours}h {minutes}m"

    def _calculate_quality_score(self, resources: List[Dict]) -> float:
        """Calculate overall quality score for the resource set."""
        if not resources:
            return 0.0
        
        total_score = sum(resource.get('quality_rating', 5) for resource in resources)
        avg_score = total_score / len(resources)
        
        # Bonus for verified resources
        verified_count = sum(1 for r in resources if r.get('verified', False))
        verification_bonus = (verified_count / len(resources)) * 2
        
        return min(10.0, avg_score + verification_bonus)

    async def _fallback_quality_resources(self, topic: str, difficulty: str) -> List[Dict]:
        """Fallback high-quality resources when AI generation fails."""
        fallback_resources = []
        topic_lower = topic.lower()
        
        # Python fallbacks
        if 'python' in topic_lower:
            fallback_resources.extend([
                {
                    "title": "Python Tutorial - Real Python",
                    "platform": "Real Python",
                    "type": "tutorial",
                    "url": "https://realpython.com/",
                    "description": "High-quality Python tutorials for all skill levels",
                    "quality_rating": 9,
                    "verified": True
                },
                {
                    "title": "Python Programming - GeeksforGeeks",
                    "platform": "GeeksforGeeks", 
                    "type": "tutorial",
                    "url": "https://www.geeksforgeeks.org/python-programming-language/",
                    "description": "Comprehensive Python programming guide with examples",
                    "quality_rating": 8,
                    "verified": True
                }
            ])
        
        # Web development fallbacks
        if any(web_term in topic_lower for web_term in ['javascript', 'html', 'css', 'web']):
            fallback_resources.extend([
                {
                    "title": "MDN Web Docs",
                    "platform": "MDN Web Docs",
                    "type": "documentation",
                    "url": "https://developer.mozilla.org/",
                    "description": "Mozilla's comprehensive web development documentation",
                    "quality_rating": 10,
                    "verified": True
                },
                {
                    "title": "W3Schools Tutorial",
                    "platform": "W3Schools",
                    "type": "tutorial", 
                    "url": "https://www.w3schools.com/",
                    "description": "Interactive web development tutorials and references",
                    "quality_rating": 8,
                    "verified": True
                }
            ])
        
        return fallback_resources

# Create an alias for backward compatibility
class LearningResourceAgent(SmartLearningResourceAgent):
    """Backward compatibility alias."""
    
    def search_resources(self, topic: str, pdf_content: str = None) -> Dict[str, Any]:
        """Search for learning resources (synchronous wrapper)."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(asyncio.run, self.smart_resource_discovery(topic))
                    return future.result()
            else:
                return loop.run_until_complete(self.smart_resource_discovery(topic))
        except Exception as e:
            print(f"Resource search error: {e}")
            return self._get_mock_resources(topic)
    
    def _get_mock_resources(self, topic: str) -> Dict[str, Any]:
        """Provide mock resources as fallback."""
        return {
            "resources": [
                {
                    "title": f"Learn {topic} - Complete Guide",
                    "platform": "Educational Platform",
                    "type": "tutorial",
                    "url": f"https://example.com/learn-{topic.lower().replace(' ', '-')}",
                    "description": f"Comprehensive tutorial covering all aspects of {topic}",
                    "quality_rating": 7,
                    "verified": False
                }
            ],
            "difficulty": "intermediate",
            "estimated_time": "2-3 hours",
            "quality_score": 7.0
        }

    async def _search_google_books(self, topic: str) -> List[Dict[str, Any]]:
        """Search for educational books."""
        if not self.books_service:
            return []
        try:
            query = f"{topic} programming computer science textbook"
            request = self.books_service.volumes().list(
                q=query,
                orderBy="relevance",
                maxResults=2
            )
            response = request.execute()
            books = []
            for item in response.get("items", []):
                volume_info = item["volumeInfo"]
                buy_link = volume_info.get("canonicalVolumeLink", "")
                if not buy_link and volume_info.get("industryIdentifiers"):
                    buy_link = f"https://books.google.com/books/about/{'_'.join(volume_info['title'].split())}.html"
                books.append({
                    "title": volume_info["title"],
                    "platform": "Google Books",
                    "type": "book",
                    "url": buy_link,
                    "description": volume_info.get("description", "Educational textbook")[:200] + "..." if volume_info.get("description") and len(volume_info["description"]) > 200 else volume_info.get("description", "Educational textbook"),
                    "authors": volume_info.get("authors", ["Unknown"])
                })
            return books
        except HttpError as e:
            print(f"Google Books API error: {e}")
            return []
        except Exception as e:
            print(f"Google Books search error: {e}")
            return []
    async def _get_geeksforgeeks_resources(self, topic: str) -> List[Dict[str, Any]]:
        """Get GeeksforGeeks-style article recommendations."""
        try:
            prompt = f"""You are a learning resource expert. Create 3 realistic GeeksforGeeks article recommendations for the topic: {topic}.
Requirements:
- Use actual GeeksforGeeks URL patterns that would exist
- Create titles that match GeeksforGeeks style
- Include interview questions, tutorials, and guides
- Make URLs realistic and clickable
Return a JSON array with objects containing:
- title: Realistic GeeksforGeeks-style title
- platform: "GeeksforGeeks"
- type: "article"
- url: Working GeeksforGeeks URL pattern (start with https://www.geeksforgeeks.org/)
- description: 2-3 sentence description
Example URLs: 
- https://www.geeksforgeeks.org/machine-learning-python/
- https://www.geeksforgeeks.org/data-structures/
- https://www.geeksforgeeks.org/python-tutorial/
Return ONLY the JSON array, no other text."""
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=600
                )
            )
            content = response.text
            if content:
                try:
                    content = content.strip()
                    if content.startswith('```json'):
                        content = content[7:]
                    if content.endswith('```'):
                        content = content[:-3]
                    content = content.strip()
                    articles = json.loads(content)
                    return articles[:2] if isinstance(articles, list) else []
                except:
                    pass
            topic_slug = topic.lower().replace(' ', '-').replace('learning', '').replace('machine', 'ml').replace('artificial-intelligence', 'ai').strip('-')
            possible_urls = [
                f"https://www.geeksforgeeks.org/{topic_slug}-tutorial/",
                f"https://www.geeksforgeeks.org/{topic_slug}/",
                f"https://www.geeksforgeeks.org/learn-{topic_slug}/",
                f"https://www.geeksforgeeks.org/{topic_slug}-complete-guide/"
            ]
            return [{
                "title": f"Complete {topic} Tutorial - GeeksforGeeks",
                "platform": "GeeksforGeeks",
                "type": "article",
                "url": possible_urls[0],  # Use first variation
                "description": f"Comprehensive {topic} tutorial with examples, code snippets, and practice problems"
            }, {
                "title": f"{topic} Interview Questions | GFG",
                "platform": "GeeksforGeeks",
                "type": "article",
                "url": f"https://www.geeksforgeeks.org/{topic_slug}-interview-questions/",
                "description": f"Common {topic} interview questions and solutions for technical interviews"
            }]
        except Exception as e:
            print(f"GeeksforGeeks resource generation error: {e}")
            return [{
                "title": f"Learn {topic} - Complete Guide",
                "platform": "GeeksforGeeks",
                "type": "article",
                "url": f"https://www.geeksforgeeks.org/{topic.lower().replace(' ', '-')}-tutorial/",
                "description": f"Comprehensive tutorial on {topic} with examples and practice problems"
            }]
    async def _analyze_pdf_content(self, pdf_content: str) -> Dict[str, Any]:
        """Analyze uploaded PDF content to understand key topics."""
        try:
            truncated_content = pdf_content[:3000] + "..." if len(pdf_content) > 3000 else pdf_content
            prompt = f"""Analyze the provided PDF/book content and extract key information.
Return a JSON object with:
- key_topics: Array of main topics covered (max 3)
- key_concepts: Array of important concepts (max 5)
- difficulty: "beginner", "intermediate", or "advanced"
- estimated_study_time: Estimated time to study (e.g., "2 hours", "3-4 hours")
Content to analyze:
{truncated_content}
Return ONLY the JSON object, no other text."""
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=400
                )
            )
            content = response.text
            if content:
                try:
                    content = content.strip()
                    if content.startswith('```json'):
                        content = content[7:]
                    if content.endswith('```'):
                        content = content[:-3]
                    content = content.strip()
                    analysis = json.loads(content)
                    analysis.setdefault("key_topics", ["General Content"])
                    analysis.setdefault("key_concepts", ["Content analysis"])
                    analysis.setdefault("difficulty", "intermediate")
                    analysis.setdefault("estimated_study_time", "2 hours")
                    return analysis
                except Exception as parse_error:
                    print(f"JSON parse error: {parse_error}")
                    pass
            return {
                "key_topics": ["PDF Content"],
                "key_concepts": ["Content analysis"],
                "difficulty": "intermediate",
                "estimated_study_time": "2 hours"
            }
        except Exception as e:
            print(f"PDF analysis error: {e}")
            return {
                "key_topics": ["PDF Content"],
                "key_concepts": ["Content analysis"],
                "difficulty": "intermediate",
                "estimated_study_time": "2 hours"
            }
    def _estimate_difficulty(self, topic: str, resources: List[Dict]) -> str:
        """Estimate difficulty based on topic and available resources."""
        advanced_topics = ["machine learning", "deep learning", "quantum computing", "advanced algorithms"]
        beginner_topics = ["html", "css", "basic programming", "introduction"]
        topic_lower = topic.lower()
        if any(t in topic_lower for t in advanced_topics):
            return "advanced"
        elif any(t in topic_lower for t in beginner_topics):
            return "beginner"
        else:
            return "intermediate"
    def _estimate_study_time(self, resources: List[Dict]) -> int:
        """Estimate study time based on resources."""
        base_time = 2  # hours
        for resource in resources:
            if resource.get("type") == "video":
                base_time += 1
            elif resource.get("type") == "book":
                base_time += 3
            elif resource.get("type") == "article":
                base_time += 1
        return min(base_time, 8)  # Cap at 8 hours
    def _get_youtube_fallback_videos(self, topic: str) -> List[Dict[str, Any]]:
        """Generate fallback YouTube video suggestions when API fails."""
        try:
            prompt = f"""Create 2-3 realistic YouTube video recommendations for learning {topic}. 
Return a JSON array with objects containing:
- title: Realistic YouTube video title for learning {topic}
- platform: "YouTube"
- type: "video"
- url: Realistic YouTube URL that would exist (like https://www.youtube.com/watch?v=YOUR_ID_HERE)
- description: Brief description of what the video covers
- channel: Plausible channel name (like "freeCodeCamp", "Tech With Tim", "CS Dojo")
Focus on educational, beginner-friendly content. Make URLs realistic but they don't need to actually work.
Return ONLY the JSON array, no other text."""
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=500
                )
            )
            content = response.text
            if content:
                try:
                    content = content.strip()
                    if content.startswith('```json'):
                        content = content[7:]
                    if content.endswith('```'):
                        content = content[:-3]
                    content = content.strip()
                    videos = json.loads(content)
                    return videos[:3] if isinstance(videos, list) else []
                except Exception as parse_error:
                    print(f"YouTube fallback JSON parse error: {parse_error}")
                    pass
        except Exception as e:
            print(f"YouTube fallback generation error: {e}")
        topic_slug = topic.lower().replace(' ', '').replace('-', '')
        return [
            {
                "title": f"{topic} Tutorial for Beginners - Full Course",
                "platform": "YouTube",
                "type": "video",
                "url": f"https://www.youtube.com/watch?v={topic_slug}Tutorial123",
                "description": f"Complete tutorial covering {topic} fundamentals, intermediate concepts, and practical examples",
                "channel": "freeCodeCamp"
            },
            {
                "title": f"Learn {topic} in One Video",
                "platform": "YouTube",
                "type": "video",
                "url": f"https://www.youtube.com/watch?v={topic_slug}OneVideo456",
                "description": f"Comprehensive overview of {topic} concepts, perfect for quick learning",
                "channel": "Tech With Tim"
            }
        ]
    def _get_mock_resources(self, topic: str) -> Dict[str, Any]:
        """Fallback mock response when APIs are unavailable."""
        return {
            "resources": [
                {
                    "title": f"Introduction to {topic}",
                    "platform": "GeeksforGeeks",
                    "type": "article",
                    "url": "https://www.geeksforgeeks.org/",
                    "description": f"Comprehensive guide to {topic}"
                },
                {
                    "title": f"{topic} Tutorial",
                    "platform": "YouTube",
                    "type": "video",
                    "url": "https://youtube.com/",
                    "description": f"Video tutorial on {topic}"
                }
            ],
            "difficulty": "beginner",
            "estimated_time": "2 hours"
        }
def generate_study_plan(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main function expected by Flask server for generating study plans."""
    import os
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return {
            "error": "GEMINI_API_KEY not found",
            "fallback_data": {
                "study_plan": {
                    "title": f"Study Plan for {request_data.get('subject', 'Subject')}",
                    "duration": f"{request_data.get('duration', 30)} days",
                    "difficulty": request_data.get('difficulty', 'intermediate'),
                    "daily_schedule": [
                        {
                            "day": 1,
                            "topic": f"Introduction to {request_data.get('subject', 'the subject')}",
                            "duration": "2 hours",
                            "activities": ["Read overview", "Watch introductory videos"]
                        },
                        {
                            "day": 2,
                            "topic": "Core concepts",
                            "duration": "2 hours", 
                            "activities": ["Study fundamentals", "Practice exercises"]
                        }
                    ],
                    "goals": request_data.get('goals', ['Complete course', 'Pass assessment'])
                }
            }
        }
    
    # Extract parameters from request
    subject = request_data.get('subject', 'general subject')
    duration = request_data.get('duration', 30)
    difficulty = request_data.get('difficulty', 'intermediate')
    goals = request_data.get('goals', [])
    
    # Create a basic study plan structure
    return {
        "study_plan": {
            "title": f"Study Plan for {subject}",
            "duration": f"{duration} days",
            "difficulty": difficulty,
            "goals": goals,
            "daily_schedule": [
                {
                    "day": i,
                    "topic": f"Topic {i} in {subject}",
                    "duration": "2 hours",
                    "activities": ["Study", "Practice", "Review"]
                } for i in range(1, min(duration, 10) + 1)
            ]
        }
    }

def get_learning_resources(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main function expected by Flask server for getting learning resources."""
    import os
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return {
            "error": "GEMINI_API_KEY not found",
            "fallback_data": {
                "resources": [
                    {
                        "title": f"{request_data.get('topic', 'Study Topic')} - Basic Guide",
                        "platform": "GeeksforGeeks",
                        "type": "article",
                        "url": "https://www.geeksforgeeks.org/",
                        "description": f"Comprehensive guide to {request_data.get('topic', 'the topic')}"
                    },
                    {
                        "title": f"{request_data.get('topic', 'Study Topic')} Tutorial",
                        "platform": "YouTube",
                        "type": "video", 
                        "url": "https://youtube.com/",
                        "description": f"Video tutorial on {request_data.get('topic', 'the topic')}"
                    }
                ],
                "difficulty": request_data.get('level', 'beginner'),
                "estimated_time": "2 hours"
            }
        }
    
    # Extract parameters from request
    topic = request_data.get('topic', 'general topic')
    level = request_data.get('level', 'beginner')
    format_preferences = request_data.get('format', [])
    preferences = request_data.get('preferences', [])
    
    agent = LearningResourceAgent(api_key)
    return agent.search_resources(topic, None)

def get_learning_resources_legacy(topic: str, api_key: str, pdf_content: str = None) -> Dict[str, Any]:
    """Legacy helper function to get learning resources."""
    agent = LearningResourceAgent(api_key)
    return agent.search_resources(topic, pdf_content)
