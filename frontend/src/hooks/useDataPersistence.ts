// React hooks for user progress and learning data persistence
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Type definitions
interface UserProgress {
  _id: string;
  userId: string;
  skillArea: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  progressPercentage: number;
  totalTimeSpent: number;
  lastAccessedAt: Date;
  completedModules: Array<{
    moduleId: string;
    title: string;
    completedAt: Date;
    timeSpent: number;
    score: number;
  }>;
  achievements: Array<{
    type: string;
    achievedAt: Date;
    description: string;
  }>;
  learningPath: {
    pathId: string;
    title: string;
    currentModule: string;
    modulesCompleted: number;
    totalModules: number;
    estimatedCompletion: Date;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date;
  };
}

interface AIInteraction {
  _id: string;
  userId: string;
  sessionId: string;
  agentType: 'learningPath' | 'careerMentor' | 'resumeCoach' | 'studyGuide' | 'skillAssessment';
  query: string;
  response: any;
  confidence: number;
  feedback?: {
    rating: number;
    comment: string;
    helpful: boolean;
  };
  processingTime: number;
  fallbackUsed: boolean;
  createdAt: Date;
}

interface VideoHistory {
  _id: string;
  userId: string;
  videoId: string;
  title: string;
  channelTitle: string;
  duration: number;
  category: string;
  skillArea: string;
  watchHistory: Array<{
    sessionId: string;
    startTime: Date;
    endTime: Date;
    watchedDuration: number;
    progressPercentage: number;
    completed: boolean;
    notes: string;
    bookmarks: Array<{
      timestamp: number;
      note: string;
      createdAt: Date;
    }>;
  }>;
  totalWatchTime: number;
  completionCount: number;
  lastWatchedAt: Date;
}

interface LearningSession {
  _id: string;
  userId: string;
  sessionId: string;
  type: 'video' | 'reading' | 'practice' | 'assessment' | 'ai_interaction';
  skillArea: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activities: Array<{
    type: string;
    resourceId: string;
    title: string;
    timeSpent: number;
    completed: boolean;
    score: number;
    notes: string;
    timestamp: Date;
  }>;
}

interface LearningAnalytics {
  totalTimeSpent: number;
  skillAreasActive: number;
  averageProgress: number;
  sessionsCount: number;
  aiInteractionsCount: number;
  currentStreak: number;
  longestStreak: number;
  skillBreakdown: Array<{
    skillArea: string;
    level: string;
    progress: number;
    timeSpent: number;
    modulesCompleted: number;
  }>;
  recentActivity: Array<{
    type: string;
    skillArea: string;
    duration: number;
    date: Date;
  }>;
}

