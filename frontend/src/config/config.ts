// Configuration for enhanced AI Learning Hub
export const CONFIG = {
  // YouTube API Configuration - Read from Vite environment variables
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',
  
  // Backend API Configuration
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001',
  
  // AI Agent Configuration
  AI_AGENTS_ENABLED: true,
  
  // Feature Flags
  FEATURES: {
    ENHANCED_LEARNING_PATHS: true,
    YOUTUBE_INTEGRATION: true,
    AI_ASSESSMENT_GENERATION: true,
    REAL_TIME_PROGRESS_TRACKING: true,
    PERSONALIZED_RECOMMENDATIONS: true,
    SKILL_GAP_ANALYSIS: true,
    ADAPTIVE_LEARNING: true,
    COLLABORATIVE_FEATURES: false, // Coming soon
    GAMIFICATION: false, // Coming soon
  },
  
  // Learning Configuration
  DEFAULT_VIDEO_COUNT: 3,
  DEFAULT_ASSESSMENT_QUESTIONS: 10,
  MIN_COMPLETION_THRESHOLD: 70,
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  LOADING_DELAY: 800,
  
  // External Resources
  ROADMAP_URLS: {
    'Frontend Development': 'https://roadmap.sh/pdfs/roadmaps/frontend.pdf',
    'Backend Development': 'https://roadmap.sh/pdfs/roadmaps/backend.pdf',
    'Data Science': 'https://roadmap.sh/pdfs/roadmaps/ai-data-scientist.pdf',
    'Cybersecurity': 'https://roadmap.sh/pdfs/roadmaps/cyber-security.pdf',
    'Fullstack Development': 'https://roadmap.sh/pdfs/roadmaps/full-stack.pdf',
    'DevOps': 'https://roadmap.sh/pdfs/roadmaps/devops.pdf',
    'Machine Learning': 'https://roadmap.sh/pdfs/roadmaps/ai-data-scientist.pdf'
  },
  
  // Curated Learning Resources
  CURATED_CHANNELS: {
    'JavaScript': [
      { name: 'freeCodeCamp.org', channelId: 'UC8butISFwT-Wl7EV0hUK0BQ' },
      { name: 'Traversy Media', channelId: 'UC29ju8bIPH5as8OGnQzwJyA' },
      { name: 'The Net Ninja', channelId: 'UCW5YeuERMmlnqo4oq8vwUpg' }
    ],
    'React': [
      { name: 'React Official', channelId: 'UCz5vTaEhvh7dOHEyd1efcaQ' },
      { name: 'Codevolution', channelId: 'UC80PWRj_ZU8Zu0HSMNVwKWw' }
    ],
    'Python': [
      { name: 'Programming with Mosh', channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA' },
      { name: 'Corey Schafer', channelId: 'UCCezIgC97PvUuR4_gbFUs5g' }
    ]
  }
};

// Utility functions
export const getYouTubeAPIKey = () => {
  const apiKey = CONFIG.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('YouTube API key not configured. Please set REACT_APP_YOUTUBE_API_KEY environment variable.');
    return null;
  }
  return apiKey;
};

export const isFeatureEnabled = (feature: keyof typeof CONFIG.FEATURES): boolean => {
  return CONFIG.FEATURES[feature];
};

export const getBackendURL = () => CONFIG.BACKEND_URL;

export const getRoadmapURL = (category: string): string | null => {
  return CONFIG.ROADMAP_URLS[category as keyof typeof CONFIG.ROADMAP_URLS] || null;
};