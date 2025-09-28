import React, { useState } from 'react';
import { youtubeService, YouTubeVideo } from '../services/youtubeService';

const YouTubeTest: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('JavaScript programming');

  const testYouTubeAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing YouTube API with query:', searchQuery);
      console.log('API Key available:', import.meta.env.VITE_YOUTUBE_API_KEY ? 'Yes' : 'No');
      
      const result = await youtubeService.searchEducationalVideos({ query: searchQuery, maxResults: 5 });
      console.log('YouTube API result:', result);
      
      setVideos(result);
    } catch (err: any) {
      console.error('YouTube API test error:', err);
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">YouTube API Test</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter search query"
          className="px-3 py-2 border rounded mr-2 w-64"
        />
        <button
          onClick={testYouTubeAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test YouTube API'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="mb-4 text-sm text-gray-600">
        <p>Environment Variables Status:</p>
        <ul className="list-disc list-inside">
          <li>YouTube API Key: {import.meta.env.VITE_YOUTUBE_API_KEY ? '✅ Available' : '❌ Missing'}</li>
          <li>Backend URL: {import.meta.env.VITE_BACKEND_URL || 'Not set'}</li>
        </ul>
      </div>

      {videos.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Search Results ({videos.length} videos):</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <div key={video.id || index} className="border rounded-lg p-4 shadow">
                {video.thumbnailUrl && (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{video.channelTitle}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{video.description}</p>
                <div className="mt-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    Watch on YouTube →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeTest;