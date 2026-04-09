/**
 * API Service for Frontend Integration
 * TypeScript service to communicate with Python backend
 */
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface LearningRequest {
  user_id: string;
  user_input: string;
  session_id?: string;
  mastered_skills?: string[];
}

interface LearningResponse {
  success: boolean;
  session_id: string;
  intent: string;
  emotional_tone: string;
  current_skill: string;
  learning_path: string[];
  agent_outputs: Record<string, any>;
  explanations: Record<string, string>;
  reasoning_chain: string[];
  confidence_scores: Record<string, number>;
  timestamp: string;
}

class AIAgentService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async processLearningRequest(request: LearningRequest): Promise<LearningResponse> {
    const response = await this.api.post<LearningResponse>(
      '/api/learning/process',
      request
    );
    return response.data;
  }

  async getUserProfile(userId: string) {
    const response = await this.api.get(`/api/memory/profile/${userId}`);
    return response.data;
  }

  async getAgentsStatus() {
    const response = await this.api.get('/api/agents/status');
    return response.data;
  }

  async healthCheck() {
    const response = await this.api.get('/api/health');
    return response.data;
  }
}

export const aiAgentService = new AIAgentService();
export type { LearningRequest, LearningResponse };