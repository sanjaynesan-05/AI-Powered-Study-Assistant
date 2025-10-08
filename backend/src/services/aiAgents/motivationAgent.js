/**
 * Motivation Agent - Provides emotional support and goal setting
 * JavaScript implementation from Python agent
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

class MotivationAgent {
    constructor(geminiApiKey) {
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        this.motivationStyles = ['encouraging', 'challenging', 'supportive', 'inspiring', 'practical'];
    }

    /**
     * Get motivational support based on context
     */
    async getMotivationalSupport(motivationContext, apiKey = null) {
        try {
            console.log('💪 Motivation Agent: Generating personalized motivation');

            const support = {
                primary_message: await this.generatePrimaryMessage(motivationContext),
                daily_affirmation: this.getDailyAffirmation(),
                progress_celebration: this.celebrateProgress(motivationContext),
                next_goal: this.setNextGoal(motivationContext),
                motivation_style: this.determineMotivationStyle(motivationContext),
                energy_boost: await this.getEnergyBoost(motivationContext),
                timestamp: new Date().toISOString()
            };

            return support;

        } catch (error) {
            console.error('Motivation Agent Error:', error);
            return this.getFallbackMotivation(motivationContext);
        }
    }

    /**
     * Generate AI-powered personalized motivation message
     */
    async generatePrimaryMessage(context) {
        try {
            const prompt = `Generate a personalized motivational message for a student with this context:

Current state:
- Performance Level: ${context.performance_level || 'moderate'}
- Emotional State: ${context.emotional_state || 'neutral'}
- Fatigue Level: ${(context.fatigue_level * 100) || 30}%
- Current Topic: ${context.current_topic || 'general studies'}
- Progress Milestone: ${context.progress_milestone ? 'Yes' : 'No'}

Create a motivational message that:
1. Acknowledges their current state
2. Provides encouragement specific to their situation
3. Keeps them motivated to continue learning
4. Is positive but realistic
5. Relates to their specific topic if possible

Keep it under 100 words and make it personal and uplifting.`;

            const result = await this.model.generateContent(prompt);
            const message = result.response.text().trim();
            
            // Clean up the message
            return message.replace(/["']/g, '').replace(/\n+/g, ' ');

        } catch (error) {
            console.error('Primary Message Generation Error:', error);
            return this.getDefaultMotivationMessage(context);
        }
    }

    /**
     * Get daily affirmation
     */
    getDailyAffirmation() {
        const affirmations = [
            "You have the power to learn anything you set your mind to",
            "Every expert was once a beginner - you're on the right path",
            "Your brain grows stronger with every challenge you tackle",
            "Progress, not perfection, is what matters most",
            "You're building valuable skills that will serve you for life",
            "Curiosity and persistence are your superpowers",
            "Every question you ask brings you closer to understanding",
            "You're capable of amazing things when you believe in yourself",
            "Learning is a journey, and you're making great progress",
            "Your dedication to growth is inspiring"
        ];

        const today = new Date();
        const dayIndex = today.getDate() % affirmations.length;
        return affirmations[dayIndex];
    }

    /**
     * Celebrate progress based on context
     */
    celebrateProgress(context) {
        const celebrations = [];
        
        if (context.progress_milestone) {
            celebrations.push({
                achievement: 'Milestone Reached!',
                message: '🎉 You hit an important learning milestone! Your dedication is paying off.',
                celebration_type: 'major'
            });
        }

        if (context.performance_level === 'excellent_performance') {
            celebrations.push({
                achievement: 'Outstanding Performance',
                message: '⭐ Your performance has been excellent! You\'re mastering this material.',
                celebration_type: 'performance'
            });
        } else if (context.performance_level === 'good_performance') {
            celebrations.push({
                achievement: 'Solid Progress',
                message: '👍 You\'re making solid progress! Keep up the consistent effort.',
                celebration_type: 'steady'
            });
        }

        // Always celebrate effort
        celebrations.push({
            achievement: 'Showing Up',
            message: '💪 You showed up to learn today - that\'s already a win!',
            celebration_type: 'effort'
        });

        return celebrations[0] || celebrations[celebrations.length - 1];
    }

    /**
     * Set next achievable goal
     */
    setNextGoal(context) {
        const currentTopic = context.current_topic || 'your studies';
        const performanceLevel = context.performance_level || 'moderate';
        
        const goals = {
            'poor_performance': {
                goal: `Master one basic concept in ${currentTopic}`,
                timeframe: 'today',
                difficulty: 'easy',
                reward: 'Take a 15-minute break doing something you enjoy'
            },
            'needs_improvement': {
                goal: `Complete one practice exercise in ${currentTopic}`,
                timeframe: 'this session',
                difficulty: 'manageable',
                reward: 'Treat yourself to your favorite snack'
            },
            'moderate': {
                goal: `Understand the core principles of ${currentTopic}`,
                timeframe: 'today',
                difficulty: 'moderate',
                reward: 'Share your progress with someone who supports you'
            },
            'good_performance': {
                goal: `Apply ${currentTopic} concepts to a real example`,
                timeframe: 'this week',
                difficulty: 'challenging',
                reward: 'Plan something fun for the weekend'
            },
            'excellent_performance': {
                goal: `Teach someone else what you learned about ${currentTopic}`,
                timeframe: 'this week',
                difficulty: 'advanced',
                reward: 'Celebrate your expertise with a meaningful reward'
            }
        };

        return goals[performanceLevel] || goals['moderate'];
    }

    /**
     * Determine appropriate motivation style
     */
    determineMotivationStyle(context) {
        const emotionalState = context.emotional_state || 'neutral';
        const fatigueLevel = context.fatigue_level || 0.3;
        const performanceLevel = context.performance_level || 'moderate';

        if (emotionalState === 'stressed' || fatigueLevel > 0.7) {
            return {
                style: 'supportive',
                approach: 'gentle encouragement',
                tone: 'calm and reassuring',
                focus: 'self-care and small wins'
            };
        } else if (performanceLevel === 'excellent_performance') {
            return {
                style: 'challenging',
                approach: 'growth-oriented',
                tone: 'confident and ambitious',
                focus: 'pushing boundaries and mastery'
            };
        } else if (emotionalState === 'sad' || performanceLevel === 'poor_performance') {
            return {
                style: 'encouraging',
                approach: 'uplifting and positive',
                tone: 'warm and understanding',
                focus: 'building confidence and momentum'
            };
        } else {
            return {
                style: 'inspiring',
                approach: 'vision-focused',
                tone: 'energetic and forward-looking',
                focus: 'purpose and long-term goals'
            };
        }
    }

    /**
     * Get energy boost based on current state
     */
    async getEnergyBoost(context) {
        try {
            const fatigueLevel = context.fatigue_level || 0.3;
            const emotionalState = context.emotional_state || 'neutral';
            
            const prompt = `Generate a quick energy boost for a student who is:
- Fatigue Level: ${(fatigueLevel * 100).toFixed(0)}%
- Emotional State: ${emotionalState}
- Studying: ${context.current_topic || 'general topics'}

Provide a 2-3 sentence energy boost that:
1. Acknowledges how they might be feeling
2. Gives them a quick mental/emotional lift
3. Helps them refocus on their learning

Make it energetic but not overwhelming.`;

            const result = await this.model.generateContent(prompt);
            const boost = result.response.text().trim();
            
            return {
                message: boost.replace(/["']/g, ''),
                type: fatigueLevel > 0.6 ? 'gentle_energy' : 'high_energy',
                duration: 'quick_boost'
            };

        } catch (error) {
            return this.getDefaultEnergyBoost(context);
        }
    }

    /**
     * Generate motivational study session opener
     */
    async generateSessionOpener(topic, sessionNumber = 1, userProfile = {}) {
        try {
            const prompt = `Create an motivational opener for study session ${sessionNumber} about "${topic}".

User context:
- Experience Level: ${userProfile.experience || 'intermediate'}
- Learning Goals: ${userProfile.goals?.join(', ') || 'mastering the subject'}

Create a brief, energizing message (2-3 sentences) that:
1. Gets them excited about this specific session
2. Connects to their learning goals
3. Sets a positive tone for studying

Make it personalized and inspiring.`;

            const result = await this.model.generateContent(prompt);
            const opener = result.response.text().trim();
            
            return {
                message: opener.replace(/["']/g, ''),
                session_number: sessionNumber,
                topic,
                estimated_mood_boost: '+15%'
            };

        } catch (error) {
            return {
                message: `Ready to dive into ${topic}? This session will bring you closer to your learning goals. Let's make it count!`,
                session_number: sessionNumber,
                topic,
                estimated_mood_boost: '+10%'
            };
        }
    }

    /**
     * Generate end-of-session celebration
     */
    generateSessionCelebration(completedSession, performance = {}) {
        const celebration = {
            main_message: '',
            achievement_unlocked: '',
            progress_highlight: '',
            next_session_teaser: ''
        };

        // Main celebration message
        if (performance.score >= 90) {
            celebration.main_message = '🌟 Outstanding work! You absolutely crushed this session!';
            celebration.achievement_unlocked = 'Subject Master';
        } else if (performance.score >= 80) {
            celebration.main_message = '🎯 Excellent job! You really understood the material well.';
            celebration.achievement_unlocked = 'Quick Learner';
        } else if (performance.score >= 70) {
            celebration.main_message = '✅ Great effort! You made solid progress today.';
            celebration.achievement_unlocked = 'Steady Learner';
        } else {
            celebration.main_message = '💪 You showed up and put in the work - that\'s what matters most!';
            celebration.achievement_unlocked = 'Dedicated Student';
        }

        // Progress highlight
        const topic = completedSession.topic || 'this topic';
        celebration.progress_highlight = `You've taken another important step in mastering ${topic}. Your brain is building new neural pathways!`;

        // Next session teaser
        celebration.next_session_teaser = `Next up: We'll build on what you learned today and explore even more exciting aspects of ${topic}!`;

        return celebration;
    }

    /**
     * Get streak motivation (for consecutive study days)
     */
    getStreakMotivation(streakDays) {
        if (streakDays <= 0) {
            return {
                message: "Today is day 1 of your learning journey. Every expert started exactly where you are now!",
                streak_status: 'starting',
                milestone: false
            };
        }

        const milestones = [7, 14, 30, 60, 100];
        const isMilestone = milestones.includes(streakDays);
        
        let message = '';
        let status = 'building';

        if (isMilestone) {
            status = 'milestone';
            if (streakDays === 7) {
                message = `🔥 One week streak! You're building a powerful learning habit!`;
            } else if (streakDays === 14) {
                message = `🚀 Two weeks strong! Your consistency is incredible!`;
            } else if (streakDays === 30) {
                message = `🏆 30-day streak! You're officially a learning champion!`;
            } else if (streakDays === 60) {
                message = `💎 60 days! Your dedication is truly inspiring!`;
            } else if (streakDays === 100) {
                message = `🌟 100-day streak! You're a learning legend!`;
            }
        } else if (streakDays < 7) {
            message = `Day ${streakDays} of your streak! You're building momentum! 🔥`;
        } else {
            message = `${streakDays} days strong! Your consistency is paying off! 💪`;
        }

        return {
            message,
            streak_days: streakDays,
            streak_status: status,
            milestone: isMilestone,
            next_milestone: milestones.find(m => m > streakDays) || null
        };
    }

    /**
     * Get default motivation message for fallback
     */
    getDefaultMotivationMessage(context) {
        const topic = context.current_topic || 'your studies';
        const messages = [
            `You're doing great with ${topic}! Every moment you spend learning is an investment in your future.`,
            `Keep going! Your dedication to mastering ${topic} is admirable and will pay off.`,
            `You've got this! Learning ${topic} might be challenging, but you're more capable than you know.`,
            `Progress in ${topic} happens one step at a time. You're exactly where you need to be.`,
            `Your curiosity about ${topic} is your greatest strength. Let it guide you forward!`
        ];

        const index = Math.floor(Math.random() * messages.length);
        return messages[index];
    }

    /**
     * Get default energy boost for fallback
     */
    getDefaultEnergyBoost(context) {
        const fatigueLevel = context.fatigue_level || 0.3;
        
        if (fatigueLevel > 0.6) {
            return {
                message: "Take a deep breath. You're doing important work, and it's okay to go at your own pace. You've got this!",
                type: 'gentle_energy',
                duration: 'quick_boost'
            };
        } else {
            return {
                message: "Your brain is amazing and ready to learn! Let's channel that energy into mastering new concepts. You're unstoppable!",
                type: 'high_energy',
                duration: 'quick_boost'
            };
        }
    }

    /**
     * Get fallback motivation for errors
     */
    getFallbackMotivation(context) {
        return {
            primary_message: this.getDefaultMotivationMessage(context),
            daily_affirmation: this.getDailyAffirmation(),
            progress_celebration: {
                achievement: 'Learning Effort',
                message: '🌟 You\'re here and ready to learn - that\'s already a victory!',
                celebration_type: 'effort'
            },
            next_goal: {
                goal: 'Complete your next learning session',
                timeframe: 'today',
                difficulty: 'manageable',
                reward: 'Feel proud of your commitment to growth'
            },
            motivation_style: {
                style: 'encouraging',
                approach: 'positive reinforcement',
                tone: 'warm and supportive',
                focus: 'celebrating effort and growth'
            },
            energy_boost: this.getDefaultEnergyBoost(context),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate weekly motivation summary
     */
    async generateWeeklyMotivationSummary(weeklyStats) {
        try {
            const prompt = `Create a motivational weekly summary for a student with these stats:
- Study sessions completed: ${weeklyStats.sessions_completed || 0}
- Total study time: ${weeklyStats.total_time || '0 hours'}
- Topics studied: ${weeklyStats.topics?.join(', ') || 'various topics'}
- Average performance: ${weeklyStats.average_score || 75}%
- Consistency: ${weeklyStats.study_days || 0} days out of 7

Create an encouraging summary that:
1. Celebrates their achievements
2. Notes areas of growth
3. Motivates them for the coming week
4. Includes specific praise for their efforts

Keep it positive and personalized.`;

            const result = await this.model.generateContent(prompt);
            const summary = result.response.text().trim();
            
            return {
                weekly_message: summary.replace(/["']/g, ''),
                achievement_level: this.calculateWeeklyAchievement(weeklyStats),
                next_week_focus: this.suggestNextWeekFocus(weeklyStats),
                motivation_score: this.calculateMotivationScore(weeklyStats)
            };

        } catch (error) {
            return {
                weekly_message: "You showed up and put in effort this week - that's what growth looks like! Keep building on this momentum.",
                achievement_level: 'committed',
                next_week_focus: 'Continue consistent daily practice',
                motivation_score: 7.5
            };
        }
    }

    /**
     * Calculate weekly achievement level
     */
    calculateWeeklyAchievement(stats) {
        const sessions = stats.sessions_completed || 0;
        const studyDays = stats.study_days || 0;
        const avgScore = stats.average_score || 75;

        if (studyDays >= 6 && sessions >= 10 && avgScore >= 85) {
            return 'exceptional';
        } else if (studyDays >= 5 && sessions >= 7 && avgScore >= 75) {
            return 'excellent';
        } else if (studyDays >= 3 && sessions >= 5) {
            return 'good';
        } else if (studyDays >= 1) {
            return 'committed';
        } else {
            return 'getting_started';
        }
    }

    /**
     * Suggest focus for next week
     */
    suggestNextWeekFocus(stats) {
        const studyDays = stats.study_days || 0;
        const avgScore = stats.average_score || 75;
        const sessions = stats.sessions_completed || 0;

        if (studyDays < 3) {
            return 'Build consistency - aim for studying at least 4 days next week';
        } else if (avgScore < 70) {
            return 'Focus on understanding - spend more time with challenging concepts';
        } else if (sessions < 5) {
            return 'Increase frequency - try for shorter, more frequent study sessions';
        } else {
            return 'Challenge yourself - explore advanced topics or applications';
        }
    }

    /**
     * Calculate motivation score (1-10)
     */
    calculateMotivationScore(stats) {
        const baseScore = 5;
        let score = baseScore;

        // Add points for consistency
        score += (stats.study_days || 0) * 0.5;
        
        // Add points for performance
        const avgScore = stats.average_score || 75;
        score += (avgScore - 50) / 10;
        
        // Add points for volume
        score += Math.min(2, (stats.sessions_completed || 0) * 0.2);

        return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
    }
}

module.exports = { MotivationAgent };