// Custom hook for user progress management
export const useUserProgress = (skillArea?: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [allProgress, setAllProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch progress for specific skill area
  const fetchProgress = useCallback(async (area: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/progress/${user.id}/${area}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      
      const result = await response.json();
      if (result.success) {
        setProgress(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch all progress for user
  const fetchAllProgress = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/progress/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch all progress');
      }
      
      const result = await response.json();
      if (result.success) {
        setAllProgress(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Update progress for skill area
  const updateProgress = useCallback(async (area: string, progressData: any) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/progress/${user.id}/${area}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      const result = await response.json();
      if (result.success) {
        setProgress(result.data);
        // Refresh all progress if we're tracking that too
        if (allProgress.length > 0) {
          fetchAllProgress();
        }
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, allProgress.length, fetchAllProgress]);

  // Add completed module
  const addCompletedModule = useCallback(async (area: string, moduleData: any) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/progress/${user.id}/${area}/module`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moduleData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add completed module');
      }
      
      const result = await response.json();
      if (result.success) {
        setProgress(result.data);
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user?.id]);

  // Load progress on component mount
  useEffect(() => {
    if (skillArea) {
      fetchProgress(skillArea);
    } else {
      fetchAllProgress();
    }
  }, [skillArea, fetchProgress, fetchAllProgress]);

  return {
    progress,
    allProgress,
    loading,
    error,
    fetchProgress,
    fetchAllProgress,
    updateProgress,
    addCompletedModule,
    refreshProgress: skillArea ? () => fetchProgress(skillArea) : fetchAllProgress
  };
};

// Custom hook for learning analytics
export const useLearningAnalytics = (timeframe: number = 30) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/${user.id}?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};

// Custom hook for AI interaction history
export const useAIInteractions = () => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save AI interaction
  const saveInteraction = useCallback(async (interactionData: any) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai-interactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...interactionData,
          userId: user.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save AI interaction');
      }
      
      const result = await response.json();
      if (result.success) {
        setInteractions(prev => [result.data, ...prev]);
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user?.id]);

  // Fetch interaction history
  const fetchInteractions = useCallback(async (agentType?: string, limit: number = 50) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (agentType) params.append('agentType', agentType);
      
      const response = await fetch(`${API_BASE_URL}/ai-interactions/${user.id}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch interactions');
      }
      
      const result = await response.json();
      if (result.success) {
        setInteractions(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Update interaction feedback
  const updateFeedback = useCallback(async (interactionId: string, feedback: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-interactions/${interactionId}/feedback`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }
      
      const result = await response.json();
      if (result.success) {
        setInteractions(prev => 
          prev.map(interaction => 
            interaction._id === interactionId 
              ? { ...interaction, feedback } 
              : interaction
          )
        );
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  return {
    interactions,
    loading,
    error,
    saveInteraction,
    fetchInteractions,
    updateFeedback
  };
};

// Custom hook for video history management
export const useVideoHistory = () => {
  const { user } = useAuth();
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update video session
  const updateVideoSession = useCallback(async (videoId: string, sessionData: any) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/video-history/${user.id}/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update video session');
      }
      
      const result = await response.json();
      if (result.success) {
        // Update local state
        setVideoHistory(prev => {
          const index = prev.findIndex(v => v.videoId === videoId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = result.data;
            return updated;
          } else {
            return [result.data, ...prev];
          }
        });
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user?.id]);

  // Fetch video history
  const fetchVideoHistory = useCallback(async (skillArea?: string, limit: number = 20) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (skillArea) params.append('skillArea', skillArea);
      
      const response = await fetch(`${API_BASE_URL}/video-history/${user.id}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch video history');
      }
      
      const result = await response.json();
      if (result.success) {
        setVideoHistory(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Add bookmark to video
  const addBookmark = useCallback(async (videoId: string, sessionIndex: number, bookmarkData: any) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/video-history/${user.id}/${videoId}/${sessionIndex}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookmarkData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add bookmark');
      }
      
      const result = await response.json();
      if (result.success) {
        // Update local state
        setVideoHistory(prev => 
          prev.map(video => 
            video.videoId === videoId ? result.data : video
          )
        );
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user?.id]);

  useEffect(() => {
    fetchVideoHistory();
  }, [fetchVideoHistory]);

  return {
    videoHistory,
    loading,
    error,
    updateVideoSession,
    fetchVideoHistory,
    addBookmark
  };
};

// Custom hook for learning sessions
export const useLearningSession = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start new learning session
  const startSession = useCallback(async (sessionData: any) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...sessionData,
          userId: user.id,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start session');
      }
      
      const result = await response.json();
      if (result.success) {
        setCurrentSession(result.data);
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // End current learning session
  const endSession = useCallback(async (sessionId: string, endData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(endData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to end session');
      }
      
      const result = await response.json();
      if (result.success) {
        setCurrentSession(null);
        setSessions(prev => [result.data, ...prev]);
        return result.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user sessions
  const fetchSessions = useCallback(async (skillArea?: string, type?: string, limit: number = 20) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (skillArea) params.append('skillArea', skillArea);
      if (type) params.append('type', type);
      
      const response = await fetch(`${API_BASE_URL}/sessions/${user.id}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const result = await response.json();
      if (result.success) {
        setSessions(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    currentSession,
    sessions,
    loading,
    error,
    startSession,
    endSession,
    fetchSessions
  };
};

// Combined dashboard hook
export const useDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard: fetchDashboard
  };
};