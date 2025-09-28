const { GoogleGenerativeAI } = require('@google/generative-ai');

class RecommendationAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generatePersonalizedRecommendations(userProfile, learningHistory, marketTrends = {}) {
    const prompt = `
    You are an AI Career and Learning Recommendation Engine. Generate personalized recommendations.
    
    User Profile:
    ${JSON.stringify(userProfile, null, 2)}
    
    Learning History:
    ${JSON.stringify(learningHistory, null, 2)}
    
    Market Trends:
    ${JSON.stringify(marketTrends, null, 2)}
    
    Generate comprehensive recommendations in JSON format:
    {
      "skillRecommendations": [
        {
          "skill": "skill_name",
          "priority": "high|medium|low",
          "reasoning": "why this skill is recommended",
          "marketDemand": 85,
          "difficulty": "beginner|intermediate|advanced",
          "estimatedLearningTime": "4-6 weeks",
          "careerImpact": "high|medium|low",
          "resources": [
            {
              "title": "Resource Name",
              "url": "https://example.com",
              "type": "course|article|video|book",
              "free": true
            }
          ]
        }
      ],
      "careerPaths": [
        {
          "title": "Career Path Title",
          "description": "What this career involves",
          "matchScore": 85,
          "requiredSkills": ["skill1", "skill2"],
          "averageSalary": "$70,000 - $120,000",
          "growthOutlook": "excellent|good|average|declining",
          "timeToQualify": "6-12 months"
        }
      ],
      "certifications": [
        {
          "name": "Certification Name",
          "provider": "Provider Name",
          "relevanceScore": 90,
          "estimatedCost": "$200-500",
          "timeToComplete": "2-3 months",
          "industryRecognition": "high|medium|low"
        }
      ],
      "projectIdeas": [
        {
          "title": "Project Title",
          "description": "What the project involves",
          "skillsUsed": ["skill1", "skill2"],
          "difficulty": "beginner|intermediate|advanced",
          "estimatedTime": "2-4 weeks",
          "portfolioValue": "high|medium|low"
        }
      ],
      "industryInsights": {
        "trendingSkills": ["skill1", "skill2"],
        "emergingTechnologies": ["tech1", "tech2"],
        "jobMarketOutlook": "positive|neutral|challenging",
        "remoteOpportunities": "high|medium|low"
      }
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();
      response = response.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      const recommendations = JSON.parse(response);
      
      // Add metadata and scoring
      recommendations.generatedAt = new Date().toISOString();
      recommendations.confidenceScore = this.calculateRecommendationConfidence(userProfile);
      recommendations.personalizedFor = userProfile.id || 'anonymous';
      
      // Score and rank recommendations
      return this.scoreAndRankRecommendations(recommendations, userProfile);
    } catch (error) {
      console.error('Recommendation Generation Error:', error);
      return this.getFallbackRecommendations(userProfile);
    }
  }

  calculateRecommendationConfidence(userProfile) {
    let confidence = 0.6; // Base confidence
    
    // Increase based on profile completeness
    if (userProfile.skills && userProfile.skills.length > 0) confidence += 0.1;
    if (userProfile.experience) confidence += 0.1;
    if (userProfile.education) confidence += 0.05;
    if (userProfile.careerGoals) confidence += 0.15;
    
    return Math.min(confidence, 0.95);
  }

  scoreAndRankRecommendations(recommendations, userProfile) {
    // Score skill recommendations
    if (recommendations.skillRecommendations) {
      recommendations.skillRecommendations = recommendations.skillRecommendations.map(skill => {
        let score = 0.5; // Base score
        
        // Market demand factor
        score += (skill.marketDemand || 50) / 100 * 0.25;
        
        // Career impact factor
        if (skill.careerImpact === 'high') score += 0.25;
        else if (skill.careerImpact === 'medium') score += 0.15;
        
        // Difficulty adjustment (easier skills get slight boost for beginners)
        if (userProfile.experience === 'beginner' && skill.difficulty === 'beginner') {
          score += 0.1;
        }
        
        // Priority boost
        if (skill.priority === 'high') score += 0.2;
        else if (skill.priority === 'medium') score += 0.1;
        
        return { ...skill, aiScore: Math.min(score, 1.0) };
      }).sort((a, b) => b.aiScore - a.aiScore);
    }

    // Score career paths
    if (recommendations.careerPaths) {
      recommendations.careerPaths = recommendations.careerPaths.sort((a, b) => 
        (b.matchScore || 0) - (a.matchScore || 0)
      );
    }

    return recommendations;
  }

  async generateSkillGapAnalysis(userSkills, targetRole) {
    const prompt = `
    Analyze skill gaps for career transition:
    
    Current Skills: ${userSkills.join(', ')}
    Target Role: ${targetRole}
    
