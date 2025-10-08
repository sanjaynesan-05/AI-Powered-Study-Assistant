export interface WellnessResult {
    emotion: string;
    confidence: number;
    stressLevel: number;
    category: string;
    mockData?: boolean;
    error?: string;
}

class WellnessService {
    private baseUrl: string;
    private static instance: WellnessService;

  constructor() {
    this.baseUrl = 'http://localhost:5002/api';
  }    static getInstance(): WellnessService {
        if (!WellnessService.instance) {
            WellnessService.instance = new WellnessService();
        }
        return WellnessService.instance;
    }

    async analyzeWellness(imageFile: File): Promise<WellnessResult> {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${this.baseUrl}/wellness/analyze-wellness`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error analyzing wellness:', error);
            throw error;
        }
    }
}

export default WellnessService;