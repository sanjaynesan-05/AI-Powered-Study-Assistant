/**
 * Personalization Agent - Adapts learning experiences to individual needs
 * JavaScript implementation from Python agent
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

class PersonalizationAgent {
    constructor(geminiApiKey) {
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        this.learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading', 'mixed'];
        this.difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    }

    /**
     * Get personalized learning path based on user data
     */
    async getPersonalizedPath(topic, learningResources, wellnessAssessment, studentId, pastPerformance = []) {
        try {
            console.log(`🎯 Personalization Agent: Creating personalized path for "${topic}"`);

            const userProfile = await this.buildUserProfile(studentId, pastPerformance, wellnessAssessment);
            const adaptedPath = await this.adaptLearningPath(topic, learningResources, userProfile);
            
            return {
                student_id: studentId,
                topic,
                user_profile: userProfile,
                personalized_path: adaptedPath,
                adaptation_factors: this.getAdaptationFactors(userProfile, wellnessAssessment),
                recommendations: await this.generatePersonalizedRecommendations(userProfile, topic),
                created_at: new Date().toISOString()
            };

        } catch (error) {
            console.error('Personalization Agent Error:', error);
            return this.getFallbackPersonalizedPath(topic, studentId);
        }
    }

    /**
     * Build comprehensive user profile
     */
    async buildUserProfile(studentId, pastPerformance, wellnessAssessment) {
        const profile = {
            student_id: studentId,
            learning_style: this.determineLearningStyle(pastPerformance),
            difficulty_preference: this.calculateDifficultyPreference(pastPerformance),
            performance_trends: this.analyzePerfomanceTrends(pastPerformance),
            wellness_factors: this.extractWellnessFactors(wellnessAssessment),
            engagement_patterns: this.analyzeEngagementPatterns(pastPerformance),
            strengths: [],
            areas_for_improvement: [],
            optimal_session_length: this.calculateOptimalSessionLength(wellnessAssessment, pastPerformance),
            best_study_times: this.predictBestStudyTimes(pastPerformance),
            motivation_triggers: this.identifyMotivationTriggers(pastPerformance)
        };

        // Use AI to enhance profile analysis
        profile.strengths = await this.identifyStrengths(pastPerformance);
        profile.areas_for_improvement = await this.identifyImprovementAreas(pastPerformance);

        return profile;
    }

    /**
     * Determine learning style from past performance
     */
    determineLearningStyle(pastPerformance) {
        if (!pastPerformance || pastPerformance.length === 0) {
            return 'mixed'; // Default to mixed learning style
        }

        // Analyze performance by resource type to infer learning style
        const resourceTypePerformance = {};
        
        pastPerformance.forEach(performance => {
            const resourceTypes = performance.resource_types || ['text'];
            resourceTypes.forEach(type => {
                if (!resourceTypePerformance[type]) {
                    resourceTypePerformance[type] = [];
                }
                resourceTypePerformance[type].push(performance.score);
            });
        });

        // Calculate average performance by resource type
        const avgPerformance = {};
        Object.keys(resourceTypePerformance).forEach(type => {
            const scores = resourceTypePerformance[type];
            avgPerformance[type] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });

        // Determine learning style based on best performing resource types
        if (avgPerformance['video'] > avgPerformance['text'] && avgPerformance['video'] > avgPerformance['interactive']) {
            return 'visual';
        } else if (avgPerformance['audio'] > avgPerformance['text']) {
            return 'auditory';
        } else if (avgPerformance['interactive'] > avgPerformance['text']) {
            return 'kinesthetic';
        } else if (avgPerformance['text'] > 80) {
            return 'reading';
        }

        return 'mixed';
    }

    /**
     * Calculate preferred difficulty level
     */
    calculateDifficultyPreference(pastPerformance) {
        if (!pastPerformance || pastPerformance.length === 0) {
            return 'intermediate';
        }

        const recentPerformance = pastPerformance.slice(-5); // Last 5 sessions
        const avgScore = recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length;

        if (avgScore >= 90) return 'advanced';
        if (avgScore >= 80) return 'intermediate';
        if (avgScore >= 70) return 'beginner';
        return 'beginner';
    }

    /**
     * Analyze performance trends
     */
    analyzePerfomanceTrends(pastPerformance) {
        if (!pastPerformance || pastPerformance.length < 3) {
            return {
                trend: 'stable',
                confidence: 0.5,
                recent_improvement: false,
                consistency: 0.7
            };
        }

        const scores = pastPerformance.map(p => p.score);
        const recentScores = scores.slice(-3);
        const earlierScores = scores.slice(0, -3);

        const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const earlierAvg = earlierScores.length > 0 
            ? earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length 
            : recentAvg;

        const trend = recentAvg > earlierAvg + 5 ? 'improving' : 
                     recentAvg < earlierAvg - 5 ? 'declining' : 'stable';

        // Calculate consistency (inverse of standard deviation)
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const consistency = Math.max(0, 1 - (Math.sqrt(variance) / 100));

        return {
            trend,
            confidence: Math.min(1, pastPerformance.length / 10),
            recent_improvement: recentAvg > earlierAvg,
            consistency,
            average_score: mean
        };
    }

    /**
     * Extract wellness factors affecting learning
     */
    extractWellnessFactors(wellnessAssessment) {
        if (!wellnessAssessment) {
            return {
                fatigue_impact: 'low',
                stress_impact: 'low',
                optimal_wellness_state: 'moderate',
                wellness_recommendations: []
            };
        }

        const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
        const stressLevel = wellnessAssessment.stress_level || 0.2;

        return {
            fatigue_impact: fatigueLevel > 0.6 ? 'high' : fatigueLevel > 0.4 ? 'moderate' : 'low',
            stress_impact: stressLevel > 0.5 ? 'high' : stressLevel > 0.3 ? 'moderate' : 'low',
            optimal_wellness_state: this.determineOptimalWellnessState(fatigueLevel, stressLevel),
            current_emotional_state: wellnessAssessment.emotional_state || 'neutral',
            wellness_recommendations: wellnessAssessment.recommendations || []
        };
    }

    /**
     * Analyze engagement patterns
     */
    analyzeEngagementPatterns(pastPerformance) {
        if (!pastPerformance || pastPerformance.length === 0) {
            return {
                preferred_session_length: '25-30 minutes',
                attention_span: 'medium',
                break_frequency: 'regular',
                engagement_level: 'moderate'
            };
        }

        // Analyze session completion rates and times
        const completedSessions = pastPerformance.filter(p => p.completed === true);
        const completionRate = completedSessions.length / pastPerformance.length;
        
        const avgSessionTime = pastPerformance
            .filter(p => p.session_duration)
            .reduce((sum, p) => sum + p.session_duration, 0) / pastPerformance.length || 25;

        return {
            preferred_session_length: this.categorizeSessionLength(avgSessionTime),
            attention_span: completionRate > 0.8 ? 'high' : completionRate > 0.6 ? 'medium' : 'low',
            break_frequency: avgSessionTime < 20 ? 'frequent' : avgSessionTime > 40 ? 'infrequent' : 'regular',
            engagement_level: this.calculateEngagementLevel(completionRate, pastPerformance),
            completion_rate: completionRate
        };
    }

    /**
     * Calculate optimal session length based on wellness and performance
     */
    calculateOptimalSessionLength(wellnessAssessment, pastPerformance) {
        let baseLength = 25; // Default Pomodoro

        // Adjust for wellness
        if (wellnessAssessment) {
            const fatigueLevel = wellnessAssessment.fatigue_level || 0.3;
            if (fatigueLevel > 0.6) baseLength = 15; // Shorter for high fatigue
            else if (fatigueLevel < 0.3) baseLength = 35; // Longer for low fatigue
        }

        // Adjust for past performance patterns
        if (pastPerformance && pastPerformance.length > 0) {
            const avgPerformance = pastPerformance.reduce((sum, p) => sum + p.score, 0) / pastPerformance.length;
            if (avgPerformance > 85) baseLength += 10; // Extend for high performers
            else if (avgPerformance < 65) baseLength -= 5; // Shorten for struggling learners
        }

        return `${Math.max(10, Math.min(50, baseLength))} minutes`;
    }

    /**
     * Predict best study times based on performance history
     */
    predictBestStudyTimes(pastPerformance) {
        if (!pastPerformance || pastPerformance.length === 0) {
            return ['morning', 'early_afternoon'];
        }

        const timePerformance = {};
        pastPerformance.forEach(performance => {
            const timeSlot = performance.time_of_day || 'unknown';
            if (!timePerformance[timeSlot]) {
                timePerformance[timeSlot] = [];
            }
            timePerformance[timeSlot].push(performance.score);
        });

        // Calculate average performance by time slot
        const avgByTime = {};
        Object.keys(timePerformance).forEach(time => {
            const scores = timePerformance[time];
            avgByTime[time] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });

        // Sort time slots by performance
        const sortedTimes = Object.keys(avgByTime)
            .sort((a, b) => avgByTime[b] - avgByTime[a])
            .filter(time => time !== 'unknown');

        return sortedTimes.length > 0 ? sortedTimes.slice(0, 3) : ['morning', 'early_afternoon'];
    }

    /**
     * Identify motivation triggers
     */
    identifyMotivationTriggers(pastPerformance) {
        const triggers = [];

        if (!pastPerformance || pastPerformance.length === 0) {
            return ['progress_tracking', 'achievement_unlocking', 'positive_feedback'];
        }

        const avgScore = pastPerformance.reduce((sum, p) => sum + p.score, 0) / pastPerformance.length;
        const trend = this.analyzePerfomanceTrends(pastPerformance).trend;

        if (avgScore > 80) {
            triggers.push('challenging_goals', 'mastery_focus', 'peer_comparison');
        } else {
            triggers.push('small_wins', 'encouragement', 'progress_celebration');
        }

        if (trend === 'improving') {
            triggers.push('momentum_building', 'streak_tracking');
        } else if (trend === 'declining') {
            triggers.push('supportive_feedback', 'break_reminders');
        }

        triggers.push('visual_progress', 'achievement_unlocking');
        
        return [...new Set(triggers)]; // Remove duplicates
    }

    /**
     * Adapt learning path based on user profile
     */
    async adaptLearningPath(topic, learningResources, userProfile) {
        try {
            const prompt = `Adapt a learning path for "${topic}" based on this user profile:

Learning Style: ${userProfile.learning_style}
Difficulty Preference: ${userProfile.difficulty_preference}
Performance Trend: ${userProfile.performance_trends.trend}
Optimal Session Length: ${userProfile.optimal_session_length}
Wellness Factors: Fatigue ${userProfile.wellness_factors.fatigue_impact}, Stress ${userProfile.wellness_factors.stress_impact}

Available resources: ${learningResources.length} items
Resource types: ${learningResources.map(r => r.type || 'text').join(', ')}

Create a personalized learning sequence that:
1. Matches their learning style preference
2. Adapts to their performance level
3. Considers their wellness state
4. Optimizes for their session length preference
5. Uses appropriate difficulty progression

Return JSON:
{
  "learning_sequence": [
    {
      "step": 1,
      "title": "step title",
      "description": "what to do",
      "resources": ["resource names"],
      "estimated_time": "time needed",
      "difficulty": "level",
      "learning_style_match": "how it fits their style",
      "wellness_consideration": "wellness note"
    }
  ],
  "personalization_notes": "explanation of adaptations made"
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedResponse);

        } catch (error) {
            console.error('Learning Path Adaptation Error:', error);
            return this.getDefaultAdaptedPath(topic, userProfile);
        }
    }

    /**
     * Generate personalized recommendations using AI
     */
    async generatePersonalizedRecommendations(userProfile, topic) {
        try {
            const prompt = `Generate personalized learning recommendations for a student with this profile:

Topic: ${topic}
Learning Style: ${userProfile.learning_style}
Performance Trend: ${userProfile.performance_trends.trend}
Strengths: ${userProfile.strengths.join(', ') || 'building foundations'}
Areas for Improvement: ${userProfile.areas_for_improvement.join(', ') || 'general concepts'}
Motivation Triggers: ${userProfile.motivation_triggers.join(', ')}

Create 4-5 specific, actionable recommendations that:
1. Leverage their strengths
2. Address improvement areas
3. Match their learning style
4. Use their motivation triggers
5. Consider their performance trends

Return JSON array:
[
  {
    "type": "study_strategy|resource|motivation|wellness",
    "title": "recommendation title",
    "description": "detailed explanation",
    "action_steps": ["step 1", "step 2"],
    "expected_benefit": "what they'll gain",
    "priority": "high|medium|low"
  }
]`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedResponse);

        } catch (error) {
            console.error('Personalized Recommendations Error:', error);
            return this.getDefaultRecommendations(userProfile, topic);
        }
    }

    /**
     * Get adaptation factors used in personalization
     */
    getAdaptationFactors(userProfile, wellnessAssessment) {
        return {
            learning_style_weight: 0.3,
            performance_trend_weight: 0.25,
            wellness_factor_weight: 0.2,
            engagement_pattern_weight: 0.15,
            motivation_trigger_weight: 0.1,
            adaptations_made: [
                `Optimized for ${userProfile.learning_style} learning style`,
                `Adjusted difficulty for ${userProfile.difficulty_preference} level`,
                `Considered ${userProfile.wellness_factors.fatigue_impact} fatigue impact`,
                `Aligned with ${userProfile.optimal_session_length} session preference`
            ],
            confidence_score: this.calculatePersonalizationConfidence(userProfile)
        };
    }

    /**
     * Calculate confidence in personalization accuracy
     */
    calculatePersonalizationConfidence(userProfile) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence based on data availability
        if (userProfile.performance_trends.confidence > 0.7) confidence += 0.2;
        if (userProfile.engagement_patterns.completion_rate > 0.8) confidence += 0.15;
        if (userProfile.wellness_factors.fatigue_impact !== 'unknown') confidence += 0.1;
        if (userProfile.motivation_triggers.length > 3) confidence += 0.05;
        
        return Math.min(1, confidence);
    }

    /**
     * Helper methods for analysis
     */
    categorizeSessionLength(minutes) {
        if (minutes < 15) return 'short (10-15 minutes)';
        if (minutes < 25) return 'medium (15-25 minutes)';
        if (minutes < 40) return 'long (25-40 minutes)';
        return 'extended (40+ minutes)';
    }

    calculateEngagementLevel(completionRate, pastPerformance) {
        const avgScore = pastPerformance.reduce((sum, p) => sum + p.score, 0) / pastPerformance.length;
        
        if (completionRate > 0.8 && avgScore > 80) return 'high';
        if (completionRate > 0.6 && avgScore > 70) return 'moderate';
        return 'low';
    }

    determineOptimalWellnessState(fatigueLevel, stressLevel) {
        if (fatigueLevel < 0.3 && stressLevel < 0.3) return 'optimal';
        if (fatigueLevel < 0.5 && stressLevel < 0.4) return 'good';
        if (fatigueLevel < 0.7 && stressLevel < 0.6) return 'moderate';
        return 'needs_improvement';
    }

    /**
     * AI-powered strength identification
     */
    async identifyStrengths(pastPerformance) {
        if (!pastPerformance || pastPerformance.length === 0) {
            return ['eager_to_learn', 'committed_to_growth'];
        }

        try {
            const avgScore = pastPerformance.reduce((sum, p) => sum + p.score, 0) / pastPerformance.length;
            const topicPerformance = {};
            
            pastPerformance.forEach(p => {
                const topic = p.topic || 'general';
                if (!topicPerformance[topic]) topicPerformance[topic] = [];
                topicPerformance[topic].push(p.score);
            });

            const strongTopics = Object.keys(topicPerformance)
                .filter(topic => {
                    const avg = topicPerformance[topic].reduce((sum, score) => sum + score, 0) / topicPerformance[topic].length;
                    return avg > 80;
                })
                .slice(0, 3);

            const strengths = [];
            if (avgScore > 85) strengths.push('high_achiever');
            if (avgScore > 75) strengths.push('consistent_performer');
            if (strongTopics.length > 0) strengths.push(`strong_in_${strongTopics[0].replace(/\s+/g, '_')}`);
            
            const trend = this.analyzePerfomanceTrends(pastPerformance).trend;
            if (trend === 'improving') strengths.push('continuous_improvement');
            
            return strengths.length > 0 ? strengths : ['dedicated_learner'];

        } catch (error) {
            return ['motivated_student', 'growth_mindset'];
        }
    }

    /**
     * AI-powered improvement area identification
     */
    async identifyImprovementAreas(pastPerformance) {
        if (!pastPerformance || pastPerformance.length === 0) {
            return ['building_foundation', 'developing_study_habits'];
        }

        try {
            const avgScore = pastPerformance.reduce((sum, p) => sum + p.score, 0) / pastPerformance.length;
            const topicPerformance = {};
            
            pastPerformance.forEach(p => {
                const topic = p.topic || 'general';
                if (!topicPerformance[topic]) topicPerformance[topic] = [];
                topicPerformance[topic].push(p.score);
            });

            const weakTopics = Object.keys(topicPerformance)
                .filter(topic => {
                    const avg = topicPerformance[topic].reduce((sum, score) => sum + score, 0) / topicPerformance[topic].length;
                    return avg < 70;
                })
                .slice(0, 2);

            const areas = [];
            if (avgScore < 70) areas.push('fundamental_concepts');
            if (avgScore < 80) areas.push('application_skills');
            if (weakTopics.length > 0) areas.push(`${weakTopics[0].replace(/\s+/g, '_')}_concepts`);
            
            const consistency = this.analyzePerfomanceTrends(pastPerformance).consistency;
            if (consistency < 0.7) areas.push('consistency_improvement');
            
            return areas.length > 0 ? areas : ['time_management'];

        } catch (error) {
            return ['study_techniques', 'concept_application'];
        }
    }

    /**
     * Default adapted path for fallback
     */
    getDefaultAdaptedPath(topic, userProfile) {
        return {
            learning_sequence: [
                {
                    step: 1,
                    title: `Introduction to ${topic}`,
                    description: 'Start with fundamental concepts and overview',
                    resources: ['Basic tutorial', 'Overview article'],
                    estimated_time: userProfile.optimal_session_length || '25 minutes',
                    difficulty: 'beginner',
                    learning_style_match: `Adapted for ${userProfile.learning_style} learners`,
                    wellness_consideration: 'Start gently to build confidence'
                },
                {
                    step: 2,
                    title: `Core ${topic} Concepts`,
                    description: 'Dive deeper into essential principles',
                    resources: ['Detailed guide', 'Practice examples'],
                    estimated_time: userProfile.optimal_session_length || '30 minutes',
                    difficulty: userProfile.difficulty_preference || 'intermediate',
                    learning_style_match: 'Mix of theory and practice',
                    wellness_consideration: 'Take breaks as needed'
                }
            ],
            personalization_notes: `Path adapted for ${userProfile.learning_style} learning style with ${userProfile.difficulty_preference} difficulty level`
        };
    }

    /**
     * Default recommendations for fallback
     */
    getDefaultRecommendations(userProfile, topic) {
        return [
            {
                type: 'study_strategy',
                title: 'Use Active Learning Techniques',
                description: `For ${topic}, engage actively with the material through practice and application`,
                action_steps: ['Take notes while learning', 'Practice concepts immediately', 'Explain concepts aloud'],
                expected_benefit: 'Better retention and understanding',
                priority: 'high'
            },
            {
                type: 'resource',
                title: 'Diversify Your Learning Resources',
                description: `Mix different types of resources to match your ${userProfile.learning_style} learning style`,
                action_steps: ['Use videos for visual concepts', 'Read articles for depth', 'Try interactive exercises'],
                expected_benefit: 'Enhanced comprehension from multiple perspectives',
                priority: 'medium'
            },
            {
                type: 'motivation',
                title: 'Track Your Progress',
                description: 'Monitor your learning journey to stay motivated',
                action_steps: ['Set daily learning goals', 'Celebrate small wins', 'Review weekly progress'],
                expected_benefit: 'Sustained motivation and clear progress visibility',
                priority: 'medium'
            }
        ];
    }

    /**
     * Fallback personalized path
     */
    getFallbackPersonalizedPath(topic, studentId) {
        return {
            student_id: studentId,
            topic,
            user_profile: {
                learning_style: 'mixed',
                difficulty_preference: 'intermediate',
                performance_trends: { trend: 'stable', confidence: 0.5 },
                wellness_factors: { fatigue_impact: 'low', stress_impact: 'low' },
                optimal_session_length: '25 minutes',
                strengths: ['eager_to_learn'],
                areas_for_improvement: ['building_foundation']
            },
            personalized_path: this.getDefaultAdaptedPath(topic, { learning_style: 'mixed', optimal_session_length: '25 minutes', difficulty_preference: 'intermediate' }),
            adaptation_factors: {
                learning_style_weight: 0.3,
                adaptations_made: ['Balanced approach for mixed learning style'],
                confidence_score: 0.5
            },
            recommendations: this.getDefaultRecommendations({ learning_style: 'mixed' }, topic),
            created_at: new Date().toISOString()
        };
    }
}

module.exports = { PersonalizationAgent };