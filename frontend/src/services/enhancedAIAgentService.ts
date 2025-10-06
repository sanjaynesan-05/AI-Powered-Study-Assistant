// Enhanced AI Agent Service with standardized responses and fallback handling
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface StandardAIResponse {
  success: boolean;
  title: string;
  summary: string;
  suggestions: string[];
  confidence: number;
  timestamp: string;
  agentType: string;
  fallbackUsed?: boolean;
  error?: string;
}

export interface LearningPathResponse extends StandardAIResponse {
  modules: {
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    prerequisites: string[];
    learningObjectives: string[];
    resources: {
      type: 'video' | 'article' | 'practice' | 'quiz';
      title: string;
      url?: string;
      description: string;
    }[];
  }[];
  totalDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CareerMentorResponse extends StandardAIResponse {
  careerPath: string;
  skillGaps: string[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    timeline: string;
    resources: string[];
  }[];
  marketInsights: {
    demand: string;
    averageSalary?: string;
    growthProjection: string;
    keySkills: string[];
  };
}

export interface ResumeCoachResponse extends StandardAIResponse {
  overallScore: number;
  strengths: string[];
  improvements: {
    section: string;
    issue: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  optimizedSections: {
    section: string;
    before: string;
    after: string;
    explanation: string;
  }[];
}

export class EnhancedAIAgentService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 30000;

  // Fallback responses for when AI fails
  private static FALLBACK_RESPONSES = {
    learningPath: {
      title: 'Basic Learning Path',
      summary: 'A structured approach to learning your target skill',
      suggestions: [
        'Start with fundamentals and build gradually',
        'Practice regularly with hands-on projects',
        'Join communities for peer learning',
        'Set realistic milestones and track progress'
      ]
    },
    careerMentor: {
      title: 'Career Development Guidance',
      summary: 'General career development recommendations',
      suggestions: [
        'Focus on developing in-demand skills',
        'Build a strong professional network',
        'Create a portfolio showcasing your work',
        'Stay updated with industry trends'
      ]
    },
    resumeCoach: {
      title: 'Resume Enhancement Tips',
      summary: 'General resume improvement recommendations',
      suggestions: [
        'Use action verbs to describe accomplishments',
        'Quantify achievements with specific metrics',
        'Tailor resume to specific job requirements',
        'Keep format clean and professional'
      ]
    }
  };

  private createStandardPrompt(agentType: string, userInput: string, context?: any): string {
    const basePrompts = {
      learningPath: `You are an expert learning path designer. Create a comprehensive, structured learning path for "${userInput}".
      
      Respond in this EXACT JSON format:
      {
        "title": "Learning Path Title",
        "summary": "Brief overview of the learning journey",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
        "confidence": 0.85,
        "modules": [
          {
            "id": "module-1",
            "title": "Module Title",
            "description": "Module description",
            "estimatedTime": "2 weeks",
            "prerequisites": ["prerequisite1"],
            "learningObjectives": ["objective1", "objective2"],
            "resources": [
              {
                "type": "video",
                "title": "Resource Title",
                "description": "Resource description"
              }
            ]
          }
        ],
        "totalDuration": "8-12 weeks",
        "difficulty": "intermediate"
      }`,
      
      careerMentor: `You are an expert career mentor and industry advisor. Provide comprehensive career guidance for someone interested in "${userInput}".
      
      Respond in this EXACT JSON format:
      {
        "title": "Career Path: ${userInput}",
        "summary": "Overview of the career path and opportunities",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
        "confidence": 0.90,
        "careerPath": "Detailed career progression path",
        "skillGaps": ["skill1", "skill2", "skill3"],
        "recommendations": [
          {
            "priority": "high",
            "action": "Specific action to take",
            "timeline": "3-6 months",
            "resources": ["resource1", "resource2"]
          }
        ],
        "marketInsights": {
          "demand": "High/Medium/Low demand description",
          "averageSalary": "$XX,XXX - $XXX,XXX",
          "growthProjection": "Growth projection details",
          "keySkills": ["skill1", "skill2", "skill3"]
        }
      }`,
      
      resumeCoach: `You are an expert resume coach and ATS optimization specialist. Analyze and improve a resume for "${userInput}" role.
      
      ${context?.resumeText ? `Resume content to analyze: ${context.resumeText}` : 'Provide general resume optimization advice.'}
      
      Respond in this EXACT JSON format:
      {
        "title": "Resume Analysis & Optimization",
        "summary": "Overall assessment of the resume",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
        "confidence": 0.88,
        "overallScore": 75,
        "strengths": ["strength1", "strength2"],
        "improvements": [
          {
            "section": "Experience",
            "issue": "Specific issue identified",
            "suggestion": "How to fix it",
            "impact": "high"
          }
        ],
        "optimizedSections": [
          {
            "section": "Summary",
            "before": "Original text",
            "after": "Improved text",
            "explanation": "Why this is better"
          }
        ]
      }`
    };

    return basePrompts[agentType as keyof typeof basePrompts] || basePrompts.learningPath;
  }

