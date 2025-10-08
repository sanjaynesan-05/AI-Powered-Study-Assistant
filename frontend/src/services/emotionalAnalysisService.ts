export interface EmotionResult {
  emotion: string;
  confidence: number;
  mockData?: boolean;
  stressLevel?: number;
  category?: string;
  error?: string;
}

class EmotionalAnalysisService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:5001/api';
  }

  private static instance: EmotionalAnalysisService;

  static getInstance(): EmotionalAnalysisService {
    if (!EmotionalAnalysisService.instance) {
      EmotionalAnalysisService.instance = new EmotionalAnalysisService();
    }
    return EmotionalAnalysisService.instance;
  }

  async analyzeImage(imageFile: File): Promise<EmotionResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.baseUrl}/emotional-analysis/analyze`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  async analyzeText(text: string): Promise<EmotionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/emotional-analysis/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  getStressCategory(stressLevel: number): string {
    if (stressLevel < 30) return "Low Stress";
    if (stressLevel < 60) return "Moderate Stress";
    if (stressLevel < 80) return "High Stress";
    return "Critical Stress";
  }
}

export const emotionalAnalysisService = EmotionalAnalysisService.getInstance();