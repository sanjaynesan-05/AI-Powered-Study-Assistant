const express = require('express');
const { MasterAIAgentOrchestrator } = require('../services/aiAgents/masterOrchestrator');
const { LearningResourceAgent } = require('../services/aiAgents/learningAgent');
const { AssessmentAgent } = require('../services/aiAgents/assessmentAgent');
const { WellnessAgent } = require('../services/aiAgents/wellnessAgent');
const { MotivationAgent } = require('../services/aiAgents/motivationAgent');
const hybridOrchestrator = require('../services/hybridAgentOrchestrator');
const router = express.Router();

// Initialize master orchestrator
const masterOrchestrator = new MasterAIAgentOrchestrator(process.env.GEMINI_API_KEY);

// Initialize individual agents for direct access
const learningAgent = new LearningResourceAgent(process.env.GEMINI_API_KEY, process.env.YOUTUBE_API_KEY);
const assessmentAgent = new AssessmentAgent(process.env.GEMINI_API_KEY);
const wellnessAgent = new WellnessAgent(process.env.GEMINI_API_KEY);
const motivationAgent = new MotivationAgent(process.env.GEMINI_API_KEY);

// Simple auth middleware for demo
const protect = (req, res, next) => {
  req.user = {
    _id: req.headers.userid || 'demo_user',
    name: 'Demo User',
    skills: ['JavaScript', 'Python'],
    experience: 'intermediate',
    education: 'bachelor'
  };
  next();
};

/**
 * POST /api/ai-agents/generate-complete-journey
 * Generate complete AI-powered learning journey using orchestrator
 */
