/**
 * Master AI Agent Orchestrator - Coordinates all AI agents
 * JavaScript implementation from Python orchestrator
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { LearningResourceAgent } = require('./learningAgent');
const { AssessmentAgent } = require('./assessmentAgent');
const { WellnessAgent } = require('./wellnessAgent');
const { ScheduleAgent } = require('./scheduleAgent');
const { MotivationAgent } = require('./motivationAgent');
const { PersonalizationAgent } = require('./personalizationAgent');

class MasterAIAgentOrchestrator {
    constructor(geminiApiKey) {
        this.geminiApiKey = geminiApiKey;
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        // Initialize all specialized agents
        this.learningAgent = new LearningResourceAgent(geminiApiKey);
        this.assessmentAgent = new AssessmentAgent(geminiApiKey);
        this.wellnessAgent = new WellnessAgent(geminiApiKey);
        this.scheduleAgent = new ScheduleAgent(geminiApiKey);
        this.motivationAgent = new MotivationAgent(geminiApiKey);
        this.personalizationAgent = new PersonalizationAgent(geminiApiKey);

        this.conversationHistory = [];
        this.currentStep = 'initialization';
        this.agentOutputs = {};
    }

    /**
     * Main entry point for processing student requests
     */
    async processRequest(userInput, studentId = 'demo_student') {
        try {
            console.log(`🤖 Master Orchestrator: Processing request for student ${studentId}`);
            console.log(`📝 User Input: "${userInput}"`);

            // Step 1: Analyze user input to determine agent coordination strategy
            const inputAnalysis = await this.analyzeUserInput(userInput);
            console.log(`🔍 Input Analysis: ${JSON.stringify(inputAnalysis)}`);

            // Step 2: Coordinate agents based on analysis
            const orchestrationPlan = this.createOrchestrationPlan(inputAnalysis);
            console.log(`📋 Orchestration Plan: ${orchestrationPlan.strategy}`);

            // Step 3: Execute agent coordination
            const agentResults = await this.executeAgentCoordination(orchestrationPlan, userInput, studentId);

            // Step 4: Generate final coordinated response
            const finalResponse = await this.coordinateFinalResponse(agentResults, inputAnalysis);

            // Step 5: Update conversation history
            this.updateConversationHistory(userInput, finalResponse);

            return finalResponse;

        } catch (error) {
            console.error('Master Orchestrator Error:', error);
            return this.generateFallbackResponse(userInput);
        }
    }

    /**
     * Analyze user input to extract intent and requirements
     */
    async analyzeUserInput(userInput) {
        try {
            const prompt = `Analyze this student request to determine the coordination strategy:

Student Request: "${userInput}"

Determine:
1. Primary intent (study_planning, resource_finding, assessment, motivation, wellness_check, general_help)
2. Topic/subject mentioned
3. Complexity level (simple, moderate, complex)
4. Urgency (low, medium, high)
5. Required agents (learning, assessment, wellness, schedule, motivation, personalization)
6. Personalization needs (high, medium, low)

Return JSON:
{
  "primary_intent": "intent",
  "topic": "extracted topic",
  "complexity": "level",
  "urgency": "level",
  "required_agents": ["agent1", "agent2"],
  "personalization_needs": "level",
  "time_constraint": boolean,
  "has_specific_goals": boolean,
  "wellness_considerations": boolean
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedResponse);

        } catch (error) {
            console.error('Input Analysis Error:', error);
            return {
                primary_intent: 'general_help',
                topic: this.extractTopicFromInput(userInput),
                complexity: 'moderate',
                urgency: 'medium',
                required_agents: ['learning', 'motivation'],
                personalization_needs: 'medium',
                time_constraint: false,
                has_specific_goals: true,
                wellness_considerations: true
            };
        }
    }

    /**
     * Create orchestration plan based on input analysis
     */
    createOrchestrationPlan(inputAnalysis) {
        const plan = {
            strategy: '',
            agent_sequence: [],
            parallel_agents: [],
            coordination_type: '',
            expected_outcome: ''
        };

        // Determine strategy based on intent and complexity
        if (inputAnalysis.primary_intent === 'study_planning' && inputAnalysis.complexity === 'complex') {
            plan.strategy = 'comprehensive_study_journey';
            plan.agent_sequence = ['personalization', 'learning', 'wellness', 'assessment', 'schedule', 'motivation'];
            plan.coordination_type = 'sequential_with_feedback';
        } else if (inputAnalysis.primary_intent === 'resource_finding') {
            plan.strategy = 'resource_focused';
            plan.parallel_agents = ['learning', 'personalization'];
            plan.agent_sequence = ['motivation'];
            plan.coordination_type = 'parallel_then_sequential';
        } else if (inputAnalysis.primary_intent === 'assessment') {
            plan.strategy = 'assessment_centered';
            plan.agent_sequence = ['personalization', 'assessment', 'motivation'];
            plan.coordination_type = 'sequential';
        } else if (inputAnalysis.wellness_considerations) {
            plan.strategy = 'wellness_aware_learning';
            plan.agent_sequence = ['wellness', 'personalization', 'learning', 'schedule', 'motivation'];
            plan.coordination_type = 'wellness_first';
        } else {
            plan.strategy = 'balanced_approach';
            plan.agent_sequence = ['personalization', 'learning', 'motivation'];
            plan.coordination_type = 'sequential';
        }

        plan.expected_outcome = this.determineExpectedOutcome(inputAnalysis);
        return plan;
    }

    /**
     * Execute agent coordination based on plan
     */
    async executeAgentCoordination(plan, userInput, studentId) {
        const results = {
            personalization: null,
            learning: null,
            wellness: null,
            assessment: null,
            schedule: null,
            motivation: null
        };

        const topic = this.extractTopicFromInput(userInput);

        try {
            if (plan.coordination_type === 'sequential_with_feedback') {
                // Sequential execution with agent feedback loop
                for (const agentName of plan.agent_sequence) {
                    results[agentName] = await this.executeAgent(agentName, topic, results, studentId);
                    console.log(`✅ ${agentName} agent completed`);
                }
            } else if (plan.coordination_type === 'parallel_then_sequential') {
                // Execute parallel agents first
                const parallelPromises = plan.parallel_agents.map(agentName => 
                    this.executeAgent(agentName, topic, results, studentId)
                );
                const parallelResults = await Promise.all(parallelPromises);
                
                plan.parallel_agents.forEach((agentName, index) => {
                    results[agentName] = parallelResults[index];
                });

                // Then execute sequential agents
                for (const agentName of plan.agent_sequence) {
                    if (!plan.parallel_agents.includes(agentName)) {
                        results[agentName] = await this.executeAgent(agentName, topic, results, studentId);
                    }
                }
            } else {
                // Standard sequential execution
                for (const agentName of plan.agent_sequence) {
                    results[agentName] = await this.executeAgent(agentName, topic, results, studentId);
                    console.log(`✅ ${agentName} agent completed`);
                }
            }

        } catch (error) {
            console.error('Agent Coordination Error:', error);
            // Continue with available results
        }

        return results;
    }

    /**
     * Execute individual agent with context from other agents
     */
    async executeAgent(agentName, topic, previousResults, studentId) {
        try {
            switch (agentName) {
                case 'personalization':
                    return await this.personalizationAgent.getPersonalizedPath(
                        topic,
                        previousResults.learning?.resources || [],
                        previousResults.wellness || {},
                        studentId,
                        [] // Past performance would come from database
                    );

                case 'learning':
                    return await this.learningAgent.searchResources(topic);

                case 'wellness':
                    return await this.wellnessAgent.assessWellness();

                case 'assessment':
                    const learningResources = previousResults.learning?.resources || [];
                    return await this.assessmentAgent.generateQuiz(topic, learningResources, 3);

                case 'schedule':
                    return await this.scheduleAgent.getStudyPlan(
                        topic,
                        previousResults.learning?.resources || [],
                        previousResults.wellness || {}
                    );

                case 'motivation':
                    const motivationContext = {
                        performance_level: 'good_performance',
                        emotional_state: previousResults.wellness?.emotional_state || 'neutral',
                        fatigue_level: previousResults.wellness?.fatigue_level || 0.3,
                        progress_milestone: true,
                        current_topic: topic
                    };
                    return await this.motivationAgent.getMotivationalSupport(motivationContext);

                default:
                    console.warn(`Unknown agent: ${agentName}`);
                    return null;
            }
        } catch (error) {
            console.error(`Error executing ${agentName} agent:`, error);
            return null;
        }
    }

    /**
     * Coordinate final response from all agent outputs
     */
    async coordinateFinalResponse(agentResults, inputAnalysis) {
        try {
            const response = {
                greeting: this.generateGreeting(inputAnalysis),
                study_plan: this.formatStudyPlan(agentResults),
                learning_resources: this.formatLearningResources(agentResults),
                wellness_insights: this.formatWellnessInsights(agentResults),
                assessment: this.formatAssessment(agentResults),
                motivational_support: this.formatMotivationalSupport(agentResults),
                personalization_notes: this.formatPersonalizationNotes(agentResults),
                calendar_events: agentResults.schedule?.calendar_events || [],
                metadata: {
                    generated_at: new Date().toISOString(),
                    agents_used: Object.keys(agentResults).filter(key => agentResults[key] !== null),
                    orchestration_strategy: inputAnalysis.primary_intent,
                    session_id: `session_${Date.now()}`,
                    confidence_score: this.calculateConfidenceScore(agentResults)
                }
            };

            // Use AI to enhance the coordination
            response.ai_summary = await this.generateAISummary(agentResults, inputAnalysis);

            return response;

        } catch (error) {
            console.error('Final Response Coordination Error:', error);
            return this.generateFallbackResponse(inputAnalysis.topic);
        }
    }

    /**
     * Generate AI-powered summary of the coordinated response
     */
    async generateAISummary(agentResults, inputAnalysis) {
        try {
            const prompt = `Create a cohesive summary of this AI-coordinated learning response:

Student requested: ${inputAnalysis.primary_intent} for ${inputAnalysis.topic}

Agent Results:
- Learning Resources: ${agentResults.learning ? 'Generated' : 'Not available'}
- Wellness Assessment: ${agentResults.wellness ? 'Completed' : 'Not available'}
- Schedule Plan: ${agentResults.schedule ? 'Created' : 'Not available'}
- Assessment: ${agentResults.assessment ? 'Generated' : 'Not available'}
- Motivation: ${agentResults.motivation ? 'Provided' : 'Not available'}
- Personalization: ${agentResults.personalization ? 'Applied' : 'Not available'}

Create a 2-3 sentence summary that:
1. Explains what was created for the student
2. Highlights the personalization aspects
3. Encourages them to start their learning journey

Keep it warm, encouraging, and actionable.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();

        } catch (error) {
            return `I've created a personalized learning experience for ${inputAnalysis.topic} that adapts to your needs and preferences. Everything is optimized to help you succeed while maintaining good wellness habits. Ready to start your learning journey?`;
        }
    }

    /**
     * Helper methods for formatting agent outputs
     */
    generateGreeting(inputAnalysis) {
        const greetings = {
            'study_planning': `🎯 I've created a complete study plan for ${inputAnalysis.topic}!`,
            'resource_finding': `📚 Here are the best learning resources I found for ${inputAnalysis.topic}!`,
            'assessment': `📝 I've prepared a personalized assessment for ${inputAnalysis.topic}!`,
            'wellness_check': `🌿 Let's check your wellness and optimize your learning!`,
            'motivation': `💪 Here's some motivation to power your ${inputAnalysis.topic} journey!`,
            'general_help': `🤖 I'm here to help you master ${inputAnalysis.topic}!`
        };

        return greetings[inputAnalysis.primary_intent] || greetings['general_help'];
    }

    formatStudyPlan(agentResults) {
        const schedule = agentResults.schedule;
        const personalization = agentResults.personalization;

        if (!schedule) {
            return {
                topic: 'General Study Plan',
                duration: '2 hours',
                sessions: [],
                personalization_applied: false
            };
        }

        return {
            topic: schedule.topic,
            duration: schedule.total_duration,
            sessions: schedule.sessions?.slice(0, 3) || [], // Limit to 3 sessions
            break_schedule: schedule.break_schedule,
            wellness_integration: schedule.wellness_integration,
            personalization_applied: !!personalization,
            personalization_factors: personalization ? personalization.adaptation_factors : null
        };
    }

    formatLearningResources(agentResults) {
        const learning = agentResults.learning;
        
        if (!learning) {
            return {
                resources: [],
                total_found: 0,
                difficulty: 'intermediate',
                estimated_time: '2 hours'
            };
        }

        return {
            resources: learning.resources || [],
            total_found: learning.totalFound || learning.resources?.length || 0,
            difficulty: learning.difficulty || 'intermediate',
            estimated_time: learning.estimatedTime || '2 hours',
            topic: learning.topic
        };
    }

    formatWellnessInsights(agentResults) {
        const wellness = agentResults.wellness;
        
        if (!wellness) {
            return {
                fatigue_level: 0.3,
                stress_level: 0.2,
                emotional_state: 'neutral',
                recommendations: []
            };
        }

        return {
            fatigue_level: wellness.fatigue_level,
            stress_level: wellness.stress_level,
            emotional_state: wellness.emotional_state,
            recommendations: wellness.recommendations?.slice(0, 3) || [], // Top 3 recommendations
            wellness_breaks: wellness.wellness_breaks?.slice(0, 2) || [] // Top 2 breaks
        };
    }

    formatAssessment(agentResults) {
        const assessment = agentResults.assessment;
        
        if (!assessment) {
            return {
                available: false,
                question_count: 0,
                estimated_time: '0 minutes'
            };
        }

        return {
            available: true,
            quiz_id: assessment.quiz_id,
            topic: assessment.topic,
            question_count: assessment.total_questions || 0,
            estimated_time: assessment.estimated_time || '5 minutes',
            difficulty: assessment.difficulty || 'intermediate',
            instructions: assessment.instructions
        };
    }

    formatMotivationalSupport(agentResults) {
        const motivation = agentResults.motivation;
        
        if (!motivation) {
            return {
                primary_message: "You've got this! Every step forward is progress.",
                daily_affirmation: "Learning is a journey, and you're on the right path.",
                next_goal: "Complete your first study session"
            };
        }

        return {
            primary_message: motivation.primary_message,
            daily_affirmation: motivation.daily_affirmation,
            progress_celebration: motivation.progress_celebration,
            next_goal: motivation.next_goal?.goal || "Continue your learning journey",
            energy_boost: motivation.energy_boost?.message || "You're doing great!"
        };
    }

    formatPersonalizationNotes(agentResults) {
        const personalization = agentResults.personalization;
        
        if (!personalization) {
            return {
                applied: false,
                notes: "Standard learning approach applied"
            };
        }

        return {
            applied: true,
            learning_style: personalization.user_profile?.learning_style,
            difficulty_preference: personalization.user_profile?.difficulty_preference,
            adaptations_made: personalization.adaptation_factors?.adaptations_made || [],
            confidence_score: personalization.adaptation_factors?.confidence_score || 0.5,
            notes: personalization.personalized_path?.personalization_notes || "Personalized based on your profile"
        };
    }

    /**
     * Calculate overall confidence score for the response
     */
    calculateConfidenceScore(agentResults) {
        let totalScore = 0;
        let agentCount = 0;

        Object.values(agentResults).forEach(result => {
            if (result) {
                agentCount++;
                // Each successful agent adds to confidence
                totalScore += 0.8; // Base confidence per agent
                
                // Bonus for high-quality results
                if (result.confidence_score) {
                    totalScore += result.confidence_score * 0.2;
                }
            }
        });

        return agentCount > 0 ? Math.min(1, totalScore / agentCount) : 0.5;
    }

    /**
     * Extract topic from user input (simple extraction)
     */
    extractTopicFromInput(userInput) {
        const input = userInput.toLowerCase();
        
        // Common patterns
        if (input.includes('machine learning') || input.includes('ml')) return 'Machine Learning';
        if (input.includes('javascript') || input.includes('js')) return 'JavaScript';
        if (input.includes('python')) return 'Python';
        if (input.includes('react')) return 'React';
        if (input.includes('data science')) return 'Data Science';
        if (input.includes('web development')) return 'Web Development';
        if (input.includes('programming')) return 'Programming';
        
        // Try to extract from "learn X" or "study X" patterns
        const learnMatch = input.match(/(?:learn|study|understand|master)\s+([a-zA-Z\s]+)/);
        if (learnMatch) {
            return learnMatch[1].trim().split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        
        return 'General Studies';
    }

    /**
     * Determine expected outcome based on input analysis
     */
    determineExpectedOutcome(inputAnalysis) {
        const outcomes = {
            'study_planning': 'Complete personalized study plan with schedule and resources',
            'resource_finding': 'Curated list of learning resources with personalization',
            'assessment': 'Adaptive quiz with personalized difficulty and feedback',
            'wellness_check': 'Wellness assessment with actionable recommendations',
            'motivation': 'Personalized motivation and goal setting',
            'general_help': 'Comprehensive learning assistance with multiple aspects'
        };
        
        return outcomes[inputAnalysis.primary_intent] || outcomes['general_help'];
    }

    /**
     * Update conversation history for context
     */
    updateConversationHistory(userInput, response) {
        this.conversationHistory.push({
            timestamp: new Date().toISOString(),
            user_input: userInput,
            agent_response: response,
            agents_used: response.metadata?.agents_used || [],
            topic: response.study_plan?.topic || 'Unknown'
        });

        // Keep last 10 conversations
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
    }

    /**
     * Generate fallback response for errors
     */
    generateFallbackResponse(topic) {
        return {
            greeting: `I'm here to help you learn ${topic || 'new skills'}! 🤖`,
            study_plan: {
                topic: topic || 'General Learning',
                duration: '2 hours',
                sessions: [
                    {
                        day: 'Today',
                        session_number: 1,
                        topic: `Introduction to ${topic || 'your topic'}`,
                        duration: '30 minutes',
                        recommended_time: 'morning'
                    }
                ],
                personalization_applied: false
            },
            learning_resources: {
                resources: [
                    {
                        title: `${topic || 'Learning'} Fundamentals`,
                        description: 'Start with the basics and build a strong foundation',
                        type: 'tutorial',
                        platform: 'Learning Hub'
                    }
                ],
                total_found: 1,
                difficulty: 'intermediate',
                estimated_time: '1 hour'
            },
            wellness_insights: {
                fatigue_level: 0.3,
                stress_level: 0.2,
                emotional_state: 'ready_to_learn',
                recommendations: [
                    {
                        type: 'immediate',
                        title: 'Stay Hydrated',
                        description: 'Keep water nearby while studying'
                    }
                ]
            },
            assessment: {
                available: false,
                question_count: 0,
                estimated_time: '0 minutes'
            },
            motivational_support: {
                primary_message: "Every expert was once a beginner. You're taking the right steps to grow your knowledge!",
                daily_affirmation: "You have the power to learn anything you set your mind to.",
                next_goal: "Start with the basics and build momentum"
            },
            personalization_notes: {
                applied: false,
                notes: "I'm here to help personalize your learning experience as we work together!"
            },
            calendar_events: [],
            metadata: {
                generated_at: new Date().toISOString(),
                agents_used: ['fallback'],
                orchestration_strategy: 'fallback_mode',
                session_id: `fallback_session_${Date.now()}`,
                confidence_score: 0.6
            },
            ai_summary: `I've prepared a basic learning structure for ${topic || 'your studies'}. While I'm working with limited data right now, I'm ready to create more personalized experiences as we learn more about your preferences and goals!`
        };
    }

    /**
     * Get orchestrator status and health
     */
    getOrchestratorStatus() {
        return {
            status: 'operational',
            agents_initialized: {
                learning: !!this.learningAgent,
                assessment: !!this.assessmentAgent,
                wellness: !!this.wellnessAgent,
                schedule: !!this.scheduleAgent,
                motivation: !!this.motivationAgent,
                personalization: !!this.personalizationAgent
            },
            conversation_history_length: this.conversationHistory.length,
            current_step: this.currentStep,
            last_updated: new Date().toISOString()
        };
    }
}

module.exports = { MasterAIAgentOrchestrator };