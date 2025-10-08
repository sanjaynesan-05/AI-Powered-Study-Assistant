class HumeService {
    constructor() {
        this.initialize();
    }

    initialize() {
        const humeApiKey = process.env.HUME_API_KEY;
        if (!humeApiKey) {
            console.warn('⚠️ HUME_API_KEY not found in environment variables');
            return;
        }
        console.log('🎥 Hume AI service ready to use');
        process.env.HUME_API_KEY = humeApiKey;
    }

    analyzeImage(imageBuffer) {
        // Simulate realistic emotion detection with varied results
        const emotions = [
            { emotion: 'happy', confidence: 0.85, stressLevel: 15.0 },
            { emotion: 'neutral', confidence: 0.72, stressLevel: 35.0 },
            { emotion: 'focused', confidence: 0.78, stressLevel: 25.0 },
            { emotion: 'tired', confidence: 0.65, stressLevel: 60.0 },
            { emotion: 'stressed', confidence: 0.82, stressLevel: 75.0 },
            { emotion: 'confused', confidence: 0.58, stressLevel: 45.0 },
            { emotion: 'relaxed', confidence: 0.91, stressLevel: 12.0 },
            { emotion: 'anxious', confidence: 0.76, stressLevel: 68.0 }
        ];

        // Randomly select an emotion for simulation
        const randomIndex = Math.floor(Math.random() * emotions.length);
        const randomEmotion = emotions[randomIndex];

        console.log(`🎭 Random emotion selected: ${randomEmotion.emotion} (index: ${randomIndex})`);

        return Promise.resolve({
            emotion: randomEmotion.emotion,
            confidence: randomEmotion.confidence,
            stressLevel: randomEmotion.stressLevel,
            category: this.getStressCategory(randomEmotion.stressLevel),
            mockData: true
        });
    }

    analyzeText(text) {
        return Promise.resolve({
            emotion: 'neutral',
            confidence: 0.5,
            stressLevel: 50.0,
            category: this.getStressCategory(50.0),
            mockData: true
        });
    }

    getStressCategory(stressPercentage) {
        if (stressPercentage <= 30) return 'Low Stress';
        if (stressPercentage <= 70) return 'Moderate Stress';
        return 'High Stress';
    }
}

module.exports = new HumeService();