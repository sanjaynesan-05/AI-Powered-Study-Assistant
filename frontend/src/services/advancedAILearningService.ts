// Advanced AI Learning Agent Service
import { youtubeService, YouTubeVideo } from './youtubeService';

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
  private aiAgentEndpoint = 'http://localhost:5001/api/ai-agents';

  // Generate comprehensive learning path with AI
  async generateIntelligentLearningPath(objective: LearningObjective): Promise<EnhancedTopic[]> {
    try {
      // Step 1: Use AI to analyze learning objective
      const analysisResponse = await this.makeAIRequest('/analyze-learning-objective', {
        objective,
        includePrerequisites: true,
        includeProgressionPath: true,
        includeTimeEstimates: true
      });

      // Step 2: Generate topic structure with AI
      const topicsResponse = await this.makeAIRequest('/generate-topic-structure', {
        analysis: analysisResponse.data,
        detailLevel: 'comprehensive',
        includeAssessments: true
      });

      // Step 3: Enhance each topic with multimedia resources
      const enhancedTopics: EnhancedTopic[] = [];
      
      for (const topic of topicsResponse.data.topics) {
        const enhancedTopic = await this.enhanceTopicWithResources(topic, objective);
        enhancedTopics.push(enhancedTopic);
      }

      return enhancedTopics;

    } catch (error) {
      console.error('AI Learning Path Generation Error:', error);
      return this.getFallbackLearningPath(objective.skill);
    }
  }

  // Enhance topic with AI-curated resources
  private async enhanceTopicWithResources(topic: any, objective: LearningObjective): Promise<EnhancedTopic> {
    try {
      // Get AI-curated video recommendations
      const videos = await youtubeService.searchEducationalVideos({
        query: `${topic.title} ${objective.skill} tutorial`,
        maxResults: 3,
        duration: 'medium'
      });

      // Get AI-curated article recommendations
      const articles = await this.getAICuratedArticles(topic.title, objective.skill);

      // Generate AI-powered exercises
      const exercises = await this.generateAIExercises(topic, objective);

      // Generate AI assessment questions
      const assessmentQuestions = await this.generateAIAssessment(topic, objective);

      return {
        id: topic.id || `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: topic.title,
        description: topic.description || `Master ${topic.title} concepts and practical applications`,
        difficulty: topic.difficulty || objective.currentLevel,
        estimatedTime: topic.estimatedTime || this.calculateEstimatedTime(topic.title),
        prerequisites: topic.prerequisites || [],
        learningOutcomes: topic.learningOutcomes || this.generateLearningOutcomes(topic.title),
        videos,
        articles,
        exercises,
        assessmentQuestions,
        nextTopics: topic.nextTopics || []
      };

    } catch (error) {
      console.error('Topic enhancement error:', error);
      return this.createFallbackTopic(topic);
    }
  }

  // Generate AI-powered exercises
  private async generateAIExercises(topic: any, objective: LearningObjective): Promise<Exercise[]> {
    try {
      const response = await this.makeAIRequest('/generate-exercises', {
        topic: topic.title,
        skill: objective.skill,
        difficulty: topic.difficulty || objective.currentLevel,
        learningStyle: objective.learningStyle,
        count: 3
      });

      return response.data.exercises || this.getFallbackExercises(topic.title);
    } catch (error) {
      return this.getFallbackExercises(topic.title);
    }
  }

  // Generate AI assessment questions
  private async generateAIAssessment(topic: any, objective: LearningObjective): Promise<AssessmentQuestion[]> {
    try {
      const response = await this.makeAIRequest('/generate-assessment', {
        topic: topic.title,
        skill: objective.skill,
        difficulty: topic.difficulty || objective.currentLevel,
        questionCount: 5,
        questionTypes: ['multiple_choice', 'short_answer', 'coding']
      });

      return response.data.questions || this.getFallbackAssessmentQuestions(topic.title);
    } catch (error) {
      return this.getFallbackAssessmentQuestions(topic.title);
    }
  }

  // Get AI-curated articles
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
      const response = await this.makeAIRequest('/personalized-recommendations', {
        userId,
        completedTopics,
        currentProgress,
        includeNextSteps: true,
        includeSkillGaps: true,
        includeCareerAdvice: true
      });

      return response.data;
    } catch (error) {
      return this.getFallbackRecommendations(completedTopics);
    }
  }

  // Real-time learning analytics with AI
  async analyzeLearningProgress(learningData: any): Promise<any> {
    try {
      const response = await this.makeAIRequest('/analyze-progress', {
        ...learningData,
        includeInsights: true,
        includeOptimizations: true,
        includePredictions: true
      });

      return response.data;
    } catch (error) {
      return { insights: [], optimizations: [], predictions: [] };
    }
  }

  // AI-powered adaptive learning path adjustment
  async adaptLearningPath(currentPath: EnhancedTopic[], userPerformance: any, preferences: any): Promise<EnhancedTopic[]> {
    try {
      const response = await this.makeAIRequest('/adapt-learning-path', {
        currentPath,
        userPerformance,
        preferences,
        optimizeForWeakAreas: true,
        maintainMotivation: true
      });

      return response.data.adaptedPath || currentPath;
    } catch (error) {
      return currentPath;
    }
  }

  // Utility methods
  private async makeAIRequest(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.aiAgentEndpoint}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    return await response.json();
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