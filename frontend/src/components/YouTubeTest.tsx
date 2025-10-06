import React, { useState, useEffect } from 'react';
import { youtubeService, YouTubeVideo } from '../services/youtubeService';

const YouTubeTest: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('JavaScript programming');

  const testYouTubeAPI = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Testing YouTube API with query:', searchQuery);
      console.log('API Key available:', import.meta.env.VITE_YOUTUBE_API_KEY ? 'Yes' : 'No');

      const result = await youtubeService.searchEducationalVideos({
        query: searchQuery,
        maxResults: 6,
      });

      console.log('YouTube API result:', result);
      setVideos(result || []);
    } catch (err: any) {
      console.error('YouTube API test error:', err);
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const checkApiStatus = async () => {
    try {
      const hasApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!hasApiKey) {
        setError('YouTube API key not configured');
        return;
      }

      const testResult = await youtubeService.searchEducationalVideos({
        query: 'test',
        maxResults: 1,
      });

      if (testResult && testResult.length >= 0) {
        console.log('API is working');
      }
    } catch (err: any) {
      console.error('API status check failed:', err);
      setError(`API Error: ${err.message}`);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">YouTube API Integration Test</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={testYouTubeAPI}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Videos'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}

          {videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img 
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{video.channelTitle}</p>
                    <a 
                      href={video.videoUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Watch Video
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>API Key: {import.meta.env.VITE_YOUTUBE_API_KEY ? '✅ Available' : '❌ Missing'}</p>
          <p>Videos Found: {videos.length}</p>
        </div>
      </div>
    </div>
  );
};

export default YouTubeTest;