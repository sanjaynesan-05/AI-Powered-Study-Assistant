// YouTube API Service for real video integration
import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || ''; // Read from Vite environment variables
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Validate API key on service initialization
if (!YOUTUBE_API_KEY) {
  console.warn('⚠️ YouTube API key not found in environment variables. Please set VITE_YOUTUBE_API_KEY in your .env file.');
}

interface VideoSearchParams {
  query: string;
  maxResults?: number;
  duration?: 'short' | 'medium' | 'long';
  relevanceLanguage?: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  videoUrl: string;
}

class YouTubeService {
  // Check if YouTube API is available
  isAPIAvailable(): boolean {
    return !!YOUTUBE_API_KEY;
  }

  // Get API status for debugging
  getAPIStatus(): { available: boolean; keyLength: number; message: string } {
    if (!YOUTUBE_API_KEY) {
      return {
        available: false,
        keyLength: 0,
        message: 'YouTube API key not found in environment variables'
      };
    }

    return {
      available: true,
      keyLength: YOUTUBE_API_KEY.length,
      message: 'YouTube API ready'
    };
  }

  // Search for educational videos based on topic
  async searchEducationalVideos(params: VideoSearchParams): Promise<YouTubeVideo[]> {
    try {
      // Check if API key is available
      if (!YOUTUBE_API_KEY) {
        console.warn('⚠️ YouTube API key not available, using fallback videos');
        return this.getFallbackVideos(params.query);
      }

      const searchQuery = `${params.query} tutorial programming course learning`;
      
      const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
        params: {
          key: YOUTUBE_API_KEY,
          part: 'snippet',
          q: searchQuery,
          maxResults: params.maxResults || 5,
          type: 'video',
          videoDefinition: 'high',
          videoCategory: '27', // Education category
          relevanceLanguage: params.relevanceLanguage || 'en',
          order: 'relevance'
        }
      });

      const videoIds = response.data.items.map((item: any) => item.id.videoId).join(',');
      
      // Get additional video details
      const detailsResponse = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
        params: {
          key: YOUTUBE_API_KEY,
          part: 'statistics,contentDetails',
          id: videoIds
        }
      });

      return response.data.items.map((item: any, index: number) => {
        const details = detailsResponse.data.items[index];
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          duration: this.formatDuration(details.contentDetails.duration),
          viewCount: details.statistics.viewCount,
          publishedAt: item.snippet.publishedAt,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
        };
      });
    } catch (error) {
      console.error('YouTube API Error:', error);
      return this.getFallbackVideos(params.query);
    }
  }

  // Get curated educational videos for specific programming topics
  getCuratedVideos(topic: string): YouTubeVideo[] {
    const curatedVideos: Record<string, YouTubeVideo[]> = {
      'javascript': [
        {
          id: 'W6NZfCO5SIk',
          title: 'Learn JavaScript - Full Course for Beginners',
          description: 'This complete 134-part JavaScript tutorial for beginners will teach you everything you need to know to get started with the JavaScript programming language.',
          thumbnailUrl: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg',
          channelTitle: 'freeCodeCamp.org',
          duration: '3:26:42',
          viewCount: '3200000',
          publishedAt: '2018-01-25',
          videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk'
        },
        {
          id: 'hdI2bqOjy3c',
          title: 'JavaScript Crash Course For Beginners',
          description: 'In this crash course we will go over the fundamentals of JavaScript including more modern syntax.',
          thumbnailUrl: 'https://img.youtube.com/vi/hdI2bqOjy3c/hqdefault.jpg',
          channelTitle: 'Traversy Media',
          duration: '1:40:27',
          viewCount: '2800000',
          publishedAt: '2018-06-23',
          videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c'
        }
      ],
      'react': [
        {
          id: 'Ke90Tje7VS0',
          title: 'React Course - Beginner\'s Tutorial for React JavaScript Library [2022]',
          description: 'Learn React by building eight real-world projects and solving 140+ coding challenges.',
          thumbnailUrl: 'https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg',
          channelTitle: 'freeCodeCamp.org',
          duration: '11:55:27',
          viewCount: '1900000',
          publishedAt: '2022-04-25',
          videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0'
        }
      ],
      'python': [
        {
          id: '_uQrJ0TkZlc',
          title: 'Python Tutorial - Python Full Course for Beginners',
          description: 'Python tutorial for beginners - Learn Python for machine learning, web development, and more.',
          thumbnailUrl: 'https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
          channelTitle: 'Programming with Mosh',
          duration: '6:14:07',
          viewCount: '15000000',
          publishedAt: '2019-02-18',
          videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc'
        }
      ]
    };

    const topicKey = topic.toLowerCase();
    return curatedVideos[topicKey] || [];
  }

  private formatDuration(duration: string): string {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getFallbackVideos(topic: string): YouTubeVideo[] {
    return this.getCuratedVideos(topic);
  }
}

export const youtubeService = new YouTubeService();
export type { YouTubeVideo };