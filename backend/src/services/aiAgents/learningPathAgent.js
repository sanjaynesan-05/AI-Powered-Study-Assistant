const { GoogleGenerativeAI } = require('@google/generative-ai');

class LearningPathGeneratorAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generatePersonalizedPath(userProfile, targetSkill, difficulty = 'beginner') {
    const prompt = `
    You are an AI Learning Path Generator. Create a comprehensive, personalized learning path.
    
    User Profile:
    - Education: ${userProfile.education || 'student'}
    - Current Skills: ${userProfile.skills?.join(', ') || 'beginner'}
    - Experience: ${userProfile.experience || 'beginner'}
    - Time Available: ${userProfile.timeCommitment || 10} hours/week
    - Learning Style: ${userProfile.learningStyle || 'mixed'}
    
    Target Skill: ${targetSkill}
    Difficulty Level: ${difficulty}
    
    Create a JSON response with a structured learning path that includes:
    1. Clear title and description
    2. Realistic time estimates
    3. 6-10 progressive learning steps
    4. Diverse resource types (videos, articles, courses, practice)
    5. Practical projects
    6. Assessment checkpoints
    
    IMPORTANT: Return ONLY valid JSON in this exact format:
    {
      "title": "Learning Path Title",
      "description": "Detailed description of what the user will learn",
      "estimatedWeeks": 8,
      "difficulty": "${difficulty}",
      "prerequisites": ["prerequisite1", "prerequisite2"],
      "steps": [
        {
          "stepNumber": 1,
          "title": "Step Title",
          "description": "What the user will learn in this step",
          "estimatedHours": 8,
          "resources": [
            {
              "title": "Resource Title",
              "url": "https://example.com/resource",
              "type": "video",
              "free": true,
              "rating": 4.5,
              "description": "What this resource covers"
            }
          ],
          "practicalTask": "Hands-on project or exercise",
          "assessmentQuestions": 5
        }
      ],
      "projects": [
        {
          "title": "Final Project",
          "description": "Capstone project description",
          "estimatedHours": 20
        }
      ],
      "certifications": ["relevant certification names"],
      "skillsGained": ["skill1", "skill2", "skill3"]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();
      
      // Clean up response to ensure valid JSON
      response = response.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      const learningPath = JSON.parse(response);
      
      // Add AI-generated metadata
      learningPath.generatedBy = 'AI_Agent';
      learningPath.createdAt = new Date().toISOString();
      learningPath.confidence = this.calculateConfidence(userProfile, targetSkill);
      learningPath.adaptable = true;
      
      return learningPath;
    } catch (error) {
      console.error('Learning Path Generation Error:', error);
      return this.getFallbackPath(targetSkill, difficulty);
    }
  }

  calculateConfidence(userProfile, targetSkill) {
    let confidence = 0.7; // Base confidence
    
    // Increase if user has related skills
    const relatedSkills = this.findRelatedSkills(userProfile.skills || [], targetSkill);
    confidence += relatedSkills.length * 0.05;
    
    // Adjust based on experience level
    if (userProfile.experience === 'intermediate') confidence += 0.1;
    if (userProfile.experience === 'advanced') confidence += 0.15;
    if (userProfile.education === 'graduate') confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  }

  findRelatedSkills(userSkills, targetSkill) {
    const skillRelations = {
      'React': ['JavaScript', 'HTML', 'CSS', 'Node.js'],
      'Data Science': ['Python', 'Statistics', 'SQL', 'Machine Learning'],
      'Machine Learning': ['Python', 'Mathematics', 'Statistics', 'Data Science'],
      'Full Stack Development': ['JavaScript', 'HTML', 'CSS', 'Node.js', 'React', 'Database'],
      'DevOps': ['Linux', 'Docker', 'AWS', 'Git', 'CI/CD'],
      'Cybersecurity': ['Networking', 'Linux', 'Python', 'Security Fundamentals']
    };

    const related = skillRelations[targetSkill] || [];
    return userSkills.filter(skill => 
      related.some(relatedSkill => 
        skill.toLowerCase().includes(relatedSkill.toLowerCase())
      )
    );
  }

  getFallbackPath(targetSkill, difficulty) {
    return {
      title: `Learn ${targetSkill}`,
      description: `A comprehensive learning path to master ${targetSkill} skills.`,
      estimatedWeeks: 8,
      difficulty: difficulty,
      prerequisites: [],
      steps: [
        {
          stepNumber: 1,
          title: `${targetSkill} Fundamentals`,
          description: `Learn the basic concepts and fundamentals of ${targetSkill}`,
          estimatedHours: 12,
          resources: [
            {
              title: `Introduction to ${targetSkill}`,
              url: "https://www.freecodecamp.org",
              type: "course",
              free: true,
              rating: 4.5,
              description: `Beginner-friendly introduction to ${targetSkill}`
            }
          ],
          practicalTask: `Create a simple ${targetSkill} project`,
          assessmentQuestions: 5
        }
      ],
      projects: [
        {
          title: `${targetSkill} Portfolio Project`,
          description: `Build a comprehensive project showcasing your ${targetSkill} skills`,
          estimatedHours: 20
        }
      ],
      certifications: [`${targetSkill} Professional Certificate`],
      skillsGained: [targetSkill, "Problem Solving", "Project Management"],
      generatedBy: 'Fallback_System',
      createdAt: new Date().toISOString(),
      confidence: 0.6,
      adaptable: true
    };
  }

  async adaptPathToProgress(learningPath, userProgress, strugglingAreas) {
    const prompt = `
    Adapt this learning path based on user progress:
    
    Original Path: ${JSON.stringify(learningPath, null, 2)}
    
    User Progress:
    - Completion: ${userProgress.completionPercentage}%
    - Time Spent: ${userProgress.actualTime} hours (Expected: ${userProgress.expectedTime} hours)
    - Struggling Areas: ${strugglingAreas.join(', ')}
    - Strong Areas: ${userProgress.strongAreas?.join(', ') || 'None identified'}
    
    Provide adaptations in JSON format:
    {
      "adaptations": [
        {
          "type": "add_resources",
          "stepNumber": 1,
          "reason": "User struggling with this concept",
          "newResources": []
        }
      ],
      "paceAdjustment": "slower|normal|faster",
      "additionalSupport": ["suggestion1", "suggestion2"],
      "modifiedSteps": []
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      return JSON.parse(response.replace(/```json\n?/, '').replace(/```\n?$/, ''));
    } catch (error) {
      console.error('Path Adaptation Error:', error);
      return {
        adaptations: [],
        paceAdjustment: "normal",
        additionalSupport: ["Consider reviewing basic concepts", "Practice more exercises"],
        modifiedSteps: []
      };
    }
  }
}

module.exports = { LearningPathGeneratorAgent };