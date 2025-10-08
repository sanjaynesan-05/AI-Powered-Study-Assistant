const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

class PythonAgentRunner {
  constructor() {
    this.pythonProcess = null;
    this.isReady = false;
    this.baseURL = 'http://localhost:8001';
    this.startupTimeout = 30000; // 30 seconds
  }

  /**
   * Start the Python FastAPI server
   */
  async start() {
    return new Promise((resolve, reject) => {
      console.log('🐍 Starting Python AI Agent Server...');
      
      const pythonAgentsPath = path.join(__dirname);
      const mainPyPath = path.join(pythonAgentsPath, 'main.py');
      
      // Check if Python is available
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      
      // Spawn Python process
      this.pythonProcess = spawn(pythonCmd, ['-u', mainPyPath], {
        cwd: pythonAgentsPath,
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let startupTimer = null;

      // Handle stdout
      this.pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Python Agent] ${output}`);
        
        // Check if server is ready
        if (output.includes('Uvicorn running') || output.includes('Application startup complete')) {
          this.isReady = true;
          if (startupTimer) {
            clearTimeout(startupTimer);
          }
          console.log('✅ Python AI Agent Server is ready');
          resolve();
        }
      });

      // Handle stderr
      this.pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`[Python Agent Error] ${error}`);
      });

      // Handle process exit
      this.pythonProcess.on('close', (code) => {
        console.log(`Python Agent Server exited with code ${code}`);
        this.isReady = false;
        this.pythonProcess = null;
      });

      // Handle process errors
      this.pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start Python Agent Server:', error.message);
        this.isReady = false;
        reject(error);
      });

      // Set startup timeout
      startupTimer = setTimeout(() => {
        if (!this.isReady) {
          console.log('⏰ Python Agent Server startup timeout - checking health...');
          this.checkHealth()
            .then(() => {
              this.isReady = true;
              resolve();
            })
            .catch(() => {
              reject(new Error('Python Agent Server failed to start within timeout'));
            });
        }
      }, this.startupTimeout);
    });
  }

  /**
   * Stop the Python FastAPI server
   */
  stop() {
    if (this.pythonProcess) {
      console.log('🛑 Stopping Python AI Agent Server...');
      this.pythonProcess.kill();
      this.pythonProcess = null;
      this.isReady = false;
    }
  }

  /**
   * Check if Python server is healthy
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get agent status
   */
  async getAgentStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/agents/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get agent status:', error.message);
      throw error;
    }
  }

  /**
   * Generate personalized study plan
   */
  async generateStudyPlan(userData) {
    try {
      const response = await axios.post(`${this.baseURL}/study-plan`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to generate study plan:', error.message);
      throw error;
    }
  }

  /**
   * Get learning resources
   */
  async getLearningResources(query) {
    try {
      const response = await axios.post(`${this.baseURL}/learning-resources`, query);
      return response.data;
    } catch (error) {
      console.error('Failed to get learning resources:', error.message);
      throw error;
    }
  }

  /**
   * Generate assessment
   */
  async generateAssessment(assessmentData) {
    try {
      const response = await axios.post(`${this.baseURL}/assessment`, assessmentData);
      return response.data;
    } catch (error) {
      console.error('Failed to generate assessment:', error.message);
      throw error;
    }
  }

  /**
   * Get wellness check
   */
  async getWellnessCheck(userData) {
    try {
      const response = await axios.post(`${this.baseURL}/wellness-check`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to get wellness check:', error.message);
      throw error;
    }
  }

  /**
   * Get motivational content
   */
  async getMotivation(userData) {
    try {
      const response = await axios.post(`${this.baseURL}/motivation`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to get motivation:', error.message);
      throw error;
    }
  }

  /**
   * Check if runner is ready
   */
  get ready() {
    return this.isReady;
  }
}

// Singleton instance
const pythonAgentRunner = new PythonAgentRunner();

module.exports = pythonAgentRunner;
