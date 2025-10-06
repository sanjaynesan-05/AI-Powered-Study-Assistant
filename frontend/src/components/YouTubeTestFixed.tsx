import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Eye, Calendar, AlertCircle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { youtubeService, YouTubeVideo } from '../services/youtubeService';

const YouTubeTest: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('JavaScript programming');
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'error'>('unknown');

  // Test API status on component mount
  useEffect(() => {
    testAPIStatus();
  }, []);

  const testAPIStatus = async () => {
    try {
      setApiStatus('unknown');
      const result = await youtubeService.searchEducationalVideos({ 
        query: 'programming', 
        maxResults: 1 
      });
      setApiStatus(result && result.length > 0 ? 'working' : 'error');
    } catch (error) {
      setApiStatus('error');
    }
  };

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
        maxResults: 12 
      });

      console.log('YouTube API result:', result);
      setVideos(result || []);
      setApiStatus('working');

      if (!result || result.length === 0) {
        setError('No videos found for this search query');
      }
    } catch (error: any) {
      console.error('YouTube API error:', error);
      setError(`Error: ${error.message || 'Failed to fetch videos'}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      testYouTubeAPI();
    }
  };

  const formatViewCount = (views: string): string => {
    const num = parseInt(views);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    } else {
      return `${num} views`;
    }
  };

  const formatDate = (publishedAt: string): string => {
    try {
      const date = new Date(publishedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return 'Unknown date';
    }
  };

  const getAPIStatusColor = () => {
    switch (apiStatus) {
      case 'working': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAPIStatusIcon = () => {
    switch (apiStatus) {
      case 'working': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">YouTube API Testing & Verification</h1>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getAPIStatusColor()}`}>
            {getAPIStatusIcon()}
            <span className="text-sm font-medium">
              {apiStatus === 'working' ? 'API Working' : 
               apiStatus === 'error' ? 'API Error' : 'Testing API...'}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Test the YouTube Data API v3 integration with various search queries and verify video data retrieval.
        </p>

        {/* Search Interface */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter search query (e.g., JavaScript programming, React tutorial)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={testYouTubeAPI}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search Videos</span>
                </>
              )}
            </button>
            
            <button
              onClick={testAPIStatus}
              disabled={loading}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
              title="Test API Status"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {videos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {videos.length} videos found
            </span>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {video.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                    {video.channelTitle}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{video.viewCount ? formatViewCount(video.viewCount) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(video.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                    {video.description || 'No description available'}
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-red-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <Play className="w-4 h-4" />
                      <span>Watch</span>
                    </a>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Information */}
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">API Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">API Key Status:</span>
              <span className={import.meta.env.VITE_YOUTUBE_API_KEY ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_YOUTUBE_API_KEY ? 'Configured' : 'Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base URL:</span>
              <span className="text-blue-600 text-sm">https://www.googleapis.com/youtube/v3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Results per Query:</span>
              <span className="text-gray-800">12</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Search Type:</span>
              <span className="text-gray-800">Educational Videos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Content Rating:</span>
              <span className="text-gray-800">Safe for Work</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Relevance Language:</span>
              <span className="text-gray-800">English</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testing Guide */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Testing Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Recommended Test Queries:</h3>
            <ul className="space-y-1 text-sm text-blue-600">
              <li>• "JavaScript programming tutorial"</li>
              <li>• "React hooks explained"</li>
              <li>• "Python data science"</li>
              <li>• "Machine learning basics"</li>
              <li>• "Web development 2024"</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Features to Verify:</h3>
            <ul className="space-y-1 text-sm text-blue-600">
              <li>• ✓ Video thumbnails load correctly</li>
              <li>• ✓ Duration formatting works</li>
              <li>• ✓ View count formatting</li>
              <li>• ✓ Date formatting (relative)</li>
              <li>• ✓ External links function</li>
              <li>• ✓ Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeTest;