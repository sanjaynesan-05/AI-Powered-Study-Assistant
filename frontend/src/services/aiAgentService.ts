/**
 * AI Agent Service - Enhanced with integrated agents
 * Connects frontend to the orchestrated AI agents in backend
 */

import { CONFIG } from '../config/config';

// Types for AI Agent responses
export interface AIJourney {
  journey_id: string;
  target_skill: string;
  user_id: string;
  orchestrated_response: OrchestratedResponse;
  learningPath: LearningPath;
  assessment: Assessment;
  recommendations: Recommendation[];
  personalizedTips: string[];
  motivationalSupport: MotivationalSupport;
  wellnessInsights: WellnessInsights;
}

export interface OrchestratedResponse {
  greeting: string;
  study_plan: StudyPlan;
  learning_resources: LearningResources;
  wellness_insights: WellnessInsights;
  assessment: Assessment;
  motivational_support: MotivationalSupport;
  personalization_notes: PersonalizationNotes;
  calendar_events: CalendarEvent[];
  metadata: ResponseMetadata;
  ai_summary: string;
}

export interface StudyPlan {
  topic: string;
  duration: string;
  sessions: StudySession[];
  break_schedule?: BreakSchedule;
  wellness_integration?: WellnessIntegration;
  personalization_applied: boolean;
}

export interface StudySession {
  day: string;
  session_number: number;
  topic: string;
  duration: string;
  recommended_time: string;
  resources?: string[];
  learning_objectives?: string[];
  break_after?: string;
  wellness_notes?: string;
}

export interface LearningResources {
  resources: LearningResource[];
  total_found: number;
  difficulty: string;
  estimated_time: string;
  topic?: string;
}

export interface LearningResource {
  title: string;
  description: string;
  url?: string;
  platform: string;
  type: string;
  difficulty?: string;
  estimatedTime?: string;
  thumbnail?: string;
  channel?: string;
}

export interface WellnessInsights {
  fatigue_level: number;
  stress_level: number;
  emotional_state: string;
  recommendations: WellnessRecommendation[];
  wellness_breaks?: WellnessBreak[];
  activity_level?: ActivityLevel;
}

export interface WellnessRecommendation {
  type: string;
  title: string;
  description: string;
  priority: string;
  estimated_time: string;
}

export interface WellnessBreak {
  type: string;
  title: string;
  duration: string;
  description: string;
  scheduled_time?: string;
  priority: string;
}

export interface Assessment {
  available: boolean;
  quiz_id?: string;
  topic?: string;
  question_count: number;
  estimated_time: string;
  difficulty?: string;
  instructions?: string;
  questions?: QuizQuestion[];
  scoring?: QuizScoring;
}

export interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  topic_area: string;
  points: number;
}

export interface MotivationalSupport {
  primary_message: string;
  daily_affirmation: string;
  progress_celebration?: ProgressCelebration;
  next_goal: string;
  energy_boost: string;
  motivation_style?: MotivationStyle;
}

export interface ProgressCelebration {
  achievement: string;
  message: string;
  celebration_type: string;
}

export interface PersonalizationNotes {
  applied: boolean;
  learning_style?: string;
  difficulty_preference?: string;
  adaptations_made: string[];
  confidence_score: number;
  notes: string;
}

export interface ResponseMetadata {
  generated_at: string;
  agents_used: string[];
  orchestration_strategy: string;
  session_id: string;
  confidence_score: number;
}

// Legacy interfaces for backward compatibility
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  difficultyLevel: string;
  confidence: number;
  sessions?: StudySession[];
  modules?: LearningModule[];
}

export interface LearningModule {
  title: string;
  description: string;
  estimatedHours: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: string;
  type: string;
}

// Service class
class AIAgentService {
  private baseURL = CONFIG.BACKEND_URL;