  private async makeAIRequest(prompt: string, agentType: string): Promise<any> {
    try {
      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.TIMEOUT_MS)
        )
      ]);

      const response = await (result as any).response;
      const text = response.text();
      
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid JSON response from AI');
    } catch (error) {
      console.error(`AI request failed for ${agentType}:`, error);
      throw error;
    }
  }

  private createFallbackResponse(agentType: string, userInput: string): StandardAIResponse {
    const fallback = EnhancedAIAgentService.FALLBACK_RESPONSES[
      agentType as keyof typeof EnhancedAIAgentService.FALLBACK_RESPONSES
    ];

    return {
      success: true,
      title: fallback.title,
      summary: fallback.summary,
      suggestions: fallback.suggestions,
      confidence: 0.5,
      timestamp: new Date().toISOString(),
      agentType,
      fallbackUsed: true
    };
  }

  async generateLearningPath(targetSkill: string, preferences?: any): Promise<LearningPathResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const prompt = this.createStandardPrompt('learningPath', targetSkill, preferences);
        const aiResponse = await this.makeAIRequest(prompt, 'learningPath');

        return {
          ...aiResponse,
          success: true,
          timestamp: new Date().toISOString(),
          agentType: 'learningPath',
          fallbackUsed: false
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`Learning path generation attempt ${attempt} failed:`, error);
        
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Return fallback response
    const fallback = this.createFallbackResponse('learningPath', targetSkill);
    return {
      ...fallback,
      modules: [
        {
          id: 'module-1',
          title: 'Foundation & Basics',
          description: 'Build strong fundamentals',
          estimatedTime: '2-3 weeks',
          prerequisites: [],
          learningObjectives: [`Learn ${targetSkill} fundamentals`, 'Understand core concepts'],
          resources: [
            {
              type: 'video' as const,
              title: 'Introduction to ' + targetSkill,
              description: 'Comprehensive overview and getting started guide'
            }
          ]
        }
      ],
      totalDuration: '6-8 weeks',
      difficulty: 'beginner' as const,
      error: lastError?.message
    };
  }

  async getCareerMentorship(careerGoal: string, currentSkills?: string[]): Promise<CareerMentorResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const context = { currentSkills };
        const prompt = this.createStandardPrompt('careerMentor', careerGoal, context);
        const aiResponse = await this.makeAIRequest(prompt, 'careerMentor');

        return {
          ...aiResponse,
          success: true,
          timestamp: new Date().toISOString(),
          agentType: 'careerMentor',
          fallbackUsed: false
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`Career mentorship attempt ${attempt} failed:`, error);
        
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Return fallback response
    const fallback = this.createFallbackResponse('careerMentor', careerGoal);
    return {
      ...fallback,
      careerPath: `Traditional path in ${careerGoal} typically involves gaining relevant education, building practical experience, and continuous skill development.`,
      skillGaps: ['Technical expertise', 'Industry knowledge', 'Soft skills'],
      recommendations: [
        {
          priority: 'high' as const,
          action: 'Identify and bridge skill gaps',
          timeline: '3-6 months',
          resources: ['Online courses', 'Industry certifications']
        }
      ],
      marketInsights: {
        demand: 'Market demand varies by location and specialization',
        averageSalary: 'Varies by experience and location',
        growthProjection: 'Generally positive growth expected',
        keySkills: ['Core technical skills', 'Communication', 'Problem-solving']
      },
      error: lastError?.message
    };
  }

  async optimizeResume(targetRole: string, resumeText?: string): Promise<ResumeCoachResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const context = { resumeText };
        const prompt = this.createStandardPrompt('resumeCoach', targetRole, context);
        const aiResponse = await this.makeAIRequest(prompt, 'resumeCoach');

        return {
          ...aiResponse,
          success: true,
          timestamp: new Date().toISOString(),
          agentType: 'resumeCoach',
          fallbackUsed: false
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`Resume optimization attempt ${attempt} failed:`, error);
        
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Return fallback response
    const fallback = this.createFallbackResponse('resumeCoach', targetRole);
    return {
      ...fallback,
      overallScore: 70,
      strengths: ['Professional experience', 'Relevant skills'],
      improvements: [
        {
          section: 'Summary',
          issue: 'Could be more targeted',
          suggestion: 'Tailor summary to specific role requirements',
          impact: 'high' as const
        }
      ],
      optimizedSections: [
        {
          section: 'Summary',
          before: 'Generic professional summary',
          after: `Focused ${targetRole} professional summary`,
          explanation: 'Targeted content performs better with ATS and recruiters'
        }
      ],
      error: lastError?.message
    };
  }

  // Health check for all AI agents
  async checkAgentHealth(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    try {
      // Test each agent with a simple request
      const testPrompts = {
        learningPath: 'JavaScript',
        careerMentor: 'Software Developer',
        resumeCoach: 'Frontend Developer'
      };

      await Promise.all(
        Object.entries(testPrompts).map(async ([agent, testInput]) => {
          try {
            const prompt = this.createStandardPrompt(agent, testInput);
            await this.makeAIRequest(prompt, agent);
            results[agent] = true;
          } catch (error) {
            console.warn(`Health check failed for ${agent}:`, error);
            results[agent] = false;
          }
        })
      );
    } catch (error) {
      console.error('Agent health check failed:', error);
    }

    return results;
  }
}

export const enhancedAIAgentService = new EnhancedAIAgentService();