import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  aiAgentService, 
  AIJourney, 
  LearningPath, 
  Assessment, 
  Recommendation,
  WellnessInsights,
  MotivationalSupport,
  LearningResources
} from '../services/aiAgentService';

interface AIAgentContextType {
  // State
  isGenerating: boolean;
  currentJourney: AIJourney | null;
  learningPaths: LearningPath[];
  assessments: Assessment[];
  recommendations: Recommendation[];
  wellnessInsights: WellnessInsights | null;
  motivationalSupport: MotivationalSupport | null;
  learningResources: LearningResources | null;
  orchestratorStatus: any | null;
  error: string | null;
  
  // AI Journey Generation (Enhanced)
  generateCompleteJourney: (targetSkill: string, userProfile?: any, preferences?: any) => Promise<void>;
  
  // Individual Agent Functions
  getSmartResources: (topic: string, difficulty?: string) => Promise<void>;
  generateAdaptiveAssessment: (skillArea: string, difficulty?: string, questionCount?: number) => Promise<void>;
  performWellnessCheck: () => Promise<void>;
  getMotivationBoost: (context?: any) => Promise<void>;
  checkOrchestratorStatus: () => Promise<void>;
  
  // Legacy Functions (for backward compatibility)
  generateLearningPath: (targetSkill: string, difficulty?: string, preferences?: any) => Promise<LearningPath | null>;
  generateAssessment: (skillArea: string, difficulty?: string, questionCount?: number) => Promise<Assessment | null>;
  analyzeAssessmentResults: (userAnswers: any[], assessment: Assessment, timeSpent?: number) => Promise<any>;
  getPersonalizedRecommendations: () => Promise<void>;
  getSkillGapAnalysis: (targetRole: string) => Promise<any>;
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
  const [currentJourney, setCurrentJourney] = useState<AIJourney | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [wellnessInsights, setWellnessInsights] = useState<WellnessInsights | null>(null);
  const [motivationalSupport, setMotivationalSupport] = useState<MotivationalSupport | null>(null);
  const [learningResources, setLearningResources] = useState<LearningResources | null>(null);
  const [orchestratorStatus, setOrchestratorStatus] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const resetState = () => {
    setCurrentJourney(null);
    setLearningPaths([]);
    setAssessments([]);
    setRecommendations([]);
    setWellnessInsights(null);
    setMotivationalSupport(null);
    setLearningResources(null);
    setError(null);
  };

  /**
   * Generate complete AI-orchestrated learning journey
   */
  const generateCompleteJourney = async (targetSkill: string, userProfile: any = {}, preferences: any = {}) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log(`🚀 Starting complete journey generation for: ${targetSkill}`);
      
      const journey = await aiAgentService.generateCompleteJourney(targetSkill, userProfile, preferences);
      
      setCurrentJourney(journey);
      
      // Update individual state components
      if (journey.learningPath) {
        setLearningPaths(prev => {
          const filtered = prev.filter(path => path.id !== journey.learningPath.id);
          return [...filtered, journey.learningPath];
        });
      }
      
      if (journey.assessment && journey.assessment.available) {
        setAssessments(prev => {
          const newAssessment: Assessment = {
            ...journey.assessment,
            id: journey.assessment.quiz_id || `assessment_${Date.now()}`,
            title: `${targetSkill} Assessment`,
            description: `Adaptive assessment for ${targetSkill}`,
            skillArea: targetSkill,
            questions: journey.assessment.questions || [],
            passingScore: 70,
            timeLimit: 30,
            difficultyLevel: journey.assessment.difficulty || 'intermediate'
          };
          return [...prev, newAssessment];
        });
      }
      
      if (journey.recommendations) {
        setRecommendations(journey.recommendations);
      }
      
      if (journey.wellnessInsights) {
        setWellnessInsights(journey.wellnessInsights);
      }
      
      if (journey.motivationalSupport) {
        setMotivationalSupport(journey.motivationalSupport);
      }
      
