// Advanced AI Learning Agent Service
import { youtubeService, YouTubeVideo } from './youtubeService';
import { PYTHON_AI_CONFIG } from '../config/config';

interface LearningObjective {
  skill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  targetLevel: 'intermediate' | 'advanced' | 'expert';
  timeframe: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  careerGoals: string[];
}

interface EnhancedTopic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  prerequisites: string[];
  learningOutcomes: string[];
  videos: YouTubeVideo[];
  articles: ArticleResource[];
  exercises: Exercise[];
  assessmentQuestions: AssessmentQuestion[];
  nextTopics: string[];
}

interface ArticleResource {
  id: string;
  title: string;
  url: string;
  source: string;
  readingTime: string;
  difficulty: string;
  tags: string[];
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'project' | 'reading';
  difficulty: string;
  estimatedTime: string;
  instructions: string[];
  hints: string[];
  solution?: string;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'coding' | 'short_answer' | 'true_false';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: string;
}

class AdvancedAILearningService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Updated to use Python Flask backend
    this.baseUrl = PYTHON_AI_CONFIG.BASE_URL;
    this.timeout = 30000; // 30 seconds timeout
  }

  // Generate comprehensive learning path with AI
  async generateIntelligentLearningPath(objective: LearningObjective): Promise<EnhancedTopic[]> {
    try {
      // Use Python backend learning resources endpoint
      const response = await this.makeAIRequest(PYTHON_AI_CONFIG.ENDPOINTS.LEARNING_RESOURCES, {
        skill: objective.skill,
        current_level: objective.currentLevel,
        target_level: objective.targetLevel,
        learning_style: objective.learningStyle,
        career_goals: objective.careerGoals,
        timeframe: objective.timeframe,
        include_videos: true,
        include_articles: true,
        include_exercises: true,
        include_assessment: true
      });

      // Transform Python backend response to EnhancedTopic format
      const enhancedTopics: EnhancedTopic[] = response.data?.topics?.map((topic: any) => ({
        id: topic.id || `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: topic.title || topic.name,
        description: topic.description || `Master ${topic.title || topic.name} concepts`,
        difficulty: topic.difficulty || objective.currentLevel,
        estimatedTime: topic.estimated_time || topic.time_estimate || this.calculateEstimatedTime(topic.title || topic.name),
        prerequisites: topic.prerequisites || [],
        learningOutcomes: topic.learning_outcomes || this.generateLearningOutcomes(topic.title || topic.name),
        videos: topic.videos || [],
        articles: topic.articles || [],
        exercises: topic.exercises || [],
        assessmentQuestions: topic.assessment_questions || [],
        nextTopics: topic.next_topics || []
      })) || [];

      return enhancedTopics.length > 0 ? enhancedTopics : this.getFallbackLearningPath(objective.skill);

    } catch (error) {
      console.error('AI Learning Path Generation Error:', error);
      return this.getFallbackLearningPath(objective.skill);
    }
  }

  // Get AI-curated articles (fallback method)
  private async getAICuratedArticles(topicTitle: string, skill: string): Promise<ArticleResource[]> {
    const curatedArticles: Record<string, ArticleResource[]> = {
      'javascript': [
        {
          id: 'mdn_js_basics',
          title: 'JavaScript Basics - MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics',
          source: 'Mozilla Developer Network',
          readingTime: '15 minutes',
          difficulty: 'beginner',
          tags: ['javascript', 'basics', 'fundamentals']
        },
        {
          id: 'js_info_fundamentals',
          title: 'The Modern JavaScript Tutorial',
          url: 'https://javascript.info/first-steps',
          source: 'javascript.info',
          readingTime: '30 minutes',
          difficulty: 'beginner',
          tags: ['javascript', 'modern', 'es6']
        }
      ],
      'react': [
        {
          id: 'react_docs_tutorial',
          title: 'Tutorial: Intro to React',
          url: 'https://reactjs.org/tutorial/tutorial.html',
          source: 'React Official Documentation',
          readingTime: '45 minutes',
          difficulty: 'beginner',
          tags: ['react', 'tutorial', 'components']
        },
        {
          id: 'react_hooks_guide',
          title: 'Introducing Hooks',
          url: 'https://reactjs.org/docs/hooks-intro.html',
          source: 'React Official Documentation',
          readingTime: '20 minutes',
          difficulty: 'intermediate',
          tags: ['react', 'hooks', 'state']
        }
      ]
    };

    const skillKey = skill.toLowerCase();
    return curatedArticles[skillKey] || [
      {
        id: 'generic_article',
        title: `${topicTitle} - Comprehensive Guide`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topicTitle + ' tutorial guide')}`,
        source: 'Web Search',
        readingTime: '20 minutes',
        difficulty: 'intermediate',
        tags: [skill.toLowerCase(), 'tutorial']
      }
    ];
  }

  // AI-powered progress tracking and recommendations
  async getPersonalizedRecommendations(userId: string, completedTopics: string[], currentProgress: any): Promise<any> {
    try {
      const response = await this.makeAIRequest(PYTHON_AI_CONFIG.ENDPOINTS.PERSONALIZATION, {
        user_id: userId,
        completed_topics: completedTopics,
        current_progress: currentProgress,
        include_next_steps: true,
        include_skill_gaps: true,
        include_career_advice: true
      });

      return response.data || this.getFallbackRecommendations(completedTopics);
    } catch (error) {
      console.error('Personalized recommendations error:', error);
      return this.getFallbackRecommendations(completedTopics);
    }
  }

  // Real-time learning analytics with AI
  async analyzeLearningProgress(learningData: any): Promise<any> {
    try {
      const response = await this.makeAIRequest(PYTHON_AI_CONFIG.ENDPOINTS.ASSESSMENT, {
        ...learningData,
        include_insights: true,
        include_optimizations: true,
        include_predictions: true
      });

      return response.data || { insights: [], optimizations: [], predictions: [] };
    } catch (error) {
      console.error('Learning progress analysis error:', error);
      return { insights: [], optimizations: [], predictions: [] };
    }
  }

  // AI-powered adaptive learning path adjustment
  async adaptLearningPath(currentPath: EnhancedTopic[], userPerformance: any, preferences: any): Promise<EnhancedTopic[]> {
    try {
      const response = await this.makeAIRequest(PYTHON_AI_CONFIG.ENDPOINTS.PERSONALIZATION, {
        current_path: currentPath,
        user_performance: userPerformance,
        preferences,
        optimize_for_weak_areas: true,
        maintain_motivation: true,
        adapt_path: true
      });

      return response.data?.adapted_path || currentPath;
    } catch (error) {
      console.error('Learning path adaptation error:', error);
      return currentPath;
    }
  }

  // Utility methods
  private async makeAIRequest(endpoint: string, data: any): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ AI Request Error:', error);
      throw error;
    }
  }

  private calculateEstimatedTime(topicTitle: string): string {
    const complexityKeywords = ['advanced', 'complex', 'deep', 'comprehensive'];
    const isComplex = complexityKeywords.some(keyword => 
      topicTitle.toLowerCase().includes(keyword)
    );
    return isComplex ? '4-6 hours' : '2-3 hours';
  }

  private generateLearningOutcomes(topicTitle: string): string[] {
    return [
      `Understand core concepts of ${topicTitle}`,
      `Apply ${topicTitle} in practical scenarios`,
      `Solve problems using ${topicTitle} techniques`,
      `Explain ${topicTitle} concepts to others`
    ];
  }

  private getFallbackLearningPath(skill: string): EnhancedTopic[] {
    // Fallback learning path when AI is unavailable
    return [
      {
        id: 'fallback_1',
        title: `${skill} Fundamentals`,
        description: `Learn the basic concepts and principles of ${skill}`,
        difficulty: 'beginner',
        estimatedTime: '2-3 hours',
        prerequisites: [],
        learningOutcomes: [
          `Understand ${skill} basics`,
          'Apply fundamental concepts',
          'Build simple projects'
        ],
        videos: youtubeService.getCuratedVideos(skill),
        articles: [],
        exercises: [],
        assessmentQuestions: [],
        nextTopics: []
      }
    ];
  }

  private createFallbackTopic(topic: any): EnhancedTopic {
    return {
      id: topic.id || 'fallback_topic',
      title: topic.title || 'Learning Topic',
      description: topic.description || 'Learn essential concepts and skills',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      prerequisites: [],
      learningOutcomes: [],
      videos: [],
      articles: [],
      exercises: [],
      assessmentQuestions: [],
      nextTopics: []
    };
  }

  private getFallbackExercises(topicTitle: string): Exercise[] {
    return [
      {
        id: 'exercise_1',
        title: `${topicTitle} Practice Exercise`,
        description: `Practice your understanding of ${topicTitle}`,
        type: 'coding',
        difficulty: 'beginner',
        estimatedTime: '30 minutes',
        instructions: [
          'Read the topic material',
          'Follow the examples',
          'Complete the practice problems'
        ],
        hints: ['Start with the basics', 'Use online resources for help'],
        solution: 'Solution will be provided after completion'
      }
    ];
  }

  private getFallbackAssessmentQuestions(topicTitle: string): AssessmentQuestion[] {
    return [
      {
        id: 'q1',
        question: `What are the key concepts in ${topicTitle}?`,
        type: 'short_answer',
        correctAnswer: 'Comprehensive answer explaining key concepts',
        explanation: `This question tests understanding of ${topicTitle} fundamentals`,
        difficulty: 'intermediate'
      }
    ];
  }

  private getFallbackRecommendations(completedTopics: string[]): any {
    return {
      nextSteps: ['Continue with intermediate topics', 'Practice more exercises'],
      skillGaps: ['Need more hands-on practice', 'Could benefit from real projects'],
      recommendations: ['Take on a project', 'Join coding communities']
    };
  }
}

export const advancedAILearningService = new AdvancedAILearningService();
export type { LearningObjective, EnhancedTopic, ArticleResource, Exercise, AssessmentQuestion };