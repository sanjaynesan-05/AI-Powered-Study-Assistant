/**
 * AI Mentor Service for Frontend
 * Handles communication between the React frontend and the Python AI backend
 */

import { PYTHON_AI_CONFIG } from '../config/config';

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
    // Updated to use Python Flask backend
    this.baseUrl = PYTHON_AI_CONFIG.BASE_URL;
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

      const response = await fetch(`${this.baseUrl}${PYTHON_AI_CONFIG.ENDPOINTS.MOTIVATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_mood: 'focused',
          challenges: [prompt.trim()],
          goals: topic ? [topic] : ['learning'],
          achievements: []
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Transform Python backend response to AIResponse format
      const data: AIResponse = {
        success: responseData.success || true,
        message: responseData.data?.motivational_message ||
                responseData.data?.primary_message ||
                responseData.data?.message ||
                'I\'m here to help you with your learning journey!',
        topic: topic,
        timestamp: responseData.timestamp || new Date().toISOString()
      };

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
            message: '🔌 Unable to connect to the AI service. Please check your connection and try again.',
            timestamp: new Date().toISOString(),
            error: 'Connection error'
          };
        }

        return {
          success: false,
          message: `❌ Error: ${error.message}`,
          timestamp: new Date().toISOString(),
          error: error.message
        };
      }

      return {
        success: false,
        message: '❌ An unexpected error occurred. Please try again.',
        timestamp: new Date().toISOString(),
        error: 'Unknown error'
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
   * Get available study topics using Python backend
   * @returns Promise<StudyTopic[]>
   */
  async getTopics(): Promise<StudyTopic[]> {
    try {
      // Return predefined topics since Python backend doesn't have topic list
      const defaultTopics: StudyTopic[] = [
        { id: 'python', name: 'Python Programming', description: 'Learn Python from basics to advanced' },
        { id: 'javascript', name: 'JavaScript', description: 'Web development with JavaScript' },
        { id: 'data-science', name: 'Data Science', description: 'Data analysis and machine learning' },
        { id: 'web-development', name: 'Web Development', description: 'Full-stack web development' },
        { id: 'algorithms', name: 'Algorithms', description: 'Problem solving and algorithms' },
        { id: 'machine-learning', name: 'Machine Learning', description: 'AI and machine learning concepts' }
      ];

      return defaultTopics;

    } catch (error) {
      console.error('❌ Error fetching topics:', error);
      return [];
    }
  }

  /**
   * Check if the AI service is healthy
   * @returns Promise<boolean>
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${PYTHON_AI_CONFIG.ENDPOINTS.HEALTH}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'healthy';

    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  /**
   * Get service status information
   * @returns Promise with status details
   */
  async getStatus(): Promise<{
    healthy: boolean;
    service: string;
    timestamp: string;
    agents?: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}${PYTHON_AI_CONFIG.ENDPOINTS.HEALTH}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        healthy: data.status === 'healthy',
        service: data.service || 'Python AI Service',
        timestamp: data.timestamp,
        agents: data.agents_status
      };

    } catch (error) {
      console.error('❌ Status check failed:', error);
      return {
        healthy: false,
        service: 'Unknown',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get suggested questions for a topic
   * @param topic - The topic to get suggestions for
   * @returns string[] - Array of suggested questions
   */
  getSuggestedQuestions(topic: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      'Python Programming': [
        'How do I start learning Python?',
        'What are Python data structures?',
        'How do I handle errors in Python?'
      ],
      'JavaScript': [
        'Explain JavaScript basics for beginners',
        'What are JavaScript closures?',
        'How does async/await work in JavaScript?'
      ],
      'Data Science': [
        'What is data science?',
        'How do I start with data analysis?',
        'What tools do data scientists use?'
      ],
      'Web Development': [
        'How do I build a website?',
        'What is responsive design?',
        'How do I deploy a web application?'
      ],
      'Algorithms': [
        'What are algorithms?',
        'How do I approach algorithm problems?',
        'What are common sorting algorithms?'
      ],
      'Machine Learning': [
        'What is machine learning?',
        'How do I start with ML?',
        'What are supervised vs unsupervised learning?'
      ]
    };

    return suggestions[topic] || suggestions['Python Programming'];
  }
}

// Export the service instance
export const aiMentorService = new AIService();

// Export types
export type { AIResponse, StudyTopic };
