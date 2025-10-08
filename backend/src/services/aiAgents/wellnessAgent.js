/**
 * Wellness Agent - Monitors student stress, fatigue, and mental health
 * JavaScript implementation from Python agent
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

class WellnessAgent {
    constructor(geminiApiKey) {
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        this.emotions = [
            'happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted',
            'neutral', 'confused', 'focused', 'tired', 'stressed', 'relaxed'
        ];
    }

    /**
     * Assess student's current wellness state
     */
    async assessWellness(facialData = null, activityData = null, captureImage = false) {
        try {
            console.log('🌿 Wellness Agent: Assessing student wellness state');

            const wellnessReport = {
                fatigue_level: this.calculateFatigue(facialData, activityData),
                stress_level: this.calculateStress(facialData, activityData),
                emotional_state: this.detectEmotion(facialData),
                activity_level: this.assessActivity(activityData),
                recommendations: [],
                wellness_breaks: [],
                timestamp: new Date().toISOString()
            };

            // Generate personalized recommendations
            wellnessReport.recommendations = await this.generateRecommendations(wellnessReport);
            wellnessReport.wellness_breaks = this.suggestBreaks(wellnessReport);

            return wellnessReport;

        } catch (error) {
            console.error('Wellness Agent Error:', error);
            return this.getDefaultWellnessReport();
        }
    }

    /**
     * Calculate fatigue level (0.0 to 1.0)
     */
    calculateFatigue(facialData, activityData) {
        let fatigueScore = 0.3; // Default moderate fatigue

        if (facialData) {
            // Analyze facial indicators
            const fatigueIndicators = facialData.fatigue_indicators || [];
            if (fatigueIndicators.includes('droopy_eyelids')) fatigueScore += 0.2;
            if (fatigueIndicators.includes('yawning')) fatigueScore += 0.2;
            if (fatigueIndicators.includes('rubbing_eyes')) fatigueScore += 0.15;
        }

        if (activityData) {
            // Consider activity levels
            const hoursStudied = activityData.study_hours_today || 0;
            if (hoursStudied > 6) fatigueScore += 0.2;
            if (hoursStudied > 8) fatigueScore += 0.3;

            // Sleep quality factor
            const sleepQuality = activityData.sleep_quality || 0.7;
            fatigueScore += (1 - sleepQuality) * 0.3;
        }

        return Math.min(1.0, Math.max(0.0, fatigueScore));
    }

    /**
     * Calculate stress level (0.0 to 1.0)
     */
    calculateStress(facialData, activityData) {
        let stressScore = 0.2; // Default low stress

        if (facialData) {
            const emotion = facialData.emotion || 'neutral';
            if (['stressed', 'angry', 'fearful'].includes(emotion)) {
                stressScore += 0.4;
            }
            if (['sad', 'confused'].includes(emotion)) {
                stressScore += 0.2;
            }
        }

        if (activityData) {
            // Consider workload and deadlines
            const upcomingDeadlines = activityData.upcoming_deadlines || 0;
            stressScore += Math.min(0.3, upcomingDeadlines * 0.1);

            // Performance pressure
            const recentPerformance = activityData.recent_test_scores || [];
            const avgScore = recentPerformance.length > 0 
                ? recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length 
                : 75;
            
            if (avgScore < 60) stressScore += 0.3;
            else if (avgScore < 70) stressScore += 0.2;
        }

        return Math.min(1.0, Math.max(0.0, stressScore));
    }

    /**
     * Detect emotional state
     */
    detectEmotion(facialData) {
        if (facialData && facialData.emotion) {
            return facialData.emotion;
        }

        // Simulate emotion detection based on time and other factors
        const hour = new Date().getHours();
        if (hour < 8 || hour > 22) return 'tired';
        if (hour >= 14 && hour <= 16) return 'focused';
        
        return 'neutral';
    }

    /**
     * Assess activity level
     */
    assessActivity(activityData) {
        if (!activityData) {
            return {
                level: 'moderate',
                daily_steps: 7500,
                active_minutes: 45,
                recommended_break: '15 minutes'
            };
        }

        const steps = activityData.steps_today || 0;
        const activeMinutes = activityData.active_minutes || 0;

        let level = 'low';
        if (steps > 8000 && activeMinutes > 60) level = 'high';
        else if (steps > 5000 && activeMinutes > 30) level = 'moderate';

        return {
            level,
            daily_steps: steps,
            active_minutes: activeMinutes,
            recommended_break: this.getBreakRecommendation(level)
        };
    }

    /**
     * Generate AI-powered wellness recommendations
     */
    async generateRecommendations(wellnessReport) {
        try {
            const prompt = `A student has these wellness metrics:
- Fatigue Level: ${(wellnessReport.fatigue_level * 100).toFixed(0)}%
- Stress Level: ${(wellnessReport.stress_level * 100).toFixed(0)}%
- Emotional State: ${wellnessReport.emotional_state}
- Activity Level: ${wellnessReport.activity_level.level}

Generate 3-4 personalized wellness recommendations. Focus on:
1. Immediate actions to improve current state
2. Long-term wellness habits
3. Study productivity optimization
4. Mental health support

Return JSON array:
[
  {
    "type": "immediate|longterm|productivity|mental",
    "title": "Short recommendation title",
    "description": "Detailed description",
    "priority": "high|medium|low",
    "estimated_time": "time to implement"
  }
]`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedResponse);

        } catch (error) {
            console.error('Recommendations Generation Error:', error);
            return this.getDefaultRecommendations(wellnessReport);
        }
    }

    /**
     * Suggest wellness breaks
     */
    suggestBreaks(wellnessReport) {
        const breaks = [];
        const currentTime = new Date();

        // Fatigue-based breaks
        if (wellnessReport.fatigue_level > 0.6) {
            breaks.push({
                type: 'rest',
                title: 'Power Nap Break',
                duration: '15-20 minutes',
                description: 'Take a short nap to restore energy',
                scheduled_time: new Date(currentTime.getTime() + 30 * 60000), // 30 minutes from now
                priority: 'high'
            });
        }

        // Stress-based breaks
        if (wellnessReport.stress_level > 0.5) {
            breaks.push({
                type: 'relaxation',
                title: 'Deep Breathing Exercise',
                duration: '5-10 minutes',
                description: 'Practice mindfulness and deep breathing to reduce stress',
                scheduled_time: new Date(currentTime.getTime() + 15 * 60000), // 15 minutes from now
                priority: 'high'
            });
        }

        // Activity-based breaks
        if (wellnessReport.activity_level.level === 'low') {
            breaks.push({
                type: 'physical',
                title: 'Movement Break',
                duration: '10-15 minutes',
                description: 'Take a walk or do light stretching exercises',
                scheduled_time: new Date(currentTime.getTime() + 45 * 60000), // 45 minutes from now
                priority: 'medium'
            });
        }

        // Regular study breaks
        breaks.push({
            type: 'cognitive',
            title: 'Eye Rest Break',
            duration: '5 minutes',
            description: 'Look away from screen and focus on distant objects',
            scheduled_time: new Date(currentTime.getTime() + 25 * 60000), // 25 minutes from now
            priority: 'medium'
        });

        return breaks.slice(0, 3); // Return top 3 breaks
    }

    /**
     * Get break recommendation based on activity level
     */
    getBreakRecommendation(activityLevel) {
        const recommendations = {
            'low': '20 minutes of light exercise',
            'moderate': '15 minutes of relaxation',
            'high': '10 minutes of quiet rest'
        };
        return recommendations[activityLevel] || '15 minutes of relaxation';
    }

    /**
     * Get default wellness recommendations
     */
    getDefaultRecommendations(wellnessReport) {
        const recommendations = [
            {
                type: 'immediate',
                title: 'Take a Short Break',
                description: 'Step away from your studies for 10-15 minutes to refresh your mind',
                priority: 'medium',
                estimated_time: '10-15 minutes'
            },
            {
                type: 'productivity',
                title: 'Use Pomodoro Technique',
                description: 'Study for 25 minutes, then take a 5-minute break to maintain focus',
                priority: 'medium',
                estimated_time: 'Ongoing'
            }
        ];

        if (wellnessReport.fatigue_level > 0.6) {
            recommendations.unshift({
                type: 'immediate',
                title: 'Get Some Rest',
                description: 'Your fatigue level is high. Consider taking a longer break or napping',
                priority: 'high',
                estimated_time: '20-30 minutes'
            });
        }

        if (wellnessReport.stress_level > 0.5) {
            recommendations.push({
                type: 'mental',
                title: 'Practice Stress Management',
                description: 'Try deep breathing exercises or meditation to reduce stress levels',
                priority: 'high',
                estimated_time: '5-10 minutes'
            });
        }

        return recommendations;
    }

    /**
     * Get default wellness report for fallback
     */
    getDefaultWellnessReport() {
        return {
            fatigue_level: 0.3,
            stress_level: 0.2,
            emotional_state: 'neutral',
            activity_level: {
                level: 'moderate',
                daily_steps: 7500,
                active_minutes: 45,
                recommended_break: '15 minutes'
            },
            recommendations: [
                {
                    type: 'productivity',
                    title: 'Stay Hydrated',
                    description: 'Drink water regularly to maintain focus and energy',
                    priority: 'medium',
                    estimated_time: 'Ongoing'
                },
                {
                    type: 'immediate',
                    title: 'Check Your Posture',
                    description: 'Sit up straight and adjust your workspace for comfort',
                    priority: 'low',
                    estimated_time: '2 minutes'
                }
            ],
            wellness_breaks: [
                {
                    type: 'cognitive',
                    title: 'Eye Rest Break',
                    duration: '5 minutes',
                    description: 'Look away from screen and focus on distant objects',
                    scheduled_time: new Date(Date.now() + 25 * 60000),
                    priority: 'medium'
                }
            ],
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate daily wellness summary
     */
    async generateDailyWellnessSummary(wellnessHistory) {
        try {
            if (!wellnessHistory || wellnessHistory.length === 0) {
                return {
                    overall_wellness_score: 7.5,
                    trends: ['stable'],
                    insights: ['Maintain current wellness practices'],
                    tomorrow_recommendations: ['Continue regular breaks']
                };
            }

            const avgFatigue = wellnessHistory.reduce((sum, w) => sum + w.fatigue_level, 0) / wellnessHistory.length;
            const avgStress = wellnessHistory.reduce((sum, w) => sum + w.stress_level, 0) / wellnessHistory.length;

            const overallScore = Math.max(1, 10 - (avgFatigue * 5) - (avgStress * 5));
            
            const trends = [];
            if (avgFatigue > 0.6) trends.push('high_fatigue');
            if (avgStress > 0.5) trends.push('elevated_stress');
            if (avgFatigue < 0.3 && avgStress < 0.3) trends.push('good_balance');

            return {
                overall_wellness_score: Number(overallScore.toFixed(1)),
                average_fatigue: Number(avgFatigue.toFixed(2)),
                average_stress: Number(avgStress.toFixed(2)),
                trends,
                insights: await this.generateWellnessInsights(avgFatigue, avgStress, trends),
                tomorrow_recommendations: this.getTomorrowRecommendations(trends)
            };

        } catch (error) {
            console.error('Wellness Summary Error:', error);
            return {
                overall_wellness_score: 7.0,
                trends: ['stable'],
                insights: ['Continue monitoring your wellness'],
                tomorrow_recommendations: ['Maintain regular breaks and healthy habits']
            };
        }
    }

    /**
     * Generate wellness insights using AI
     */
    async generateWellnessInsights(avgFatigue, avgStress, trends) {
        try {
            const prompt = `Analyze student wellness data:
- Average Fatigue: ${(avgFatigue * 100).toFixed(0)}%
- Average Stress: ${(avgStress * 100).toFixed(0)}%
- Trends: ${trends.join(', ')}

Provide 2-3 actionable insights about their wellness patterns. Be encouraging and specific.`;

            const result = await this.model.generateContent(prompt);
            const insights = result.response.text().split('\n').filter(line => line.trim());
            return insights.slice(0, 3);

        } catch (error) {
            return ['Your wellness patterns show room for improvement', 'Focus on regular breaks and stress management'];
        }
    }

    /**
     * Get tomorrow's recommendations based on trends
     */
    getTomorrowRecommendations(trends) {
        const recommendations = [];

        if (trends.includes('high_fatigue')) {
            recommendations.push('Plan for earlier bedtime and quality sleep');
            recommendations.push('Schedule longer breaks between study sessions');
        }

        if (trends.includes('elevated_stress')) {
            recommendations.push('Start day with 5-minute meditation');
            recommendations.push('Break large tasks into smaller, manageable chunks');
        }

        if (trends.includes('good_balance')) {
            recommendations.push('Continue your current wellness routine');
            recommendations.push('Maybe challenge yourself with slightly longer study sessions');
        }

        return recommendations.length > 0 ? recommendations : ['Maintain healthy study-break balance'];
    }
}

module.exports = { WellnessAgent };