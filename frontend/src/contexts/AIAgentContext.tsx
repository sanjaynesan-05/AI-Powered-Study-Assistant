import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { aiAgentService } from '../services/aiAgentService';
import { ChatMessage, ActionType } from '../types/chat';
import { advancedAILearningService, LearningObjective } from '../services/advancedAILearningService';
import { enhancedLearningPathService, EnhancedLearningPath } from '../services/enhancedLearningPathService';

export interface AIJourney {
  id?: string;
  learningPath?: LearningPath;
  assessment?: Assessment;
  recommendations?: Recommendation[];
  wellnessInsights?: WellnessInsights;
  motivationalSupport?: MotivationalSupport;
}
export interface LearningPath { id: string; title: string; modules: any[]; }
export interface Assessment { quiz_id?: string; topic: string; instructions: string; questions?: any[]; available?: boolean; }
export interface Recommendation { id: string; title: string; type: string; }
export interface WellnessInsights { status: string; recommendations: string[]; }
export interface MotivationalSupport { message: string; type: string; }
export interface LearningResources { title: string; platform: string; url: string; }

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
import { PYTHON_AI_CONFIG } from '../config/config';

interface AIAgentContextType {
  // Common State
  isGenerating: boolean;
  error: string | null;
  clearError: () => void;
  resetState: () => void;

  // AI Mentor State (PERSISTED)
  mentorMessages: ChatMessage[];
  setMentorMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  selectedMentorTopic: string;
  setSelectedMentorTopic: (topic: string) => void;
  clearMentorHistory: () => void;
  
  // Learning Hub State (PERSISTED)
  enhancedPaths: any[];
  setEnhancedPaths: React.Dispatch<React.SetStateAction<any[]>>;
  learningPaths: LearningPath[]; // Basic AI paths
  
  // Original State
  currentJourney: AIJourney | null;
  assessments: Assessment[];
  recommendations: Recommendation[];
  wellnessInsights: WellnessInsights | null;
  motivationalSupport: MotivationalSupport | null;
  learningResources: LearningResources | null;
  activeAssessment: Assessment | null;
  setActiveAssessment: (assessment: Assessment | null) => void;
  orchestratorStatus: any | null;
  
  // Shared Actions
  generateCompleteJourney: (targetSkill: string, userProfile?: any, preferences?: any) => Promise<void>;
  generateEnhancedJourney: (targetSkill: string, difficulty?: string, preferences?: any) => Promise<void>;
  getSmartResources: (topic: string, difficulty?: string) => Promise<void>;
  generateAdaptiveAssessment: (skillArea: string, difficulty?: string, questionCount?: number) => Promise<void>;
  
  // Python AI Agent Functions
  pythonGenerateStudyPlan: (request: StudyPlanRequest) => Promise<PythonAIResponse>;
  pythonGetLearningResources: (request: LearningResourcesRequest) => Promise<PythonAIResponse>;
  pythonGenerateAssessment: (request: AssessmentRequest) => Promise<PythonAIResponse>;
  pythonGetWellnessAssessment: (request: WellnessRequest) => Promise<PythonAIResponse>;
  pythonOptimizeSchedule: (request: ScheduleOptimizationRequest) => Promise<PythonAIResponse>;
  pythonGetMotivationBoost: (request: MotivationRequest) => Promise<PythonAIResponse>;
  pythonGetPersonalization: (request: any) => Promise<PythonAIResponse>;
  pythonHealthCheck: () => Promise<PythonAIResponse>;
  
