import React, { useEffect, useState } from 'react';
import { youtubeService } from '../services/youtubeService';
import { CONFIG } from '../config/config';

export const YouTubeAPITest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [testVideos, setTestVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check API status on component mount
    const status = youtubeService.getAPIStatus();
    setApiStatus(status);
    console.log('YouTube API Status:', status);
  }, []);

  const testVideoSearch = async () => {
    setLoading(true);
    try {
      const videos = await youtubeService.searchEducationalVideos({
        query: 'JavaScript tutorial',
        maxResults: 3
      });
      setTestVideos(videos);
      console.log('Test videos:', videos);
    } catch (error) {
      console.error('Video search test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <h3 className="text-xl font-bold mb-4">🎥 YouTube API Test</h3>
      
      {/* API Status */}
      <div className="mb-4 p-3 rounded bg-gray-50">
        <h4 className="font-semibold mb-2">API Status:</h4>
        <p className={`text-sm ${apiStatus?.available ? 'text-green-600' : 'text-red-600'}`}>
          {apiStatus?.available ? '✅ API Available' : '❌ API Not Available'}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          API Key Length: {apiStatus?.keyLength || 0} characters
        </p>
        <p className="text-xs text-gray-600">
          Message: {apiStatus?.message}
        </p>
      </div>

      {/* Environment Variables Debug */}
      <div className="mb-4 p-3 rounded bg-blue-50">
        <h4 className="font-semibold mb-2">Environment Variables:</h4>
        <p className="text-xs">
          REACT_APP_YOUTUBE_API_KEY: {CONFIG.YOUTUBE_API_KEY ? `${CONFIG.YOUTUBE_API_KEY.substring(0, 10)}...` : 'Not found'}
        </p>
        <p className="text-xs">
          REACT_APP_BACKEND_URL: {CONFIG.BACKEND_URL}
        </p>
      </div>

      {/* Test Button */}
      <button
        onClick={testVideoSearch}
        disabled={loading || !apiStatus?.available}
        className={`px-4 py-2 rounded font-medium ${
          loading || !apiStatus?.available
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {loading ? 'Testing...' : 'Test Video Search'}
      </button>

      {/* Test Results */}
      {testVideos.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Test Results ({testVideos.length} videos):</h4>
          <div className="space-y-2">
            {testVideos.map((video, index) => (
              <div key={video.id} className="p-3 border rounded bg-gray-50">
                <p className="font-medium text-sm">{index + 1}. {video.title}</p>
                <p className="text-xs text-gray-600">Channel: {video.channelTitle}</p>
                <p className="text-xs text-blue-600">
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                    {video.videoUrl}
                  </a>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};