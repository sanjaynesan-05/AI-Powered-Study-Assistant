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
import { 
  pythonAIService,
  PythonAIResponse,
  StudyPlanRequest,
  LearningResourcesRequest,
  AssessmentRequest,
  WellnessRequest,
  ScheduleOptimizationRequest,
  MotivationRequest
} from '../services/pythonAIService';

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
  
  // Python AI Agent Functions (NEW - Direct access to your Python agents)
  pythonGenerateStudyPlan: (request: StudyPlanRequest) => Promise<PythonAIResponse>;
  pythonGetLearningResources: (request: LearningResourcesRequest) => Promise<PythonAIResponse>;
  pythonGenerateAssessment: (request: AssessmentRequest) => Promise<PythonAIResponse>;
  pythonGetWellnessAssessment: (request: WellnessRequest) => Promise<PythonAIResponse>;
  pythonOptimizeSchedule: (request: ScheduleOptimizationRequest) => Promise<PythonAIResponse>;
  pythonGetMotivationBoost: (request: MotivationRequest) => Promise<PythonAIResponse>;
  pythonGetPersonalization: (request: any) => Promise<PythonAIResponse>;
  pythonHealthCheck: () => Promise<PythonAIResponse>;
  
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

  // Python AI Agent Functions (Direct access to your Python agents)
  const pythonGenerateStudyPlan = async (request: StudyPlanRequest): Promise<PythonAIResponse> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await pythonAIService.generateStudyPlan(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const pythonGetLearningResources = async (request: LearningResourcesRequest): Promise<PythonAIResponse> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await pythonAIService.getLearningResources(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to get learning resources');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const pythonGenerateAssessment = async (request: AssessmentRequest): Promise<PythonAIResponse> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await pythonAIService.generateAssessment(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to generate assessment');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const pythonGetWellnessAssessment = async (request: WellnessRequest): Promise<PythonAIResponse> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await pythonAIService.getWellnessAssessment(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to get wellness assessment');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const pythonOptimizeSchedule = async (request: ScheduleOptimizationRequest): Promise<PythonAIResponse> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await pythonAIService.optimizeSchedule(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to optimize schedule');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const pythonGetMotivationBoost = async (request: MotivationRequest): Promise<PythonAIResponse> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await pythonAIService.getMotivationBoost(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to get motivation boost');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const pythonGetPersonalization = async (request: any): Promise<PythonAIResponse> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await pythonAIService.getPersonalization(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to get personalization');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const pythonHealthCheck = async (): Promise<PythonAIResponse> => {
    try {
      const response = await pythonAIService.healthCheck();
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to check Python AI service health');
      throw err;
    }
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

  /**
   * Generate complete AI-orchestrated learning journey
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
          ...journey.assessment,
          topic: journey.assessment.topic || `${targetSkill} Assessment`,
          instructions: journey.assessment.instructions || `Adaptive assessment for ${targetSkill}`,
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
        ...assessmentData,
        topic: assessmentData.topic || `${skillArea} Assessment`,
        instructions: assessmentData.instructions || `Adaptive assessment for ${skillArea}`,
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

  /**
   * Generate a personalized learning path using AI (Legacy)
   */
  const generateLearningPath = async (
    targetSkill: string, 
    difficulty: string = 'beginner', 
    preferences: any = {}
  ): Promise<LearningPath | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const payload = {
        target_skill: targetSkill,
        difficulty_level: difficulty,
        user_preferences: preferences
      };
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/generate-learning-path', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (response.success && response.learningPath) {
        const newLearningPath: LearningPath = response.learningPath;
        
        setLearningPaths(prev => {
          const filtered = prev.filter(path => path.id !== newLearningPath.id);
          return [...filtered, newLearningPath];
        });
        
        return newLearningPath;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning path');
      console.error('Learning Path Generation Error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate an assessment using AI (Legacy)
   */
  const generateAssessment = async (
    skillArea: string,
    difficulty: string = 'intermediate',
    questionCount: number = 10
  ): Promise<Assessment | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const payload = {
        skill_area: skillArea,
        difficulty_level: difficulty,
        question_count: questionCount
      };
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/generate-assessment', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (response.success && response.assessment) {
        const newAssessment: Assessment = response.assessment;
        setAssessments(prev => [...prev, newAssessment]);
        return newAssessment;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to generate assessment');
      console.error('Assessment Generation Error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Analyze assessment results using AI (Legacy)
   */
  const analyzeAssessmentResults = async (
    userAnswers: any[],
    assessment: Assessment,
    timeSpent: number = 0
  ): Promise<any> => {
    try {
      setError(null);
      
      // Calculate basic score
      const correctAnswers = userAnswers.filter((answer, index) => 
        answer === assessment.questions?.[index]?.correct_answer
      ).length;
      
      const totalQuestions = assessment.questions?.length || 1;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= 70;
      
      const analysis = {
        score,
        passed,
        correctAnswers,
        totalQuestions,
        timeSpent,
        feedback: `You scored ${score}% on the assessment. ${
          passed ? 'Congratulations! You passed.' : 'Keep practicing to improve your skills.'
        }`,
        recommendations: passed 
          ? ['Advance to intermediate topics', 'Practice real-world projects', 'Consider teaching others']
          : ['Review fundamentals', 'Practice more exercises', 'Seek additional resources']
      };
      
      // Send to backend for AI analysis
      const payload = {
        user_answers: userAnswers,
        assessment_quiz_id: assessment.quiz_id || 'unknown',
        time_spent: timeSpent,
        basic_analysis: analysis
      };
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/analyze-assessment', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      return response.analysis || analysis;
    } catch (err: any) {
      console.error('Assessment Analysis Error:', err);
      return {
        score: 0,
        passed: false,
        feedback: 'Unable to analyze assessment results',
        recommendations: ['Try again later']
      };
    }
  };

  /**
   * Get personalized recommendations (Legacy)
   */
  const getPersonalizedRecommendations = async (): Promise<void> => {
    try {
      setError(null);
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/recommendations', {
        method: 'GET',
      });
      
      if (response.success && response.recommendations) {
        setRecommendations(response.recommendations);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
      console.error('Recommendations Error:', err);
    }
  };

  /**
   * Get skill gap analysis (Legacy)
   */
  const getSkillGapAnalysis = async (targetRole: string): Promise<any> => {
    try {
      setError(null);
      
      const payload = { target_role: targetRole };
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/skill-gap-analysis', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      return response.analysis || null;
    } catch (err: any) {
      setError(err.message || 'Failed to get skill gap analysis');
      console.error('Skill Gap Analysis Error:', err);
      return null;
    }
  };

  /**
   * Analyze learning progress (Legacy)
   */
  const analyzeProgress = async (pathId: string, progressData: any): Promise<any> => {
    try {
      setError(null);
      
      const payload = {
        path_id: pathId,
        progress_data: progressData
      };
      
      const response = await makeAuthenticatedRequest('/api/ai-agents/analyze-progress', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      return response.analysis || null;
    } catch (err: any) {
      setError(err.message || 'Failed to analyze progress');
      console.error('Progress Analysis Error:', err);
      return null;
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
    
    // Python AI Agent Functions (NEW - Direct access to your Python agents)
    pythonGenerateStudyPlan,
    pythonGetLearningResources,
    pythonGenerateAssessment,
    pythonGetWellnessAssessment,
    pythonOptimizeSchedule,
    pythonGetMotivationBoost,
    pythonGetPersonalization,
    pythonHealthCheck,
    
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