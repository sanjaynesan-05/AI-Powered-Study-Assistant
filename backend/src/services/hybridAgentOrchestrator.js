const pythonAgentRunner = require('./pythonAgents/pythonAgentRunner');

// Import JavaScript fallback agents
const { LearningResourceAgent } = require('./aiAgents/learningAgent');
const { AssessmentAgent } = require('./aiAgents/assessmentAgent');
const { WellnessAgent } = require('./aiAgents/wellnessAgent');
const { ScheduleAgent } = require('./aiAgents/scheduleAgent');
const { MotivationAgent } = require('./aiAgents/motivationAgent');
const { PersonalizationAgent } = require('./aiAgents/personalizationAgent');

class HybridAgentOrchestrator {
  constructor() {
    // JavaScript fallback agents
    this.learningAgent = new LearningResourceAgent(process.env.GEMINI_API_KEY, process.env.YOUTUBE_API_KEY);
    this.assessmentAgent = new AssessmentAgent(process.env.GEMINI_API_KEY);
    this.wellnessAgent = new WellnessAgent(process.env.GEMINI_API_KEY);
    this.scheduleAgent = new ScheduleAgent(process.env.GEMINI_API_KEY);
    this.motivationAgent = new MotivationAgent(process.env.GEMINI_API_KEY);
    this.personalizationAgent = new PersonalizationAgent(process.env.GEMINI_API_KEY);
    
    this.usePythonAgents = false;
  }

  /**
   * Initialize the orchestrator
   */
  async initialize() {
    try {
      console.log('🔧 Initializing Hybrid Agent Orchestrator...');
      
      // Try to start Python agents
      await pythonAgentRunner.start();
      
      // Verify Python agents are healthy
      const isHealthy = await pythonAgentRunner.checkHealth();
      if (isHealthy) {
        this.usePythonAgents = true;
        const status = await pythonAgentRunner.getAgentStatus();
        console.log('✅ Python Agents Active:', status);
      } else {
        console.warn('⚠️  Python agents unhealthy, using JavaScript fallbacks');
      }
    } catch (error) {
      console.warn('⚠️  Python agents unavailable, using JavaScript fallbacks:', error.message);
      this.usePythonAgents = false;
    }
  }

  /**
   * Shutdown the orchestrator
   */
  shutdown() {
    if (pythonAgentRunner.ready) {
      pythonAgentRunner.stop();
    }
  }

  /**
   * Generate personalized study plan
   */
  async generateStudyPlan(userData) {
    if (this.usePythonAgents && pythonAgentRunner.ready) {
      try {
        return await pythonAgentRunner.generateStudyPlan(userData);
      } catch (error) {
        console.warn('Python agent failed, falling back to JavaScript:', error.message);
      }
    }
    
    // JavaScript fallback
    const personalization = await this.personalizationAgent.createPersonalizedPlan(userData);
    const schedule = await this.scheduleAgent.createSchedule(userData);
    return { personalization, schedule };
  }

  /**
   * Get learning resources
   */
  async getLearningResources(query) {
    if (this.usePythonAgents && pythonAgentRunner.ready) {
      try {
        return await pythonAgentRunner.getLearningResources(query);
      } catch (error) {
        console.warn('Python agent failed, falling back to JavaScript:', error.message);
      }
    }
    
    // JavaScript fallback
    return await this.learningAgent.findResources(query);
  }

  /**
   * Generate assessment
   */
  async generateAssessment(assessmentData) {
    if (this.usePythonAgents && pythonAgentRunner.ready) {
      try {
        return await pythonAgentRunner.generateAssessment(assessmentData);
      } catch (error) {
        console.warn('Python agent failed, falling back to JavaScript:', error.message);
      }
    }
    
    // JavaScript fallback
    return await this.assessmentAgent.generateAssessment(assessmentData);
  }

  /**
   * Get wellness check
   */
  async getWellnessCheck(userData) {
    if (this.usePythonAgents && pythonAgentRunner.ready) {
      try {
        return await pythonAgentRunner.getWellnessCheck(userData);
      } catch (error) {
        console.warn('Python agent failed, falling back to JavaScript:', error.message);
      }
    }
    
    // JavaScript fallback
    return await this.wellnessAgent.checkWellness(userData);
  }

  /**
   * Get motivational content
   */
  async getMotivation(userData) {
    if (this.usePythonAgents && pythonAgentRunner.ready) {
      try {
        return await pythonAgentRunner.getMotivation(userData);
      } catch (error) {
        console.warn('Python agent failed, falling back to JavaScript:', error.message);
      }
    }
    
    // JavaScript fallback
    return await this.motivationAgent.generateMotivation(userData);
  }

  /**
   * Get orchestrator status
   */
  getStatus() {
    return {
      pythonAgentsActive: this.usePythonAgents && pythonAgentRunner.ready,
      fallbackAvailable: true,
      agents: {
        learning: true,
        assessment: true,
        wellness: true,
        schedule: true,
        motivation: true,
        personalization: true
      }
    };
  }
}

// Singleton instance
const hybridOrchestrator = new HybridAgentOrchestrator();

module.exports = hybridOrchestrator;
