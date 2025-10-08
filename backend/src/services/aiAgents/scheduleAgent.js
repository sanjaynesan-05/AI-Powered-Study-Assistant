/**
 * Schedule Agent - Creates personalized study plans and manages time
 * JavaScript implementation from Python agent
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

class ScheduleAgent {
    constructor(geminiApiKey) {
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }

    /**
     * Create personalized study plan based on topic and wellness
     */
    async getStudyPlan(topic, learningResources = [], wellnessAssessment = {}) {
        try {
            console.log(`📅 Schedule Agent: Creating study plan for "${topic}"`);

            const studyPlan = {
                topic,
                total_duration: this.calculateTotalDuration(learningResources, wellnessAssessment),
                sessions: await this.generateStudySessions(topic, learningResources, wellnessAssessment),
                break_schedule: this.generateBreakSchedule(wellnessAssessment),
                calendar_events: [],
                wellness_integration: this.integrateWellnessFactors(wellnessAssessment),
                created_at: new Date().toISOString()
            };

            // Generate calendar events
            studyPlan.calendar_events = this.generateCalendarEvents(studyPlan.sessions);

            return studyPlan;

        } catch (error) {
            console.error('Schedule Agent Error:', error);
            return this.getFallbackStudyPlan(topic);
        }
    }

    /**
     * Generate study sessions with AI optimization
     */
    async generateStudySessions(topic, learningResources, wellnessAssessment) {
        try {
            const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
            const stressLevel = wellnessAssessment.stress_level || 0.2;
            
            const prompt = `Create a personalized study plan for "${topic}".

Student wellness context:
- Fatigue Level: ${(fatigueLevel * 100).toFixed(0)}%
- Stress Level: ${(stressLevel * 100).toFixed(0)}%
- Emotional State: ${wellnessAssessment.emotional_state || 'neutral'}

Learning resources available: ${learningResources.length} resources
Resource types: ${learningResources.map(r => r.type || 'article').join(', ')}

Generate 3-5 study sessions with:
1. Appropriate session lengths based on wellness state
2. Optimal spacing between sessions
3. Resource allocation per session
4. Wellness breaks integration

Return JSON format:
{
  "sessions": [
    {
      "day": "Day 1",
      "session_number": 1,
      "topic": "session topic",
      "duration": "duration in minutes",
      "recommended_time": "morning|afternoon|evening",
      "resources": ["resource titles"],
      "learning_objectives": ["objective 1", "objective 2"],
      "break_after": "break duration",
      "wellness_notes": "wellness considerations"
    }
  ]
}

Adjust session intensity based on wellness metrics.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            const planData = JSON.parse(cleanedResponse);
            
            return planData.sessions || this.getDefaultSessions(topic);

        } catch (error) {
            console.error('Study Sessions Generation Error:', error);
            return this.getDefaultSessions(topic);
        }
    }

    /**
     * Calculate total duration based on resources and wellness
     */
    calculateTotalDuration(learningResources, wellnessAssessment) {
        let baseDuration = 120; // 2 hours default
        
        if (learningResources.length > 0) {
            // Calculate based on resource count and types
            baseDuration = learningResources.reduce((total, resource) => {
                const resourceTime = this.estimateResourceTime(resource);
                return total + resourceTime;
            }, 0);
        }

        // Adjust for wellness factors
        const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
        const stressLevel = wellnessAssessment.stress_level || 0.2;
        
        // Reduce duration if high fatigue or stress
        if (fatigueLevel > 0.6 || stressLevel > 0.5) {
            baseDuration *= 0.8; // 20% reduction
        }
        
        // Add buffer time for breaks
        const totalWithBreaks = baseDuration * 1.3;
        
        return `${Math.ceil(totalWithBreaks / 60)} hours`;
    }

    /**
     * Estimate time needed for a learning resource
     */
    estimateResourceTime(resource) {
        const type = resource.type || 'article';
        const timeEstimates = {
            'video': 30,      // 30 minutes
            'article': 20,    // 20 minutes
            'tutorial': 45,   // 45 minutes
            'course': 120,    // 2 hours
            'interactive': 35, // 35 minutes
            'documentation': 25 // 25 minutes
        };
        
        return timeEstimates[type] || 30;
    }

    /**
     * Generate break schedule based on wellness assessment
     */
    generateBreakSchedule(wellnessAssessment) {
        const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
        const stressLevel = wellnessAssessment.stress_level || 0.2;
        
        let breakInterval = 25; // Default Pomodoro
        let breakDuration = 5;   // Default break length
        
        // Adjust based on wellness
        if (fatigueLevel > 0.6) {
            breakInterval = 20; // More frequent breaks
            breakDuration = 10; // Longer breaks
        }
        
        if (stressLevel > 0.5) {
            breakDuration = 15; // Even longer breaks for stress
        }
        
        return {
            study_interval: `${breakInterval} minutes`,
            break_duration: `${breakDuration} minutes`,
            long_break_interval: '90 minutes',
            long_break_duration: '30 minutes',
            break_activities: this.suggestBreakActivities(wellnessAssessment)
        };
    }

    /**
     * Suggest break activities based on wellness state
     */
    suggestBreakActivities(wellnessAssessment) {
        const activities = [];
        const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
        const stressLevel = wellnessAssessment.stress_level || 0.2;
        const activityLevel = wellnessAssessment.activity_level?.level || 'moderate';
        
        // Energy-based activities
        if (fatigueLevel > 0.6) {
            activities.push('Light stretching or yoga');
            activities.push('Fresh air walk');
            activities.push('Power nap (10-15 minutes)');
        } else {
            activities.push('Quick walk around the block');
            activities.push('Jumping jacks or light exercise');
        }
        
        // Stress-relief activities
        if (stressLevel > 0.5) {
            activities.push('Deep breathing exercises');
            activities.push('Listen to calming music');
            activities.push('Progressive muscle relaxation');
        }
        
        // Activity level considerations
        if (activityLevel === 'low') {
            activities.push('Stand and stretch');
            activities.push('Walk up and down stairs');
        }
        
        // General wellness activities
        activities.push('Hydrate with water');
        activities.push('Healthy snack');
        activities.push('Eye rest (look at distant objects)');
        
        return activities.slice(0, 5); // Return top 5 activities
    }

    /**
     * Integrate wellness factors into study planning
     */
    integrateWellnessFactors(wellnessAssessment) {
        const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
        const stressLevel = wellnessAssessment.stress_level || 0.2;
        const emotionalState = wellnessAssessment.emotional_state || 'neutral';
        
        const integration = {
            wellness_score: this.calculateWellnessScore(wellnessAssessment),
            study_intensity: this.determineStudyIntensity(fatigueLevel, stressLevel),
            recommended_environment: this.recommendEnvironment(emotionalState, stressLevel),
            motivation_boosts: this.getMotivationBoosts(wellnessAssessment),
            wellness_checkpoints: this.getWellnessCheckpoints()
        };
        
        return integration;
    }

    /**
     * Calculate overall wellness score
     */
    calculateWellnessScore(wellnessAssessment) {
        const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
        const stressLevel = wellnessAssessment.stress_level || 0.2;
        
        // Score from 1-10, where 10 is optimal wellness
        const score = 10 - (fatigueLevel * 5) - (stressLevel * 5);
        return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
    }

    /**
     * Determine appropriate study intensity
     */
    determineStudyIntensity(fatigueLevel, stressLevel) {
        if (fatigueLevel > 0.7 || stressLevel > 0.6) {
            return {
                level: 'light',
                description: 'Focus on review and light learning',
                session_length: '15-20 minutes',
                difficulty: 'easy'
            };
        } else if (fatigueLevel > 0.4 || stressLevel > 0.4) {
            return {
                level: 'moderate',
                description: 'Normal study pace with regular breaks',
                session_length: '25-30 minutes',
                difficulty: 'medium'
            };
        } else {
            return {
                level: 'intensive',
                description: 'Deep focus sessions with challenging material',
                session_length: '45-50 minutes',
                difficulty: 'challenging'
            };
        }
    }

    /**
     * Recommend study environment
     */
    recommendEnvironment(emotionalState, stressLevel) {
        const environments = {
            'stressed': 'Quiet, calm space with minimal distractions',
            'tired': 'Well-lit area with comfortable seating',
            'focused': 'Your usual productive study space',
            'anxious': 'Familiar, comfortable environment',
            'neutral': 'Any quiet, organized study area'
        };
        
        const baseRecommendation = environments[emotionalState] || environments['neutral'];
        
        if (stressLevel > 0.5) {
            return `${baseRecommendation}. Consider adding calming elements like plants or soft background music.`;
        }
        
        return baseRecommendation;
    }

    /**
     * Get motivation boosts based on wellness
     */
    getMotivationBoosts(wellnessAssessment) {
        const boosts = [];
        const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
        const stressLevel = wellnessAssessment.stress_level || 0.2;
        
        if (fatigueLevel > 0.5) {
            boosts.push('Celebrate small wins');
            boosts.push('Set shorter, achievable goals');
        }
        
        if (stressLevel > 0.5) {
            boosts.push('Remind yourself why this learning matters');
            boosts.push('Focus on progress, not perfection');
        }
        
        boosts.push('Take pride in showing up to study');
        boosts.push('Remember that every expert was once a beginner');
        
        return boosts;
    }

    /**
     * Get wellness checkpoints during study
     */
    getWellnessCheckpoints() {
        return [
            {
                time: '15 minutes',
                check: 'How is your energy level?',
                action: 'Adjust posture or take micro-break if needed'
            },
            {
                time: '30 minutes',
                check: 'Are you feeling stressed or overwhelmed?',
                action: 'Do 3 deep breaths or switch to easier material'
            },
            {
                time: '45 minutes',
                check: 'Is your focus still sharp?',
                action: 'Take a 5-10 minute break to refresh'
            }
        ];
    }

    /**
     * Generate calendar events from study sessions
     */
    generateCalendarEvents(sessions) {
        const events = [];
        const startDate = new Date();
        startDate.setHours(9, 0, 0, 0); // Start at 9 AM today
        
        sessions.forEach((session, index) => {
            const eventDate = new Date(startDate);
            eventDate.setDate(startDate.getDate() + index); // Each session on different day
            
            // Adjust time based on recommendation
            if (session.recommended_time === 'afternoon') {
                eventDate.setHours(14, 0, 0, 0);
            } else if (session.recommended_time === 'evening') {
                eventDate.setHours(19, 0, 0, 0);
            }
            
            const durationMinutes = parseInt(session.duration) || 30;
            const endDate = new Date(eventDate.getTime() + durationMinutes * 60000);
            
            events.push({
                title: `Study: ${session.topic}`,
                description: `Learning objectives: ${session.learning_objectives?.join(', ') || 'Review materials'}`,
                start_time: eventDate.toISOString(),
                end_time: endDate.toISOString(),
                type: 'study_session',
                resources: session.resources || [],
                wellness_notes: session.wellness_notes || ''
            });
        });
        
        return events;
    }

    /**
     * Get default study sessions for fallback
     */
    getDefaultSessions(topic) {
        return [
            {
                day: 'Day 1',
                session_number: 1,
                topic: `Introduction to ${topic}`,
                duration: '30 minutes',
                recommended_time: 'morning',
                resources: ['Basic concepts and overview'],
                learning_objectives: ['Understand fundamental concepts', 'Get familiar with key terms'],
                break_after: '10 minutes',
                wellness_notes: 'Start with lighter material to build confidence'
            },
            {
                day: 'Day 2',
                session_number: 2,
                topic: `Deep dive into ${topic}`,
                duration: '45 minutes',
                recommended_time: 'afternoon',
                resources: ['Advanced tutorials and examples'],
                learning_objectives: ['Apply concepts practically', 'Solve example problems'],
                break_after: '15 minutes',
                wellness_notes: 'Take breaks when feeling overwhelmed'
            }
        ];
    }

    /**
     * Get fallback study plan
     */
    getFallbackStudyPlan(topic) {
        return {
            topic,
            total_duration: '2 hours',
            sessions: this.getDefaultSessions(topic),
            break_schedule: {
                study_interval: '25 minutes',
                break_duration: '5 minutes',
                long_break_interval: '90 minutes',
                long_break_duration: '30 minutes',
                break_activities: ['Stretch', 'Hydrate', 'Walk around']
            },
            calendar_events: [],
            wellness_integration: {
                wellness_score: 7.5,
                study_intensity: {
                    level: 'moderate',
                    description: 'Normal study pace with regular breaks',
                    session_length: '25-30 minutes',
                    difficulty: 'medium'
                },
                recommended_environment: 'Quiet, organized study area',
                motivation_boosts: ['You can do this!', 'Every step counts'],
                wellness_checkpoints: []
            },
            created_at: new Date().toISOString()
        };
    }
}

module.exports = { ScheduleAgent };