    Provide detailed gap analysis:
    {
      "targetRole": "${targetRole}",
      "requiredSkills": ["skill1", "skill2"],
      "currentSkills": ${JSON.stringify(userSkills)},
      "skillGaps": [
        {
          "skill": "missing_skill",
          "importance": "critical|important|nice_to_have",
          "difficulty": "easy|medium|hard",
          "learningTime": "2-4 weeks",
          "resources": []
        }
      ],
      "strengthAreas": ["existing_skill1"],
      "readinessScore": 65,
      "timeToReadiness": "3-6 months",
      "prioritizedLearningPlan": []
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();
      response = response.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Skill Gap Analysis Error:', error);
      return this.getFallbackSkillGap(userSkills, targetRole);
    }
  }

  async generateNextStepRecommendations(userProfile, currentLearningPath) {
    const prompt = `
    Based on user's current progress, suggest next steps:
    
    User Profile: ${JSON.stringify(userProfile, null, 2)}
    Current Path Progress: ${JSON.stringify(currentLearningPath, null, 2)}
    
    Suggest immediate next actions:
    {
      "immediateActions": [
        {
          "action": "specific_action",
          "priority": "high|medium|low",
          "estimatedTime": "time_needed",
          "expectedOutcome": "what_user_will_gain"
        }
      ],
      "weeklyGoals": [],
      "monthlyMilestones": [],
      "resourceRecommendations": [],
      "motivationalTips": []
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();
      response = response.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Next Steps Recommendation Error:', error);
      return this.getFallbackNextSteps();
    }
  }

  getFallbackRecommendations(userProfile) {
    const baseSkills = ['Communication', 'Problem Solving', 'Critical Thinking'];
    const techSkills = ['JavaScript', 'Python', 'Data Analysis', 'Cloud Computing'];
    
    return {
      skillRecommendations: [
        {
          skill: "JavaScript",
          priority: "high",
          reasoning: "High demand programming language with versatile applications",
          marketDemand: 90,
          difficulty: "intermediate",
          estimatedLearningTime: "4-6 weeks",
          careerImpact: "high",
          resources: [
            {
              title: "JavaScript Fundamentals Course",
              url: "https://freecodecamp.org",
              type: "course",
              free: true
            }
          ],
          aiScore: 0.9
        },
        {
          skill: "Data Analysis",
          priority: "medium",
          reasoning: "Growing field with applications across all industries",
          marketDemand: 85,
          difficulty: "intermediate",
          estimatedLearningTime: "6-8 weeks",
          careerImpact: "high",
          resources: [
            {
              title: "Python for Data Analysis",
              url: "https://kaggle.com/learn",
              type: "course",
              free: true
            }
          ],
          aiScore: 0.8
        }
      ],
      careerPaths: [
        {
          title: "Full Stack Developer",
          description: "Develop both frontend and backend applications",
          matchScore: 85,
          requiredSkills: ["JavaScript", "HTML/CSS", "Node.js", "Database"],
          averageSalary: "$70,000 - $120,000",
          growthOutlook: "excellent",
          timeToQualify: "6-12 months"
        }
      ],
      certifications: [
        {
          name: "Google IT Professional Certificate",
          provider: "Google",
          relevanceScore: 80,
          estimatedCost: "$39-79/month",
          timeToComplete: "3-6 months",
          industryRecognition: "high"
        }
      ],
      projectIdeas: [
        {
          title: "Personal Portfolio Website",
          description: "Create a responsive website showcasing your skills and projects",
          skillsUsed: ["HTML", "CSS", "JavaScript"],
          difficulty: "beginner",
          estimatedTime: "2-3 weeks",
          portfolioValue: "high"
        }
      ],
      industryInsights: {
        trendingSkills: ["AI/ML", "Cloud Computing", "Cybersecurity"],
        emergingTechnologies: ["Blockchain", "IoT", "AR/VR"],
        jobMarketOutlook: "positive",
        remoteOpportunities: "high"
      },
      generatedAt: new Date().toISOString(),
      confidenceScore: 0.7,
      personalizedFor: userProfile.id || 'anonymous'
    };
  }

  getFallbackSkillGap(userSkills, targetRole) {
    return {
      targetRole: targetRole,
      requiredSkills: ["JavaScript", "React", "Node.js", "Database"],
      currentSkills: userSkills,
      skillGaps: [
        {
          skill: "React",
          importance: "critical",
          difficulty: "medium",
          learningTime: "4-6 weeks",
          resources: ["Official React Documentation", "React Tutorial on freeCodeCamp"]
        }
      ],
      strengthAreas: userSkills.filter(skill => 
        ["JavaScript", "HTML", "CSS"].includes(skill)
      ),
      readinessScore: 60,
      timeToReadiness: "3-6 months",
      prioritizedLearningPlan: [
        "Learn React fundamentals",
        "Build practice projects",
        "Learn state management",
        "Practice with real-world scenarios"
      ]
    };
  }

  getFallbackNextSteps() {
    return {
      immediateActions: [
        {
          action: "Complete current learning module",
          priority: "high",
          estimatedTime: "1-2 hours",
          expectedOutcome: "Progress in current path"
        },
        {
          action: "Practice coding exercises",
          priority: "medium",
          estimatedTime: "30 minutes daily",
          expectedOutcome: "Improved coding skills"
        }
      ],
      weeklyGoals: [
        "Complete 2-3 coding challenges",
        "Read 1 technical article",
        "Work on personal project"
      ],
      monthlyMilestones: [
        "Complete current learning path",
        "Build one portfolio project",
        "Apply to 5 relevant positions"
      ],
      resourceRecommendations: [
        "LeetCode for coding practice",
        "GitHub for project hosting",
        "LinkedIn Learning for skill development"
      ],
      motivationalTips: [
        "Set small daily goals to maintain momentum",
        "Track your progress to see improvement",
        "Connect with others learning similar skills"
      ]
    };
  }
}

module.exports = { RecommendationAgent };