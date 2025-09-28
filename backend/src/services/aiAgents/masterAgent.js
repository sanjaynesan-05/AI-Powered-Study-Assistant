const { LearningPathGeneratorAgent } = require('./learningPathAgent');
const { AssessmentGeneratorAgent } = require('./assessmentAgent');
const { RecommendationAgent } = require('./recommendationAgent');

class MasterAIAgent {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.pathAgent = new LearningPathGeneratorAgent(apiKey);
    this.assessmentAgent = new AssessmentGeneratorAgent(apiKey);
    this.recommendationAgent = new RecommendationAgent(apiKey);
  }

  async createCompleteUserJourney(userProfile, targetSkill) {
    try {
      console.log(`Creating AI-powered learning journey for ${userProfile.name || 'user'} targeting ${targetSkill}`);

      // Step 1: Generate eligibility assessment
      console.log('Generating eligibility test...');
      const eligibilityTest = await this.assessmentAgent.generateEligibilityTest(
        targetSkill, 
        userProfile.experience || 'intermediate', 
        20
      );

      // Step 2: Generate personalized learning path
      console.log('Generating personalized learning path...');
      const learningPath = await this.pathAgent.generatePersonalizedPath(
        userProfile, 
        targetSkill, 
        userProfile.experience || 'beginner'
      );

      // Step 3: Create recommendations
      console.log('Generating personalized recommendations...');
      const recommendations = await this.recommendationAgent.generatePersonalizedRecommendations(
        userProfile, 
        { completedPaths: [], currentSkills: userProfile.skills || [] }
      );

      // Step 4: Generate next steps
      const nextSteps = await this.recommendationAgent.generateNextStepRecommendations(
        userProfile,
        { progress: 0, currentStep: 1 }
      );

      const completeJourney = {
        userProfile: {
          id: userProfile.id,
          name: userProfile.name,
          targetSkill: targetSkill
        },
        eligibilityTest: {
          ...eligibilityTest,
          status: 'ready_to_take'
        },
        learningPath: {
          ...learningPath,
          status: 'generated',
          startDate: null,
          progress: 0
        },
        recommendations: {
          ...recommendations,
          refreshDate: new Date().toISOString()
        },
        nextSteps: nextSteps,
        aiInsights: {
          pathConfidence: learningPath.confidence,
          recommendationConfidence: recommendations.confidenceScore,
          estimatedSuccessRate: this.calculateSuccessProbability(userProfile, learningPath),
          personalizedTips: await this.generatePersonalizedTips(userProfile),
          adaptabilityScore: 0.9 // How well the path can adapt to user progress
        },
        journey: {
          createdAt: new Date().toISOString(),
          status: 'initialized',
          phase: 'assessment_pending',
          estimatedCompletionWeeks: learningPath.estimatedWeeks
        }
      };

      console.log('Complete AI journey created successfully');
      return completeJourney;

    } catch (error) {
      console.error('Master Agent Journey Creation Error:', error);
      return this.getFallbackJourney(userProfile, targetSkill);
    }
  }

  calculateSuccessProbability(userProfile, learningPath) {
    let probability = 0.7; // Base probability

    // Adjust based on user profile completeness
    if (userProfile.skills && userProfile.skills.length > 0) probability += 0.1;
    if (userProfile.experience && userProfile.experience !== 'beginner') probability += 0.1;
    if (userProfile.timeCommitment && userProfile.timeCommitment >= 10) probability += 0.05;

    // Adjust based on learning path quality
    if (learningPath.confidence > 0.8) probability += 0.05;
    if (learningPath.steps && learningPath.steps.length >= 6) probability += 0.05;

    return Math.min(probability, 0.95);
  }

  async generatePersonalizedTips(userProfile) {
    const tips = [
      {
        category: 'learning_style',
        tip: 'Set aside dedicated time each day for focused learning',
        priority: 'high'
      },
      {
        category: 'motivation',
        tip: 'Track your progress daily to maintain motivation',
        priority: 'medium'
      },
      {
        category: 'practice',
        tip: 'Apply what you learn through hands-on projects',
        priority: 'high'
      }
    ];

    // Customize based on user profile
    if (userProfile.experience === 'beginner') {
      tips.push({
        category: 'foundation',
        tip: 'Focus on building strong fundamentals before moving to advanced topics',
        priority: 'high'
      });
    }

    if (userProfile.timeCommitment && userProfile.timeCommitment < 5) {
      tips.push({
        category: 'time_management',
        tip: 'Even 30 minutes of daily practice can lead to significant progress',
        priority: 'medium'
      });
    }

    return tips;
  }

  async analyzeUserProgress(userId, pathId, progressData) {
    try {
      console.log(`Analyzing progress for user ${userId} on path ${pathId}`);

      const analysis = {
        userId: userId,
        pathId: pathId,
        currentProgress: progressData.completionPercentage || 0,
        timeSpent: progressData.totalTimeSpent || 0,
        strongAreas: progressData.strongAreas || [],
        strugglingAreas: progressData.strugglingAreas || [],
        recommendedActions: []
      };

      // Generate adaptive recommendations based on progress
      if (analysis.strugglingAreas.length > 0) {
        analysis.recommendedActions.push({
          type: 'additional_resources',
          priority: 'high',
          description: `Focus on strengthening: ${analysis.strugglingAreas.join(', ')}`,
          resources: await this.generateAdditionalResources(analysis.strugglingAreas)
        });
      }

      // Pace adjustment recommendations
      if (analysis.timeSpent > progressData.expectedTimeSpent * 1.5) {
        analysis.recommendedActions.push({
          type: 'pace_adjustment',
          priority: 'medium',
          description: 'Consider slowing down to ensure better understanding',
          suggestion: 'Take more time with each concept'
        });
      }

      return analysis;

    } catch (error) {
      console.error('Progress Analysis Error:', error);
      return this.getFallbackProgressAnalysis(userId, pathId);
    }
  }

  async generateAdditionalResources(strugglingAreas) {
    const resourceMap = {
      'JavaScript': [
        { title: 'JavaScript Fundamentals Review', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'documentation' },
        { title: 'JavaScript Practice Exercises', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'practice' }
      ],
      'React': [
        { title: 'React Official Tutorial', url: 'https://reactjs.org/tutorial/tutorial.html', type: 'tutorial' },
        { title: 'React Practice Projects', url: 'https://github.com/topics/react-projects', type: 'practice' }
      ],
      'Default': [
        { title: 'Khan Academy', url: 'https://www.khanacademy.org/', type: 'course' },
        { title: 'Coursera Free Courses', url: 'https://www.coursera.org/courses?query=free', type: 'course' }
      ]
    };

    const resources = [];
    strugglingAreas.forEach(area => {
      const areaResources = resourceMap[area] || resourceMap['Default'];
      resources.push(...areaResources);
    });

    return resources.slice(0, 5); // Limit to 5 resources
  }

  getFallbackJourney(userProfile, targetSkill) {
    return {
      userProfile: {
        id: userProfile.id,
        name: userProfile.name,
        targetSkill: targetSkill
      },
      eligibilityTest: {
        testTitle: `${targetSkill} Basic Assessment`,
        description: `Evaluate your current knowledge in ${targetSkill}`,
        estimatedMinutes: 30,
        status: 'ready_to_take'
      },
      learningPath: {
        title: `Learn ${targetSkill}`,
        description: `Comprehensive path to master ${targetSkill}`,
        estimatedWeeks: 8,
        steps: [
          {
            stepNumber: 1,
            title: `${targetSkill} Fundamentals`,
            description: `Learn the basics of ${targetSkill}`,
            estimatedHours: 10
          }
        ],
        status: 'generated',
        confidence: 0.7
      },
      recommendations: {
        skillRecommendations: [
          {
            skill: targetSkill,
            priority: 'high',
            reasoning: `Focus on mastering ${targetSkill} fundamentals`
          }
        ]
      },
      nextSteps: {
        immediateActions: [
          {
            action: 'Take the eligibility assessment',
            priority: 'high',
            estimatedTime: '30 minutes'
          }
        ]
      },
      aiInsights: {
        pathConfidence: 0.7,
        recommendationConfidence: 0.7,
        estimatedSuccessRate: 0.75,
        personalizedTips: [
          {
            category: 'general',
            tip: 'Start with the basics and build a strong foundation',
            priority: 'high'
          }
        ]
      },
      journey: {
        createdAt: new Date().toISOString(),
        status: 'initialized',
        phase: 'assessment_pending'
      }
    };
  }

  getFallbackProgressAnalysis(userId, pathId) {
    return {
      userId: userId,
      pathId: pathId,
      currentProgress: 0,
      timeSpent: 0,
      strongAreas: [],
      strugglingAreas: [],
      recommendedActions: [
        {
          type: 'general_advice',
          priority: 'medium',
          description: 'Continue with your current learning pace',
          suggestion: 'Regular practice is key to improvement'
        }
      ]
    };
  }
}

module.exports = { MasterAIAgent };