  /**
   * Generate complete AI-orchestrated learning journey
   */
  async generateCompleteJourney(
    targetSkill: string, 
    userProfile: any = {}, 
    preferences: any = {}
  ): Promise<AIJourney> {
    try {
      console.log(`🚀 Generating complete journey for: ${targetSkill}`);

      const response = await fetch(`${this.baseURL}/api/ai-agents/generate-complete-journey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'userid': userProfile.userId || 'demo_user'
        },
        body: JSON.stringify({
          targetSkill,
          userProfile,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate journey');
      }

      return result.data;
    } catch (error) {
      console.error('AI Journey Generation Error:', error);
      throw new Error(`Failed to generate learning journey: ${error.message}`);
    }
  }

  /**
   * Get smart learning resources using AI
   */
  async getSmartResources(
    topic: string, 
    difficulty: string = 'intermediate',
    learningStyle: string = 'mixed'
  ): Promise<LearningResources> {
    try {
      console.log(`🔍 Getting smart resources for: ${topic}`);

      const response = await fetch(`${this.baseURL}/api/ai-agents/smart-resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify({
          topic,
          difficulty,
          learningStyle
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get resources');
      }

      return result.data;
    } catch (error) {
      console.error('Smart Resources Error:', error);
      return this.getFallbackResources(topic);
    }
  }

  /**
   * Generate adaptive assessment
   */
  async generateAdaptiveAssessment(
    skillArea: string, 
    difficulty: string = 'intermediate',
    questionCount: number = 5
  ): Promise<Assessment> {
    try {
      console.log(`📝 Generating adaptive assessment for: ${skillArea}`);

      const response = await fetch(`${this.baseURL}/api/ai-agents/adaptive-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify({
          skillArea,
          difficulty,
          questionCount
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate assessment');
      }

      return result.data;
    } catch (error) {
      console.error('Adaptive Assessment Error:', error);
      return this.getFallbackAssessment(skillArea);
    }
  }

  /**
   * Get wellness check
   */
  async getWellnessCheck(): Promise<WellnessInsights> {
    try {
      console.log('🌿 Performing wellness check');

      const response = await fetch(`${this.baseURL}/api/ai-agents/wellness-check`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get wellness check');
      }

      return result.data;
    } catch (error) {
      console.error('Wellness Check Error:', error);
      return this.getFallbackWellness();
    }
  }

  /**
   * Get motivation boost
   */
  async getMotivationBoost(context: {
    currentTopic?: string;
    performanceLevel?: string;
    emotionalState?: string;
    fatigueLevel?: number;
  } = {}): Promise<MotivationalSupport> {
    try {
      console.log(`💪 Getting motivation boost for: ${context.currentTopic || 'studies'}`);

      const response = await fetch(`${this.baseURL}/api/ai-agents/motivation-boost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify(context)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get motivation');
      }

      return result.data;
    } catch (error) {
      console.error('Motivation Boost Error:', error);
      return this.getFallbackMotivation(context.currentTopic);
    }
  }

  /**
   * Get orchestrator status
   */
  async getOrchestratorStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai-agents/orchestrator-status`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Orchestrator Status Error:', error);
      return null;
    }
  }

  /**
   * Legacy method - Generate learning journey (backward compatibility)
   */
  async generateLearningJourney(targetSkill: string, userPreferences: any = {}): Promise<LearningPath> {
    try {
      const journey = await this.generateCompleteJourney(targetSkill, {}, userPreferences);
      return journey.learningPath;
    } catch (error) {
      console.error('Legacy Journey Generation Error:', error);
      return this.getFallbackLearningPath(targetSkill);
    }
  }

  // Utility methods
  private getAuthHeader(): string {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
  }

  // Fallback methods for error cases
  private getFallbackResources(topic: string): LearningResources {
    return {
      resources: [
        {
          title: `${topic} - Getting Started Guide`,
          description: `Learn the fundamentals of ${topic} with this comprehensive guide`,
          platform: 'Learning Hub',
          type: 'tutorial',
          difficulty: 'beginner'
        },
        {
          title: `Interactive ${topic} Workshop`,
          description: `Hands-on practice with ${topic} concepts and examples`,
          platform: 'Code Playground',
          type: 'interactive',
          difficulty: 'intermediate'
        }
      ],
      total_found: 2,
      difficulty: 'intermediate',
      estimated_time: '2 hours',
      topic
    };
  }

  private getFallbackAssessment(skillArea: string): Assessment {
    return {
      available: true,
      quiz_id: `fallback_${Date.now()}`,
      topic: skillArea,
      question_count: 3,
      estimated_time: '5 minutes',
      difficulty: 'intermediate',
      instructions: 'Answer the following questions to assess your understanding.',
      questions: [
        {
          id: 1,
          type: 'multiple-choice',
          question: `What is the most important aspect of learning ${skillArea}?`,
          options: [
            'A) Understanding core concepts',
            'B) Memorizing syntax',
            'C) Speed of completion',
            'D) Using advanced tools'
          ],
          correct_answer: 'A) Understanding core concepts',
          explanation: 'Understanding core concepts provides a solid foundation for mastering any subject.',
          difficulty: 'intermediate',
          topic_area: skillArea,
          points: 10
        }
      ]
    };
  }

  private getFallbackWellness(): WellnessInsights {
    return {
      fatigue_level: 0.3,
      stress_level: 0.2,
      emotional_state: 'focused',
      recommendations: [
        {
          type: 'immediate',
          title: 'Take a Short Break',
          description: 'Step away for 5-10 minutes to refresh your mind',
          priority: 'medium',
          estimated_time: '5-10 minutes'
        },
        {
          type: 'wellness',
          title: 'Stay Hydrated',
          description: 'Drink water regularly to maintain focus and energy',
          priority: 'low',
          estimated_time: 'Ongoing'
        }
      ]
    };
  }

  private getFallbackMotivation(topic: string = 'studies'): MotivationalSupport {
    return {
      primary_message: `You're making great progress with ${topic}! Every step forward builds your expertise.`,
      daily_affirmation: 'You have the power to learn anything you set your mind to.',
      next_goal: 'Complete your next learning session',
      energy_boost: 'Your curiosity and dedication are your superpowers!'
    };
  }

  private getFallbackLearningPath(targetSkill: string): LearningPath {
    return {
      id: `fallback_path_${Date.now()}`,
      title: `Learn ${targetSkill}`,
      description: `A structured approach to mastering ${targetSkill}`,
      estimatedDuration: '4-6 weeks',
      difficultyLevel: 'intermediate',
      confidence: 0.75,
      modules: [
        {
          title: `${targetSkill} Fundamentals`,
          description: `Core concepts and principles of ${targetSkill}`,
          estimatedHours: 10
        },
        {
          title: `Practical ${targetSkill}`,
          description: `Hands-on practice and real-world applications`,
          estimatedHours: 15
        }
      ]
    };
  }
}

// Export singleton instance
export const aiAgentService = new AIAgentService();

// Export types for use in components
export type {
  AIJourney,
  OrchestratedResponse,
  StudyPlan,
  StudySession,
  LearningResources,
  LearningResource,
  WellnessInsights,
  Assessment,
  MotivationalSupport,
  LearningPath,
  Recommendation
};