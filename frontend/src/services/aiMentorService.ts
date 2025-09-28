/**
 * AI Mentor Service for Frontend
 * Handles communication between the React frontend and the AI backend
 */

interface AIResponse {
  success: boolean;
  message: string;
  topic?: string;
  timestamp: string;
  error?: string;
}

interface StudyTopic {
  id: string;
  name: string;
  description?: string;
}

class AIService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Backend API base URL - adjust if your backend runs on different port
    this.baseUrl = 'http://localhost:5001/api';
    this.timeout = 30000; // 30 seconds timeout
  }

  /**
   * Ask the AI a question with optional topic context
   * @param prompt - The user's question
   * @param topic - Optional topic context
   * @returns Promise<AIResponse>
   */
  async ask(prompt: string, topic?: string): Promise<AIResponse> {
    try {
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
      }

      console.log(`🤖 Asking AI: "${prompt.substring(0, 50)}..." Topic: ${topic || 'General'}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          topic: topic || 'General'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      
      console.log(`✅ AI Response received: ${data.success ? 'Success' : 'Failed'}`);
      
      return data;

    } catch (error) {
      console.error('❌ AI Service Error:', error);

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: '⏰ The request took too long. Please try again with a simpler question.',
            timestamp: new Date().toISOString(),
            error: 'Request timeout'
          };
        }

        if (error.message.includes('fetch')) {
          return {
            success: false,
            message: '🌐 Unable to connect to the AI service. Please check your internet connection.',
            timestamp: new Date().toISOString(),
            error: 'Network error'
          };
        }
      }

      // Generic error response
      return {
        success: false,
        message: '🤖 I encountered an unexpected issue. Please try rephrasing your question!',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Legacy chat method for backward compatibility
   * @param message - The user's message
   * @returns Promise with reply format
   */
  async chat(message: string): Promise<{ reply: string; success: boolean }> {
    const response = await this.ask(message);
    return {
      reply: response.message,
      success: response.success
    };
  }

  /**
   * Get available study topics
   * @returns Promise<StudyTopic[]>
   */
  async getTopics(): Promise<StudyTopic[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/topics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.topics) {
        return data.topics.map((topic: string) => ({
          id: topic.toLowerCase().replace(/\s+/g, '-'),
          name: topic,
          description: `Get help with ${topic.toLowerCase()}`
        }));
      }

      // Fallback topics if API fails
      return this.getDefaultTopics();

    } catch (error) {
      console.error('Failed to fetch topics:', error);
      return this.getDefaultTopics();
    }
  }

  /**
   * Check if the AI service is healthy
   * @returns Promise<boolean>
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/health`, {
        method: 'GET',
        timeout: 5000
      } as RequestInit);

      if (!response.ok) return false;

      const data = await response.json();
      return data.status === 'healthy' && data.gemini?.initialized === true;

    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get default study topics as fallback
   * @returns StudyTopic[]
   */
  private getDefaultTopics(): StudyTopic[] {
    return [
      { id: 'general', name: 'General', description: 'General questions and help' },
      { id: 'programming', name: 'Programming', description: 'Coding and software development' },
      { id: 'javascript', name: 'JavaScript', description: 'JavaScript programming language' },
      { id: 'career-guidance', name: 'Career Guidance', description: 'Career advice and planning' },
      { id: 'interview-prep', name: 'Interview Preparation', description: 'Job interview preparation' },
      { id: 'skill-development', name: 'Skill Development', description: 'Learning new skills' },
      { id: 'study-techniques', name: 'Study Techniques', description: 'Effective learning methods' }
    ];
  }

  /**
   * Get suggested questions for a topic
   * @param topic - The topic to get suggestions for
   * @returns string[] - Array of suggested questions
   */
  getSuggestedQuestions(topic: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      'Programming': [
        'How do I start learning to code?',
        'What programming language should I learn first?',
        'How can I improve my coding skills?'
      ],
      'JavaScript': [
        'Explain JavaScript basics for beginners',
        'What are JavaScript closures?',
        'How does async/await work in JavaScript?'
      ],
      'Career Guidance': [
        'How do I choose the right career path?',
        'What skills are in demand in tech?',
        'How do I transition to a tech career?'
      ],
      'Interview Preparation': [
        'How should I prepare for coding interviews?',
        'What are common interview questions?',
        'How do I handle technical interviews?'
      ],
      'General': [
        'How can I be more productive while studying?',
        'What are effective learning techniques?',
        'How do I stay motivated while learning?'
      ]
    };

    return suggestions[topic] || suggestions['General'];
  }
}

// Export singleton instance
export const aiMentorService = new AIService();
export type { AIResponse, StudyTopic };