  // Legacy Functions
  generateLearningPath: (targetSkill: string, difficulty?: string, preferences?: any) => Promise<LearningPath | null>;
  generateAssessment: (skillArea: string, difficulty?: string, questionCount?: number) => Promise<Assessment | null>;
  analyzeAssessmentResults: (userAnswers: any[], assessment: Assessment, timeSpent?: number) => Promise<any>;
  getPersonalizedRecommendations: () => Promise<void>;
  getSkillGapAnalysis: (targetRole: string) => Promise<any>;
  analyzeProgress: (pathId: string, progressData: any) => Promise<any>;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export const AIAgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ─── 1. CORE STATE ──────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── 2. AI MENTOR PERSISTED STATE ───────────────────────────────────
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ai_study_mentor_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure timestamps are Date objects
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) { return []; }
    }
    return [];
  });
  
  const [selectedMentorTopic, setSelectedMentorTopic] = useState<string>(() => {
    return localStorage.getItem('ai_study_mentor_topic') || 'General Conversation';
  });

  // ─── 3. LEARNING HUB PERSISTED STATE ────────────────────────────────
  const [enhancedPaths, setEnhancedPaths] = useState<any[]>(() => {
    const saved = localStorage.getItem('ai_study_enhanced_paths');
    return saved ? JSON.parse(saved) : [];
  });
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  // ─── 4. OTHER STATES ───────────────────────────────────────────────
  const [currentJourney, setCurrentJourney] = useState<AIJourney | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [wellnessInsights, setWellnessInsights] = useState<WellnessInsights | null>(null);
  const [motivationalSupport, setMotivationalSupport] = useState<MotivationalSupport | null>(null);
  const [learningResources, setLearningResources] = useState<LearningResources | null>(null);
  
  // ─── 4. MOCK TEST PERSISTED STATE ────────────────────────────────────
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(() => {
    const saved = localStorage.getItem('ai_study_active_assessment');
    return saved ? JSON.parse(saved) : null;
  });

  const [orchestratorStatus, setOrchestratorStatus] = useState<any | null>(null);

  // ─── 5. PERSISTENCE EFFECTS ────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('ai_study_mentor_messages', JSON.stringify(mentorMessages));
  }, [mentorMessages]);

  useEffect(() => {
    localStorage.setItem('ai_study_mentor_topic', selectedMentorTopic);
  }, [selectedMentorTopic]);

  useEffect(() => {
    localStorage.setItem('ai_study_enhanced_paths', JSON.stringify(enhancedPaths));
  }, [enhancedPaths]);

  useEffect(() => {
    localStorage.setItem('ai_study_active_assessment', JSON.stringify(activeAssessment));
  }, [activeAssessment]);

  const clearMentorHistory = () => {
    setMentorMessages([]);
    localStorage.removeItem('ai_study_mentor_messages');
  };

  const clearError = () => setError(null);

  const resetState = () => {
    setCurrentJourney(null);
    setLearningPaths([]);
    setAssessments([]);
    setActiveAssessment(null);
    setRecommendations([]);
    setWellnessInsights(null);
    setMotivationalSupport(null);
    setLearningResources(null);
    setError(null);
  };

  // ─── 6. UNIVERSAL ACTIONS ───────────────────────────────────────────
  
  /**
   * Universal Enhanced Journey Generation (Shared between Mentor and Hub)
   */
  const generateEnhancedJourney = async (targetSkill: string, difficulty: string = 'beginner', preferences: any = {}) => {
    if (!targetSkill) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`🚀 Generating ENHANCED journey for: ${targetSkill}`);
      
      const objective: LearningObjective = {
        skill: targetSkill,
        currentLevel: difficulty as 'beginner' | 'intermediate' | 'advanced',
        targetLevel: difficulty === 'beginner' ? 'intermediate' : 'advanced' as any,
        timeframe: `${preferences.timeCommitment || 10} weeks`,
        learningStyle: preferences.learningStyle || 'mixed',
        careerGoals: preferences.careerGoals ? [preferences.careerGoals] : ['General improvement']
      };

      // 1. Generate path structure using Advanced AI Service
      const enhancedTopics = await advancedAILearningService.generateIntelligentLearningPath(objective);

      // 2. Build the new path object
      const newPath = {
        id: `enhanced-${Date.now()}`,
        title: `AI-Enhanced ${targetSkill} Mastery`,
        description: `Comprehensive AI-powered learning journey for ${targetSkill} with personalized content`,
        progress: 0,
        totalTopics: enhancedTopics.length,
        completedTopics: 0,
        difficulty: difficulty,
        category: targetSkill,
        estimatedDuration: '10-14 weeks',
        rating: 4.9,
        topics: enhancedTopics.map(topic => ({
          id: topic.id,
          name: topic.title,
          completed: false,
          hasVideo: topic.videos.length > 0,
          hasArticle: topic.articles.length > 0,
          videoUrl: topic.videos[0]?.videoUrl || '',
          articleUrl: topic.articles[0]?.url || '',
          estimatedTime: topic.estimatedTime,
          description: topic.description,
          exercises: topic.exercises,
          assessmentQuestions: topic.assessmentQuestions
        }))
      };

      // 3. Save to global state (persisted to localStorage via effect)
      setEnhancedPaths(prev => {
        // Prevent duplicate titles
        if (prev.find(p => p.title === newPath.title)) return prev;
        return [newPath, ...prev];
      });

      console.log(`✅ Enhanced journey ready for: ${targetSkill}`);
    } catch (err: any) {
      console.error('Enhanced journey generation failed:', err);
      setError(err.message || 'Failed to generate enhanced journey');
      
      // Fallback: regular journey generation
      await generateCompleteJourney(targetSkill);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCompleteJourney = async (targetSkill: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      const [newPath, newAssessment] = await Promise.all([
        generateLearningPath(targetSkill, "intermediate", {}),
        generateAssessment(targetSkill, "intermediate", 5)
      ]);

      if (newPath) {
        setLearningPaths(prev => [...prev.filter(p => p.id !== newPath.id), newPath]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed basic journey generation');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── 7. PYTHON AI AGENT FUNCTIONS ──────────────────────────────────────
  const pythonGenerateStudyPlan = async (request: StudyPlanRequest) => {
    setIsGenerating(true);
    try { return await pythonAIService.generateStudyPlan(request); }
    finally { setIsGenerating(false); }
  };
  
  const pythonGetLearningResources = async (request: LearningResourcesRequest) => {
    setIsGenerating(true);
    try { return await pythonAIService.getLearningResources(request); }
    finally { setIsGenerating(false); }
  };

  const pythonGenerateAssessment = async (request: AssessmentRequest) => {
    setIsGenerating(true);
    try { return await pythonAIService.generateAssessment(request); }
    finally { setIsGenerating(false); }
  };
  
  const generateAdaptiveAssessment = async (skillArea: string, difficulty: string = 'intermediate', questionCount: number = 15) => {
    setIsGenerating(true);
    setError(null);
    try {
      console.log(`🎯 Generating ADAPTIVE ASSESSMENT for: ${skillArea} (Count: ${questionCount})`);
      
      // Call the existing backend generation logic
      const assessment = await generateAssessment(skillArea, difficulty, questionCount);
      
      console.log('📡 Backend Response for Assessment:', assessment);

      if (assessment) {
        const fullAssessment = {
          ...assessment,
          topic: skillArea,
          available: true
        };
        
        console.log('💾 Setting Active Assessment:', fullAssessment);
        setActiveAssessment(fullAssessment);
        
        // Manual local storage sync for safety in background calls
        localStorage.setItem('ai_study_active_assessment', JSON.stringify(fullAssessment));
        
        console.log("✅ Adaptive assessment ready and persisted.");
      } else {
        throw new Error("Failed to generate assessment content from backend.");
      }
    } catch (err: any) {
      console.error('Assessment generation failed:', err);
      setError(err.message || 'Failed to generate assessment');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const pythonGetWellnessAssessment = async (request: WellnessRequest) => {
    setIsGenerating(true);
    try { return await pythonAIService.getWellnessAssessment(request); }
    finally { setIsGenerating(false); }
  };

  const pythonOptimizeSchedule = async (request: ScheduleOptimizationRequest) => {
    setIsGenerating(true);
    try { return await pythonAIService.optimizeSchedule(request); }
    finally { setIsGenerating(false); }
  };

  const pythonGetMotivationBoost = async (request: MotivationRequest) => {
    setIsGenerating(true);
    try { return await pythonAIService.getMotivationBoost(request); }
    finally { setIsGenerating(false); }
  };

  const pythonGetPersonalization = async (request: any) => {
    setIsGenerating(true);
    try { return await pythonAIService.getPersonalization(request); }
    finally { setIsGenerating(false); }
  };

  const pythonHealthCheck = async () => {
    return await pythonAIService.healthCheck();
  };

  // ─── 8. INDIVIDUAL AGENT ACTIONS ────────────────────────────────────────
  const getSmartResources = async (topic: string, difficulty: string = 'intermediate') => {
    setIsGenerating(true);
    try { setLearningResources({ title: topic, platform: 'Search', url: '#' }); }
    finally { setIsGenerating(false); }
  };


  const performWellnessCheck = async () => {
    setWellnessInsights({ status: 'stable', recommendations: ['Take a break'] });
  };

  const getMotivationBoost = async () => {
    setMotivationalSupport({ message: 'Keep going!', type: 'boost' });
  };

  const checkOrchestratorStatus = async () => {
    setOrchestratorStatus({ operational: true });
  };

  // ─── 9. LEGACY FUNCTIONS (BACKEND SYNC) ──────────────────────────────────
  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const baseUrl = PYTHON_AI_CONFIG.BASE_URL;
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  const generateLearningPath = async (targetSkill: string, difficulty: string, preferences: any) => {
    try {
      const response = await makeAuthenticatedRequest('/api/ai-agents/generate-learning-path', {
        method: 'POST',
        body: JSON.stringify({ target_skill: targetSkill, difficulty_level: difficulty, user_preferences: preferences }),
      });
      return response.learningPath || null;
    } catch { return null; }
  };

  const generateAssessment = async (skillArea: string, difficulty: string, questionCount: number) => {
    try {
      const response = await makeAuthenticatedRequest('/api/ai-agents/generate-assessment', {
        method: 'POST',
        body: JSON.stringify({ skill_area: skillArea, difficulty_level: difficulty, question_count: questionCount }),
      });
      return response.assessment || null;
    } catch { return null; }
  };

  const analyzeAssessmentResults = async (userAnswers: any[], assessment: Assessment) => {
    return { score: 80, passed: true };
  };

  const getPersonalizedRecommendations = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/ai-agents/recommendations', { method: 'GET' });
      if (response.success) setRecommendations(response.recommendations);
    } catch {}
  };

  const getSkillGapAnalysis = async (targetRole: string) => null;
  const analyzeProgress = async () => null;

  const value: AIAgentContextType = {
    isGenerating, error, clearError, resetState,
    mentorMessages, setMentorMessages, selectedMentorTopic, setSelectedMentorTopic, clearMentorHistory,
    enhancedPaths, setEnhancedPaths, learningPaths,
    currentJourney, assessments, recommendations, wellnessInsights, motivationalSupport, learningResources, activeAssessment, setActiveAssessment, orchestratorStatus,
    generateCompleteJourney, generateEnhancedJourney, getSmartResources, generateAdaptiveAssessment,
    pythonGenerateStudyPlan, pythonGetLearningResources, pythonGenerateAssessment, pythonGetWellnessAssessment, pythonOptimizeSchedule, pythonGetMotivationBoost, pythonGetPersonalization, pythonHealthCheck,
    generateLearningPath, generateAssessment, analyzeAssessmentResults, getPersonalizedRecommendations, getSkillGapAnalysis, analyzeProgress
  };

  return <AIAgentContext.Provider value={value}>{children}</AIAgentContext.Provider>;
};

export const useAIAgent = (): AIAgentContextType => {
  const context = useContext(AIAgentContext);
  if (context === undefined) throw new Error('useAIAgent must be used within an AIAgentProvider');
  return context;
};

export default AIAgentContext;