      console.log(`✅ Complete journey generated successfully for: ${targetSkill}`);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate complete learning journey';
      setError(errorMessage);
      console.error('Complete Journey Generation Error:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Get smart learning resources
   */
  const getSmartResources = async (topic: string, difficulty: string = 'intermediate') => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const resources = await aiAgentService.getSmartResources(topic, difficulty);
      setLearningResources(resources);
      
    } catch (err: any) {
      setError(err.message || 'Failed to get smart resources');
      console.error('Smart Resources Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate adaptive assessment
   */
  const generateAdaptiveAssessment = async (skillArea: string, difficulty: string = 'intermediate', questionCount: number = 5) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const assessmentData = await aiAgentService.generateAdaptiveAssessment(skillArea, difficulty, questionCount);
      
      const newAssessment: Assessment = {
        id: assessmentData.assessment_id || `assessment_${Date.now()}`,
        title: `${skillArea} Assessment`,
        description: `Adaptive assessment for ${skillArea}`,
        skillArea,
        questions: assessmentData.questions || [],
        passingScore: 70,
        timeLimit: 30,
        difficultyLevel: assessmentData.difficulty || difficulty,
        ...assessmentData
      };
      
      setAssessments(prev => [...prev, newAssessment]);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate adaptive assessment');
      console.error('Adaptive Assessment Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Perform wellness check
   */
  const performWellnessCheck = async () => {
    try {
      const wellness = await aiAgentService.getWellnessCheck();
      setWellnessInsights(wellness);
    } catch (err: any) {
      setError(err.message || 'Failed to perform wellness check');
      console.error('Wellness Check Error:', err);
    }
  };

  /**
   * Get motivation boost
   */
  const getMotivationBoost = async (context: any = {}) => {
    try {
      const motivation = await aiAgentService.getMotivationBoost(context);
      setMotivationalSupport(motivation);
    } catch (err: any) {
      setError(err.message || 'Failed to get motivation boost');
      console.error('Motivation Boost Error:', err);
    }
  };

  /**
   * Check orchestrator status
   */
  const checkOrchestratorStatus = async () => {
    try {
      const status = await aiAgentService.getOrchestratorStatus();
      setOrchestratorStatus(status);
    } catch (err: any) {
      console.error('Orchestrator Status Error:', err);
    }
  };

  // Legacy functions for backward compatibility
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

  /**
   * Generate complete AI-orchestrated learning journey (Enhanced Version)
   */
  const generateCompleteJourney = async (targetSkill: string, userProfile: any = {}, preferences: any = {}) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log(`🚀 Starting orchestrated journey generation for: ${targetSkill}`);
      
      const journey = await aiAgentService.generateCompleteJourney(targetSkill, userProfile, preferences);
      
      setCurrentJourney(journey);
      
      // Update individual state components from orchestrated response
      if (journey.learningPath) {
        setLearningPaths(prev => {
          const filtered = prev.filter(path => path.id !== journey.learningPath.id);
          return [...filtered, journey.learningPath];
        });
      }
      
      if (journey.assessment && journey.assessment.available) {
        const newAssessment: Assessment = {
          id: journey.assessment.quiz_id || `assessment_${Date.now()}`,
          title: `${targetSkill} Assessment`,
          description: `Adaptive assessment for ${targetSkill}`,
          skillArea: targetSkill,
          questions: journey.assessment.questions || [],
          passingScore: 70,
          timeLimit: 30,
          difficultyLevel: journey.assessment.difficulty || 'intermediate'
        };
        setAssessments(prev => [...prev, newAssessment]);
      }
      
      if (journey.recommendations) {
        setRecommendations(journey.recommendations);
      }
      
      if (journey.wellnessInsights) {
        setWellnessInsights(journey.wellnessInsights);
      }
      
      if (journey.motivationalSupport) {
        setMotivationalSupport(journey.motivationalSupport);
      }
      
      console.log(`✅ Complete orchestrated journey generated for: ${targetSkill}`);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate complete learning journey';
      setError(errorMessage);
      console.error('Complete Journey Generation Error:', err);
      throw err;
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
      
      // Mock analysis for demo
      const correctAnswers = userAnswers.filter((answer, index) => 
        answer === assessment.questions[index]?.correctAnswer
      ).length;
      
      const score = Math.round((correctAnswers / assessment.questions.length) * 100);
      const passed = score >= (assessment.passingScore || 70);
      
      const mockResults = {
        score,
        passed,
        performance: score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement',
        feedback: `You scored ${score}% on the ${assessment.skillArea} assessment. ${
          passed 
            ? 'Great job! You demonstrate solid understanding of the concepts.' 
            : 'Consider reviewing the fundamentals and practicing more.'
        }`,
        recommendations: passed 
          ? [`Advance to intermediate ${assessment.skillArea} topics`, 'Practice real-world projects', 'Consider teaching others']
          : [`Review ${assessment.skillArea} fundamentals`, 'Take additional practice tests', 'Focus on weak areas identified'],
        timeSpent,
        totalQuestions: assessment.questions.length,
        correctAnswers
      };

      return mockResults;
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
      
      // Mock skill gap analysis for demo
      const mockGapAnalysis = {
        targetRole,
        currentSkills: ['JavaScript', 'Python', 'React'],
        requiredSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Docker', 'AWS'],
        missingSkills: ['Node.js', 'TypeScript', 'Docker', 'AWS'],
        skillMatch: 43, // percentage
        recommendations: [
          'Start with TypeScript as it builds on your JavaScript knowledge',
          'Learn Node.js to become a full-stack developer',
          'Get familiar with Docker for containerization',
          'Begin with AWS fundamentals for cloud deployment'
        ],
        estimatedTimeToReady: '4-6 months',
        priorityOrder: ['TypeScript', 'Node.js', 'Docker', 'AWS']
      };

      return mockGapAnalysis;
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
    wellnessInsights,
    motivationalSupport,
    learningResources,
    orchestratorStatus,
    error,
    
    // Enhanced Functions
    generateCompleteJourney,
    getSmartResources,
    generateAdaptiveAssessment,
    performWellnessCheck,
    getMotivationBoost,
    checkOrchestratorStatus,
    
    // Legacy Functions
    generateLearningPath,
    generateAssessment,
    analyzeAssessmentResults,
    getPersonalizedRecommendations,
    getSkillGapAnalysis,
    analyzeProgress,
    
    // Utility Functions
    clearError,
    resetState,
  };

  return (
    <AIAgentContext.Provider value={value}>
      {children}
    </AIAgentContext.Provider>
  );
};

export const useAIAgent = (): AIAgentContextType => {
  const context = useContext(AIAgentContext);
  if (context === undefined) {
    throw new Error('useAIAgent must be used within an AIAgentProvider');
  }
  return context;
};

export default AIAgentContext;