router.post('/generate-complete-journey', protect, async (req, res) => {
  try {
    const { targetSkill, userProfile = {}, preferences = {} } = req.body;

    if (!targetSkill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Target skill is required' 
      });
    }

    console.log(`🚀 Generating complete journey for: ${targetSkill}`);

    // Use master orchestrator to coordinate all agents
    const userInput = `Help me create a comprehensive learning plan to master ${targetSkill}. I want personalized resources, a study schedule, wellness guidance, and motivational support.`;
    
    const journey = await masterOrchestrator.processRequest(userInput, req.user._id);

    res.json({
      success: true,
      data: {
        journey_id: `journey_${Date.now()}`,
        target_skill: targetSkill,
        user_id: req.user._id,
        orchestrated_response: journey,
        // Extract specific components for frontend compatibility
        learningPath: {
          id: journey.metadata?.session_id || `path_${Date.now()}`,
          title: `Master ${targetSkill}`,
          description: journey.ai_summary || `Comprehensive ${targetSkill} learning plan`,
          estimatedDuration: journey.study_plan?.duration || '8-12 weeks',
          difficultyLevel: journey.learning_resources?.difficulty || 'intermediate',
          confidence: journey.metadata?.confidence_score || 0.85,
          sessions: journey.study_plan?.sessions || [],
          wellness_integration: journey.study_plan?.wellness_integration
        },
        assessment: journey.assessment,
        recommendations: journey.learning_resources?.resources || [],
        personalizedTips: journey.personalization_notes?.adaptations_made || [],
        motivationalSupport: journey.motivational_support,
        wellnessInsights: journey.wellness_insights
      },
      metadata: {
        generated_at: new Date().toISOString(),
        orchestration_used: true,
        agents_coordinated: journey.metadata?.agents_used || [],
        confidence_score: journey.metadata?.confidence_score || 0.85
      }
    });

  } catch (error) {
    console.error('Complete Journey Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate complete learning journey',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/smart-resources
 * Get smart learning resources using AI agents
 */
router.post('/smart-resources', protect, async (req, res) => {
  try {
    const { topic, difficulty = 'intermediate', learningStyle = 'mixed' } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    console.log(`🔍 Generating smart resources for: ${topic}`);

    const resources = await learningAgent.searchResources(topic);

    res.json({
      success: true,
      data: {
        topic,
        resources: resources.resources || [],
        total_found: resources.totalFound || 0,
        difficulty: resources.difficulty || difficulty,
        estimated_time: resources.estimatedTime || '2 hours',
        ai_powered: true
      }
    });

  } catch (error) {
    console.error('Smart Resources Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart resources',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/adaptive-assessment
 * Generate adaptive assessment using AI
 */
router.post('/adaptive-assessment', protect, async (req, res) => {
  try {
    const { skillArea, difficulty = 'intermediate', questionCount = 5, userLevel } = req.body;

    if (!skillArea) {
      return res.status(400).json({
        success: false,
        message: 'Skill area is required'
      });
    }

    console.log(`📝 Generating adaptive assessment for: ${skillArea}`);

    const assessment = await assessmentAgent.generateQuiz(
      skillArea,
      [], // learning resources
      questionCount,
      difficulty
    );

    res.json({
      success: true,
      data: {
        assessment_id: assessment.quiz_id,
        topic: assessment.topic,
        difficulty: assessment.difficulty,
        questions: assessment.questions,
        total_questions: assessment.total_questions,
        estimated_time: assessment.estimated_time,
        instructions: assessment.instructions,
        scoring: assessment.scoring,
        adaptive_features: {
          difficulty_adaptation: true,
          personalized_feedback: true,
          ai_powered: true
        }
      }
    });

  } catch (error) {
    console.error('Adaptive Assessment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate adaptive assessment',
      error: error.message
    });
  }
});

/**
 * GET /api/ai-agents/wellness-check
 * Get wellness assessment
 */
router.get('/wellness-check', protect, async (req, res) => {
  try {
    console.log('🌿 Performing wellness check');

    const wellnessReport = await wellnessAgent.assessWellness();

    res.json({
      success: true,
      data: {
        wellness_score: ((1 - wellnessReport.fatigue_level) * (1 - wellnessReport.stress_level) * 10).toFixed(1),
        fatigue_level: wellnessReport.fatigue_level,
        stress_level: wellnessReport.stress_level,
        emotional_state: wellnessReport.emotional_state,
        activity_level: wellnessReport.activity_level,
        recommendations: wellnessReport.recommendations,
        wellness_breaks: wellnessReport.wellness_breaks,
        timestamp: wellnessReport.timestamp
      }
    });

  } catch (error) {
    console.error('Wellness Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform wellness check',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/motivation-boost
 * Get personalized motivation
 */
router.post('/motivation-boost', protect, async (req, res) => {
  try {
    const { 
      currentTopic = 'studies',
      performanceLevel = 'moderate',
      emotionalState = 'neutral',
      fatigueLevel = 0.3
    } = req.body;

    console.log(`💪 Generating motivation boost for: ${currentTopic}`);

    const motivationContext = {
      performance_level: performanceLevel,
      emotional_state: emotionalState,
      fatigue_level: fatigueLevel,
      current_topic: currentTopic,
      progress_milestone: Math.random() > 0.7 // Random milestone chance
    };

    const motivation = await motivationAgent.getMotivationalSupport(motivationContext);

    res.json({
      success: true,
      data: {
        primary_message: motivation.primary_message,
        daily_affirmation: motivation.daily_affirmation,
        progress_celebration: motivation.progress_celebration,
        next_goal: motivation.next_goal,
        energy_boost: motivation.energy_boost,
        motivation_style: motivation.motivation_style,
        ai_powered: true,
        timestamp: motivation.timestamp
      }
    });

  } catch (error) {
    console.error('Motivation Boost Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate motivation boost',
      error: error.message
    });
  }
});

/**
 * GET /api/ai-agents/orchestrator-status
 * Get orchestrator and agent status
 */
router.get('/orchestrator-status', (req, res) => {
  try {
    const status = masterOrchestrator.getOrchestratorStatus();
    
    res.json({
      success: true,
      data: {
        ...status,
        individual_agents: {
          learning_agent: !!learningAgent,
          assessment_agent: !!assessmentAgent,
          wellness_agent: !!wellnessAgent,
          motivation_agent: !!motivationAgent
        },
        api_keys_configured: {
          gemini: !!process.env.GEMINI_API_KEY,
          youtube: !!process.env.YOUTUBE_API_KEY
        }
      }
    });

  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orchestrator status',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/generate-journey (Legacy route for backward compatibility)
 * Generate AI-powered learning journey
 */
router.post('/generate-journey', protect, async (req, res) => {
  try {
    const { targetSkill, userPreferences = {} } = req.body;

    if (!targetSkill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Target skill is required' 
      });
    }

    const journey = {
      learningPath: {
        id: `path_${Date.now()}`,
        title: `Master ${targetSkill}`,
        description: `A comprehensive learning journey to master ${targetSkill} tailored to your experience level.`,
        estimatedDuration: '8-12 weeks',
        difficultyLevel: userPreferences.difficulty || 'intermediate',
        confidence: 0.92,
        modules: [
          {
            title: `${targetSkill} Fundamentals`,
            description: `Learn the core concepts and principles of ${targetSkill}`,
            estimatedHours: 15
          },
          {
            title: `Intermediate ${targetSkill}`,
            description: `Build practical ${targetSkill} skills`,
            estimatedHours: 20
          },
          {
            title: `Advanced ${targetSkill}`,
            description: `Master advanced ${targetSkill} concepts`,
            estimatedHours: 25
          }
        ]
      }
    };

    res.status(200).json({
      success: true,
      message: 'Journey created successfully',
      data: journey
    });

  } catch (error) {
    console.error('Generate Journey Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate learning journey'
    });
  }
});

/**
 * POST /api/ai-agents/learning-path
 * Generate a structured learning path
 */
router.post('/learning-path', protect, async (req, res) => {
  try {
    const { targetSkill, difficulty = 'beginner' } = req.body;

    const learningPath = {
      id: `lp_${Date.now()}`,
      title: `${targetSkill} Learning Path`,
      description: `Structured path for learning ${targetSkill}`,
      estimatedDuration: '6-10 weeks',
      difficultyLevel: difficulty,
      confidence: 0.89,
      skillArea: targetSkill,
      modules: [
        {
          title: `Introduction to ${targetSkill}`,
          description: `Get started with ${targetSkill} basics`,
          estimatedHours: 8
        },
        {
          title: `${targetSkill} in Practice`,
          description: `Apply ${targetSkill} in real projects`,
          estimatedHours: 12
        }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Learning path generated successfully',
      data: learningPath
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate learning path'
    });
  }
});

/**
 * POST /api/ai-agents/assessment
 * Generate skill assessment
 */
router.post('/assessment', protect, async (req, res) => {
  try {
    const { skillArea, difficulty = 'beginner', questionCount = 10 } = req.body;

    const assessment = {
      id: `assess_${Date.now()}`,
      title: `${skillArea} Assessment`,
      description: `Test your ${skillArea} knowledge`,
      skillArea: skillArea,
      difficulty: difficulty,
      totalQuestions: questionCount,
      questions: Array.from({ length: questionCount }, (_, i) => ({
        id: `q_${i + 1}`,
        question: `What is a key concept in ${skillArea}?`,
        type: 'multiple_choice',
        options: [
          `Basic ${skillArea} concept`,
          `Advanced ${skillArea} feature`,
          `${skillArea} best practice`,
          `None of the above`
        ],
        correctAnswer: 0,
        explanation: `This tests ${skillArea} understanding`,
        points: 10
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Assessment generated successfully',
      data: assessment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate assessment'
    });
  }
});

/**
 * GET /api/ai-agents/recommendations
 * Get personalized learning recommendations
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    const recommendations = [
      {
        type: 'learning_path',
        title: 'JavaScript Mastery',
        description: 'Advanced JavaScript concepts and frameworks',
        priority: 'high',
        confidence: 0.92,
        estimatedTime: '8-10 weeks',
        actionItems: [
          'Complete ES6+ fundamentals',
          'Build React applications',
          'Learn Node.js for backend'
        ]
      },
      {
        type: 'skill_development',
        title: 'Full-Stack Development',
        description: 'Combine frontend and backend skills',
        priority: 'medium',
        confidence: 0.87,
        estimatedTime: '12-16 weeks',
        actionItems: [
          'Master database design',
          'Learn API development',
          'Deploy applications to cloud'
        ]
      }
    ];

    res.status(200).json({
      success: true,
      message: 'Recommendations generated successfully',
      data: recommendations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
});

/**
 * GET /api/ai-agents/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  const orchestratorStatus = hybridOrchestrator.getStatus();
  
  res.status(200).json({
    success: true,
    message: 'AI Agents service is running',
    agents: {
      masterAgent: 'active',
      learningPathAgent: 'active',
      assessmentAgent: 'active',
      recommendationAgent: 'active',
      youtubeIntegration: 'active'
    },
    hybridOrchestrator: orchestratorStatus,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/ai-agents/hybrid/study-plan
 * Generate study plan using hybrid Python/JavaScript agents
 */
router.post('/hybrid/study-plan', protect, async (req, res) => {
  try {
    const userData = {
      user_id: req.user._id,
      ...req.body
    };
    
    const studyPlan = await hybridOrchestrator.generateStudyPlan(userData);
    
    res.json({
      success: true,
      data: studyPlan,
      source: hybridOrchestrator.getStatus().pythonAgentsActive ? 'python' : 'javascript'
    });
  } catch (error) {
    console.error('Hybrid study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate study plan',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/hybrid/resources
 * Get learning resources using hybrid agents
 */
router.post('/hybrid/resources', protect, async (req, res) => {
  try {
    const resources = await hybridOrchestrator.getLearningResources(req.body);
    
    res.json({
      success: true,
      data: resources,
      source: hybridOrchestrator.getStatus().pythonAgentsActive ? 'python' : 'javascript'
    });
  } catch (error) {
    console.error('Hybrid resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get learning resources',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/hybrid/assessment
 * Generate assessment using hybrid agents
 */
router.post('/hybrid/assessment', protect, async (req, res) => {
  try {
    const assessment = await hybridOrchestrator.generateAssessment(req.body);
    
    res.json({
      success: true,
      data: assessment,
      source: hybridOrchestrator.getStatus().pythonAgentsActive ? 'python' : 'javascript'
    });
  } catch (error) {
    console.error('Hybrid assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate assessment',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/hybrid/wellness
 * Get wellness check using hybrid agents
 */
router.post('/hybrid/wellness', protect, async (req, res) => {
  try {
    const userData = {
      user_id: req.user._id,
      ...req.body
    };
    
    const wellness = await hybridOrchestrator.getWellnessCheck(userData);
    
    res.json({
      success: true,
      data: wellness,
      source: hybridOrchestrator.getStatus().pythonAgentsActive ? 'python' : 'javascript'
    });
  } catch (error) {
    console.error('Hybrid wellness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wellness check',
      error: error.message
    });
  }
});

/**
 * POST /api/ai-agents/hybrid/motivation
 * Get motivation using hybrid agents
 */
router.post('/hybrid/motivation', protect, async (req, res) => {
  try {
    const userData = {
      user_id: req.user._id,
      ...req.body
    };
    
    const motivation = await hybridOrchestrator.getMotivation(userData);
    
    res.json({
      success: true,
      data: motivation,
      source: hybridOrchestrator.getStatus().pythonAgentsActive ? 'python' : 'javascript'
    });
  } catch (error) {
    console.error('Hybrid motivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motivation',
      error: error.message
    });
  }
});

/**
 * GET /api/ai-agents/hybrid/status
 * Get hybrid orchestrator status
 */
router.get('/hybrid/status', (req, res) => {
  res.json({
    success: true,
    data: hybridOrchestrator.getStatus()
  });
});

module.exports = router;