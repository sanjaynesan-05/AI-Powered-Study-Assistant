import React, { useState } from 'react';
import { aiAgentService } from './services/aiAgentService';
import { AgentOrchestrationView } from './components/AgentOrchestrationView';
import { SkillGraphVisualization } from './components/SkillGraphVisualization';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { WellnessMeter } from './components/WellnessMeter';

function App() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [userInput, setUserInput] = useState('I want to learn Machine Learning');
  const [masteredSkills, setMasteredSkills] = useState('Python, Mathematics Basics');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await aiAgentService.processLearningRequest({
        user_id: 'demo_user',
        user_input: userInput,
        mastered_skills: masteredSkills.split(',').map(s => s.trim()).filter(s => s)
      });

      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing request. Make sure backend is running on port 8000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎓 AI-Powered Study Assistant
          </h1>
          <p className="text-gray-600">
            Powered by 11 AI Agents + LangGraph Orchestration
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                What do you want to learn?
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., I want to learn Machine Learning"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Skills you've already mastered (comma-separated)
              </label>
              <input
                type="text"
                value={masteredSkills}
                onChange={(e) => setMasteredSkills(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Python, JavaScript, HTML"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '🤖 Processing with 11 AI Agents...' : '🚀 Start Learning Journey'}
            </button>
          </form>
        </div>

        {/* Results */}
        {response && (
          <div className="space-y-6">
            {/* Agent Orchestration */}
            <AgentOrchestrationView
              executionPath={response.agent_outputs ? Object.keys(response.agent_outputs) : []}
              agentOutputs={response.agent_outputs || {}}
              confidenceScores={response.confidence_scores || {}}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Graph */}
              {response.agent_outputs?.skill_graph && (
                <SkillGraphVisualization
                  skillDependencies={response.agent_outputs.skill_graph.skill_dependencies || {}}
                  masteredSkills={response.agent_outputs.skill_graph.mastered_skills || []}
                  currentSkill={response.current_skill || ''}
                  learningPath={response.learning_path || []}
                />
              )}

              {/* Wellness Meter */}
              {response.agent_outputs?.wellness && (
                <WellnessMeter
                  fatigueLevel={response.agent_outputs.wellness.fatigue_level || 0}
                  stressLevel={response.agent_outputs.wellness.stress_level || 0}
                  emotionalState={response.emotional_tone || 'neutral'}
                  burnoutRisk={response.agent_outputs.wellness.burnout_risk || 'low'}
                  recommendations={response.wellness_recommendations || []}
                />
              )}
            </div>

            {/* Explainability Panel */}
            <ExplainabilityPanel
              explanations={response.explanations || {}}
              reasoningChain={response.reasoning_chain || []}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Backend: http://localhost:8000 | API Docs: http://localhost:8000/docs</p>
          <p className="mt-2">Built for SIH 2025 🏆</p>
        </div>
      </div>
    </div>
  );
}

export default App;
