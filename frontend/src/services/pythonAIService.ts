import { PYTHON_AI_CONFIG } from '../config/config';

export interface PythonAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export interface StudyPlanRequest {
  subject: string;
  difficulty: string;
  duration: string;
  goals: string[];
  learningStyle?: string;
}

export interface LearningResourcesRequest {
  topic: string;
  level: string;
  format?: string[];
  preferences?: string[];
}

export interface AssessmentRequest {
  subject: string;
  difficulty: string;
  questionCount?: number;
  topics?: string[];
}

export interface WellnessRequest {
  stress_level?: number;
  study_hours?: number;
  sleep_hours?: number;
  physical_activity?: string;
}

export interface ScheduleOptimizationRequest {
  subjects: string[];
  available_hours: number;
  priorities: string[];
  deadlines?: string[];
}

export interface MotivationRequest {
  current_mood?: string;
  challenges?: string[];
  goals?: string[];
  achievements?: string[];
}

class PythonAIService {
  private baseURL: string;

  constructor() {
    this.baseURL = PYTHON_AI_CONFIG.BASE_URL;
  }

  private async makeRequest(endpoint: string, data: any): Promise<PythonAIResponse> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Python AI Service Error (${endpoint}):`, error);
      throw error;
    }
  }

  private async makeGetRequest(endpoint: string): Promise<PythonAIResponse> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Python AI Service Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<PythonAIResponse> {
    return this.makeGetRequest(PYTHON_AI_CONFIG.ENDPOINTS.HEALTH);
  }

  // Generate study plan using Python AI agents
  async generateStudyPlan(request: StudyPlanRequest): Promise<PythonAIResponse> {
    return this.makeRequest(PYTHON_AI_CONFIG.ENDPOINTS.STUDY_PLAN, request);
  }

  // Get learning resources using Python AI agents
  async getLearningResources(request: LearningResourcesRequest): Promise<PythonAIResponse> {
    return this.makeRequest(PYTHON_AI_CONFIG.ENDPOINTS.LEARNING_RESOURCES, request);
  }

  // Generate assessment using Python AI agents
  async generateAssessment(request: AssessmentRequest): Promise<PythonAIResponse> {
    return this.makeRequest(PYTHON_AI_CONFIG.ENDPOINTS.ASSESSMENT, request);
  }

  // Get wellness assessment using Python AI agents
  async getWellnessAssessment(request: WellnessRequest): Promise<PythonAIResponse> {
    return this.makeRequest(PYTHON_AI_CONFIG.ENDPOINTS.WELLNESS, request);
  }

  // Optimize schedule using Python AI agents
  async optimizeSchedule(request: ScheduleOptimizationRequest): Promise<PythonAIResponse> {
    return this.makeRequest(PYTHON_AI_CONFIG.ENDPOINTS.SCHEDULE, request);
  }

  // Get motivation boost using Python AI agents
  async getMotivationBoost(request: MotivationRequest): Promise<PythonAIResponse> {
    return this.makeRequest(PYTHON_AI_CONFIG.ENDPOINTS.MOTIVATION, request);
  }

  // Get personalization using Python AI agents
  async getPersonalization(request: any): Promise<PythonAIResponse> {
    return this.makeRequest(PYTHON_AI_CONFIG.ENDPOINTS.PERSONALIZATION, request);
  }
}

// Export singleton instance
export const pythonAIService = new PythonAIService();

// Export convenience functions
export const generateStudyPlan = (request: StudyPlanRequest) => 
  pythonAIService.generateStudyPlan(request);

export const getLearningResources = (request: LearningResourcesRequest) => 
  pythonAIService.getLearningResources(request);

export const generateAssessment = (request: AssessmentRequest) => 
  pythonAIService.generateAssessment(request);

export const getWellnessAssessment = (request: WellnessRequest) => 
  pythonAIService.getWellnessAssessment(request);

export const optimizeSchedule = (request: ScheduleOptimizationRequest) => 
  pythonAIService.optimizeSchedule(request);

export const getMotivationBoost = (request: MotivationRequest) => 
  pythonAIService.getMotivationBoost(request);

export const getPersonalization = (request: any) => 
  pythonAIService.getPersonalization(request);

export const checkPythonAIHealth = () => 
  pythonAIService.healthCheck();