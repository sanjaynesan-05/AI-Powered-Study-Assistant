import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  difficultyLevel: string;
  modules: any[];
  prerequisites: string[];
  learningOutcomes: string[];
  confidence: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  skillArea: string;
  questions: any[];
  passingScore: number;
  timeLimit: number;
  difficultyLevel: string;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: string;
  confidence: number;
  actionItems: string[];
}

interface AIAgentContextType {
  // State
  isGenerating: boolean;
  currentJourney: any | null;
  learningPaths: LearningPath[];
  assessments: Assessment[];
  recommendations: Recommendation[];
  error: string | null;
  
  // AI Journey Generation
  generateCompleteJourney: (targetSkill: string, userPreferences?: any) => Promise<void>;
  
  // Learning Path Management
  generateLearningPath: (targetSkill: string, difficulty?: string, preferences?: any) => Promise<LearningPath | null>;
  
  // Assessment Management
  generateAssessment: (skillArea: string, difficulty?: string, questionCount?: number) => Promise<Assessment | null>;
  analyzeAssessmentResults: (userAnswers: any[], assessment: Assessment, timeSpent?: number) => Promise<any>;
  
  // Recommendations
  getPersonalizedRecommendations: () => Promise<void>;
  getSkillGapAnalysis: (targetRole: string) => Promise<any>;
  
  // Progress Tracking
  analyzeProgress: (pathId: string, progressData: any) => Promise<any>;
  
  // Utility Functions
  clearError: () => void;
  resetState: () => void;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

interface AIAgentProviderProps {
  children: ReactNode;
}

export const AIAgentProvider: React.FC<AIAgentProviderProps> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJourney, setCurrentJourney] = useState<any | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const resetState = () => {
    setCurrentJourney(null);
    setLearningPaths([]);
    setAssessments([]);
    setRecommendations([]);
    setError(null);
  };

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:5001';
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const generateCompleteJourney = async (targetSkill: string, userPreferences: any = {}) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/generate-journey', {
        method: 'POST',
        body: JSON.stringify({
          targetSkill,
          userPreferences
        })
      });

      if (response.success) {
        setCurrentJourney(response.data);
        
        // Extract and store components
        if (response.data.learningPath) {
          setLearningPaths(prev => [...prev, response.data.learningPath]);
        }
        if (response.data.assessment) {
          setAssessments(prev => [...prev, response.data.assessment]);
        }
        if (response.data.recommendations) {
          setRecommendations(response.data.recommendations);
        }
      } else {
        throw new Error(response.message || 'Failed to generate journey');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the journey');
      console.error('Journey Generation Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLearningPath = async (
    targetSkill: string, 
    difficulty: string = 'beginner', 
    preferences: any = {}
  ): Promise<LearningPath | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/learning-path', {
        method: 'POST',
        body: JSON.stringify({
          targetSkill,
          difficulty,
          preferences
        })
      });

      if (response.success) {
        const newPath = response.data;
        setLearningPaths(prev => [...prev, newPath]);
        return newPath;
      } else {
        throw new Error(response.message || 'Failed to generate learning path');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the learning path');
      console.error('Learning Path Generation Error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAssessment = async (
    skillArea: string, 
    difficulty: string = 'intermediate', 
    questionCount: number = 20
  ): Promise<Assessment | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/assessment', {
        method: 'POST',
        body: JSON.stringify({
          skillArea,
          difficulty,
          questionCount
        })
      });

      if (response.success) {
        const newAssessment = response.data;
        setAssessments(prev => [...prev, newAssessment]);
        return newAssessment;
      } else {
        throw new Error(response.message || 'Failed to generate assessment');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the assessment');
      console.error('Assessment Generation Error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeAssessmentResults = async (
    userAnswers: any[], 
    assessment: Assessment, 
    timeSpent: number = 30
  ) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/analyze-assessment', {
        method: 'POST',
        body: JSON.stringify({
          userAnswers,
          assessment,
          assessmentId: assessment.id,
          timeSpent
        })
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to analyze assessment results');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing assessment results');
      console.error('Assessment Analysis Error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getPersonalizedRecommendations = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/recommendations', {
        method: 'GET'
      });

      if (response.success) {
        setRecommendations(response.data);
      } else {
        throw new Error(response.message || 'Failed to get recommendations');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching recommendations');
      console.error('Recommendations Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSkillGapAnalysis = async (targetRole: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/skill-gap', {
        method: 'POST',
        body: JSON.stringify({
          targetRole
        })
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to analyze skill gaps');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during skill gap analysis');
      console.error('Skill Gap Analysis Error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeProgress = async (pathId: string, progressData: any) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/analyze-progress', {
        method: 'POST',
        body: JSON.stringify({
          pathId,
          progressData
        })
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to analyze progress');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing progress');
      console.error('Progress Analysis Error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const value: AIAgentContextType = {
    // State
    isGenerating,
    currentJourney,
    learningPaths,
    assessments,
    recommendations,
    error,
    
    // Methods
    generateCompleteJourney,
    generateLearningPath,
    generateAssessment,
    analyzeAssessmentResults,
    getPersonalizedRecommendations,
    getSkillGapAnalysis,
    analyzeProgress,
    clearError,
    resetState
  };

  return (
    <AIAgentContext.Provider value={value}>
      {children}
    </AIAgentContext.Provider>
  );
};

export const useAIAgent = () => {
  const context = useContext(AIAgentContext);
  if (context === undefined) {
    throw new Error('useAIAgent must be used within an AIAgentProvider');
  }
  return context;
};

export default AIAgentContext;