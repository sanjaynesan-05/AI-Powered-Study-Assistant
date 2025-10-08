/**
 * Assessment Agent - Generates adaptive quizzes and evaluations
 * Enhanced implementation with adaptive learning capabilities
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

class AssessmentAgent {
    constructor(geminiApiKey) {
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        this.questionTypes = ['multiple-choice', 'true-false', 'short-answer', 'coding'];
    }

    /**
     * Generate adaptive quiz based on topic and learning resources
     */
    async generateQuiz(topic, learningResources = [], numQuestions = 5, difficulty = 'intermediate') {
        try {
            console.log(`📝 Assessment Agent: Generating ${numQuestions} questions for "${topic}"`);

            const prompt = this.buildQuizPrompt(topic, learningResources, numQuestions, difficulty);
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Parse and validate the quiz
            const quiz = this.parseQuizResponse(response);
            
            return {
                quiz_id: this.generateQuizId(topic),
                topic,
                difficulty,
                questions: quiz.questions || [],
                total_questions: quiz.questions?.length || 0,
                estimated_time: `${Math.ceil(quiz.questions?.length * 1.5)} minutes`,
                instructions: quiz.instructions || this.getDefaultInstructions(),
                scoring: {
                    total_points: quiz.questions?.length * 10 || 0,
                    passing_score: Math.ceil((quiz.questions?.length || 0) * 7) // 70% to pass
                }
            };

        } catch (error) {
            console.error('Assessment Agent Error:', error);
            return this.getFallbackQuiz(topic, numQuestions);
        }
    }

    /**
     * Original eligibility test generation (keeping for backward compatibility)
     */
    async generateEligibilityTest(skillArea, difficulty = 'intermediate', questionCount = 20) {
    const prompt = `
    You are an AI Assessment Generator. Create a comprehensive eligibility test.
    
    Parameters:
    - Skill Area: ${skillArea}
    - Difficulty Level: ${difficulty}
    - Number of Questions: ${questionCount}
    - Test Duration: 45 minutes
    
    Create a mix of question types:
    - 60% Multiple Choice Questions (4 options each)
    - 25% Scenario-based Questions
    - 15% Code/Practical Questions (if applicable)
    
    IMPORTANT: Return ONLY valid JSON in this exact format:
    {
      "testTitle": "${skillArea} Eligibility Assessment",
      "description": "Test description",
      "skillArea": "${skillArea}",
      "difficulty": "${difficulty}",
      "estimatedMinutes": 45,
      "passingScore": 70,
      "questions": [
        {
          "id": 1,
          "type": "multiple_choice",
          "question": "Question text here?",
          "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
          "correctAnswer": "A",
          "explanation": "Why this answer is correct",
          "difficulty": 3,
          "skillsTested": ["skill1", "skill2"],
          "timeAllocation": 2
        },
        {
          "id": 2,
          "type": "scenario",
          "question": "Scenario-based question text",
          "scenario": "Background context for the question",
          "options": ["A) Solution 1", "B) Solution 2", "C) Solution 3", "D) Solution 4"],
          "correctAnswer": "B",
          "explanation": "Why this approach is best",
          "difficulty": 4,
          "skillsTested": ["problem_solving"],
          "timeAllocation": 4
        }
      ],
      "skillsEvaluated": ["skill1", "skill2", "skill3"],
      "prerequisites": ["prerequisite knowledge"],
      "resultInterpretation": {
        "excellent": {"min": 90, "description": "Ready for advanced level"},
        "good": {"min": 75, "description": "Solid foundation, minor gaps"},
        "adequate": {"min": 60, "description": "Basic knowledge, needs improvement"},
        "needs_work": {"min": 0, "description": "Significant learning required"}
      }
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();
      
      // Clean up response
      response = response.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      const assessment = JSON.parse(response);
      
      // Add metadata
      assessment.id = this.generateAssessmentId();
      assessment.generatedBy = 'AI_Assessment_Agent';
      assessment.createdAt = new Date().toISOString();
      assessment.version = '1.0';
      
      return assessment;
    } catch (error) {
      console.error('Assessment Generation Error:', error);
      return this.getFallbackAssessment(skillArea, difficulty, questionCount);
    }
  }

  async generateAdaptiveQuestions(currentScore, answeredQuestions, skillGaps, skillArea) {
    const prompt = `
    Generate adaptive follow-up questions based on performance:
    
    Current Performance:
    - Score: ${currentScore}%
    - Questions Answered: ${answeredQuestions.length}
    - Identified Skill Gaps: ${skillGaps.join(', ')}
    - Skill Area: ${skillArea}
    
    Generate 5 targeted questions to:
    1. Better assess weak areas
    2. Confirm competency levels
    3. Provide accurate skill measurement
    
    Adapt question difficulty based on current performance.
    
    Return JSON with 5 questions in the same format as the main assessment.`;

    try {
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();
      response = response.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Adaptive Questions Error:', error);
      return this.getFallbackAdaptiveQuestions(skillArea);
    }
  }

  async analyzeTestResults(userAnswers, assessment, timeSpent) {
    const totalQuestions = assessment.questions.length;
    const correctAnswers = userAnswers.filter(answer => {
      const question = assessment.questions.find(q => q.id === answer.questionId);
      return question && question.correctAnswer === answer.selectedOption;
    }).length;

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const prompt = `
    Analyze detailed test performance and provide comprehensive insights:
    
    Test Results:
    - Score: ${score}% (${correctAnswers}/${totalQuestions})
    - Time Spent: ${timeSpent} minutes (Expected: ${assessment.estimatedMinutes})
    - Skill Area: ${assessment.skillArea}
    
    User Answers: ${JSON.stringify(userAnswers, null, 2)}
    Questions: ${JSON.stringify(assessment.questions, null, 2)}
    
    Provide comprehensive analysis in JSON format:
    {
      "overallScore": ${score},
      "percentile": 75,
      "timeEfficiency": "good|average|needs_improvement",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "skillBreakdown": {
        "skill1": {"score": 80, "assessment": "strong"},
        "skill2": {"score": 60, "assessment": "needs_work"}
      },
      "recommendations": [
        {
          "priority": "high",
          "area": "skill_area",
          "suggestion": "specific recommendation",
          "resources": ["resource1", "resource2"]
        }
      ],
      "nextSteps": ["step1", "step2"],
      "estimatedTimeToImprove": "4-6 weeks",
      "industryReadiness": "entry_level|junior|intermediate|senior",
      "certificationsRecommended": ["cert1", "cert2"],
      "personalizedTips": ["tip1", "tip2"]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();
      response = response.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      const analysis = JSON.parse(response);
      
      // Add calculated metrics
      analysis.rawScore = score;
      analysis.totalQuestions = totalQuestions;
      analysis.correctAnswers = correctAnswers;
      analysis.testDate = new Date().toISOString();
      analysis.timeSpent = timeSpent;
      
      return analysis;
    } catch (error) {
      console.error('Test Analysis Error:', error);
      return this.getFallbackAnalysis(score, correctAnswers, totalQuestions, timeSpent);
    }
  }

  generateAssessmentId() {
    return 'assessment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getFallbackAssessment(skillArea, difficulty, questionCount) {
    const questions = [];
    for (let i = 1; i <= Math.min(questionCount, 10); i++) {
      questions.push({
        id: i,
        type: "multiple_choice",
        question: `${skillArea} fundamental question ${i}?`,
        options: [
          "A) Option 1",
          "B) Option 2", 
          "C) Option 3",
          "D) Option 4"
        ],
        correctAnswer: "A",
        explanation: "This is the correct answer because...",
        difficulty: 3,
        skillsTested: [skillArea.toLowerCase().replace(/\s+/g, '_')],
        timeAllocation: 3
      });
    }

    return {
      id: this.generateAssessmentId(),
      testTitle: `${skillArea} Eligibility Assessment`,
      description: `Comprehensive assessment to evaluate your ${skillArea} knowledge and skills`,
      skillArea: skillArea,
      difficulty: difficulty,
      estimatedMinutes: 30,
      passingScore: 70,
      questions: questions,
      skillsEvaluated: [skillArea],
      prerequisites: ["Basic understanding of the subject"],
      resultInterpretation: {
        excellent: {min: 90, description: "Excellent understanding - ready for advanced topics"},
        good: {min: 75, description: "Good grasp - minor areas for improvement"},
        adequate: {min: 60, description: "Adequate knowledge - needs strengthening"},
        needs_work: {min: 0, description: "Foundational learning required"}
      },
      generatedBy: 'Fallback_System',
      createdAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  getFallbackAdaptiveQuestions(skillArea) {
    return {
      questions: [
        {
          id: 101,
          type: "multiple_choice",
          question: `What is a key concept in ${skillArea}?`,
          options: ["A) Concept 1", "B) Concept 2", "C) Concept 3", "D) Concept 4"],
          correctAnswer: "B",
          explanation: "This concept is fundamental to understanding the subject",
          difficulty: 3,
          skillsTested: [skillArea.toLowerCase()],
          timeAllocation: 3
        }
      ]
    };
  }

  getFallbackAnalysis(score, correctAnswers, totalQuestions, timeSpent) {
    let industryReadiness = "entry_level";
    if (score >= 90) industryReadiness = "senior";
    else if (score >= 75) industryReadiness = "intermediate";
    else if (score >= 60) industryReadiness = "junior";

    return {
      overallScore: score,
      percentile: Math.min(score + 10, 95),
      timeEfficiency: timeSpent <= 30 ? "good" : timeSpent <= 45 ? "average" : "needs_improvement",
      strengths: score >= 70 ? ["Good foundational knowledge"] : [],
      weaknesses: score < 70 ? ["Needs improvement in core concepts"] : [],
      skillBreakdown: {
        "core_concepts": {
          score: score,
          assessment: score >= 70 ? "adequate" : "needs_work"
        }
      },
      recommendations: [
        {
          priority: "high",
          area: "foundational_knowledge",
          suggestion: "Focus on strengthening core concepts",
          resources: ["Online tutorials", "Practice exercises"]
        }
      ],
      nextSteps: [
        "Review fundamental concepts",
        "Practice with real-world examples",
        "Take additional assessments to track progress"
      ],
      estimatedTimeToImprove: score >= 60 ? "2-4 weeks" : "6-8 weeks",
      industryReadiness: industryReadiness,
      certificationsRecommended: ["Foundational Certificate"],
      personalizedTips: [
        "Practice regularly to improve retention",
        "Focus on weak areas identified in this assessment"
      ],
      rawScore: score,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      testDate: new Date().toISOString(),
      timeSpent: timeSpent
    };
  }
}

module.exports = { AssessmentAgent };