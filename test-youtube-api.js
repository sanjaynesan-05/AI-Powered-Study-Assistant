// Test YouTube API Integration
const axios = require('axios');

const YOUTUBE_API_KEY = 'AIzaSyBnEM6-oUJLHoW-FgWpiU_z-8vrpSJqUFk';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function testYouTubeAPI() {
  try {
    console.log('🎥 Testing YouTube API integration...');
    
    const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        q: 'JavaScript tutorial programming',
        maxResults: 3,
        type: 'video',
        videoDefinition: 'high',
        videoCategoryId: '27', // Education category
        order: 'relevance'
      }
    });

    console.log('✅ YouTube API test successful!');
    console.log(`📊 Found ${response.data.items.length} videos`);
    
    response.data.items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.snippet.title}`);
      console.log(`   Channel: ${item.snippet.channelTitle}`);
      console.log(`   URL: https://www.youtube.com/watch?v=${item.id.videoId}`);
    });

    return {
      success: true,
      data: response.data.items,
      message: 'YouTube API integration working!'
    };

  } catch (error) {
    console.error('❌ YouTube API test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return {
      success: false,
      error: error.message,
      message: 'YouTube API integration failed'
    };
  }
}

// Run the test
testYouTubeAPI();