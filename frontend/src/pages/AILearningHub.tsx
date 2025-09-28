import React, { useState, useEffect } from 'react';
import { useAIAgent } from '../contexts/AIAgentContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  TrendingUp,
  Play,
  RotateCcw,
  Award
} from 'lucide-react';

const AILearningHub: React.FC = () => {
  const { user } = useAuth();
  const {
    isGenerating,
    currentJourney,
    learningPaths,
    recommendations,
    error,
    generateCompleteJourney,
    generateLearningPath,
    generateAssessment,
    analyzeAssessmentResults,
    getPersonalizedRecommendations,
    getSkillGapAnalysis,
    clearError
  } = useAIAgent();

  // Form states
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [preferences, setPreferences] = useState({
    timeCommitment: 10,
    learningStyle: 'mixed',
    careerGoals: ''
  });

  // Assessment states
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [assessmentStartTime, setAssessmentStartTime] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  // UI states
  const [activeTab, setActiveTab] = useState('generate');
  const [skillGapResults, setSkillGapResults] = useState<any>(null);

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Machine Learning', 
    'Data Science', 'DevOps', 'Digital Marketing', 'UI/UX Design',
    'Node.js', 'Cloud Computing', 'Cybersecurity', 'Blockchain'
  ];

  useEffect(() => {
    if (user) {
      getPersonalizedRecommendations();
    }
  }, [user]);

  const handleGenerateJourney = async () => {
    if (!selectedSkill && !skillInput) return;
    
    const targetSkill = selectedSkill || skillInput;
    await generateCompleteJourney(targetSkill, preferences);
  };

  const handleGenerateLearningPath = async () => {
    if (!selectedSkill && !skillInput) return;
    
    const targetSkill = selectedSkill || skillInput;
    await generateLearningPath(targetSkill, difficulty, preferences);
  };

  const handleGenerateAssessment = async () => {
    if (!selectedSkill && !skillInput) return;
    
    const skillArea = selectedSkill || skillInput;
    const assessment = await generateAssessment(skillArea, difficulty, 20);
    
    if (assessment) {
      setCurrentAssessment(assessment);
      setCurrentQuestion(0);
      setUserAnswers([]);
      setAssessmentStartTime(Date.now());
      setShowResults(false);
    }
  };

  const handleAnswerQuestion = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);

    if (currentQuestion < currentAssessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = async (answers: number[]) => {
    const timeSpent = Math.round((Date.now() - assessmentStartTime) / 1000 / 60); // minutes
    const results = await analyzeAssessmentResults(answers, currentAssessment, timeSpent);
    
    if (results) {
      setAssessmentResults(results);
      setShowResults(true);
    }
  };

  const handleSkillGapAnalysis = async () => {
    if (!preferences.careerGoals) return;
    
    const results = await getSkillGapAnalysis(preferences.careerGoals);
    setSkillGapResults(results);
  };

  const resetAssessment = () => {
    setCurrentAssessment(null);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setAssessmentResults(null);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <XCircle className="h-5 w-5 text-red-500" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">AI Learning Hub</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Harness the power of AI to create personalized learning journeys, take skill assessments, 
          and get intelligent recommendations for your career growth.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
          {[
            { id: 'generate', label: 'Generate Journey', icon: Target },
            { id: 'assessment', label: 'Skill Assessment', icon: Award },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
            { id: 'paths', label: 'My Paths', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === id 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Journey Tab */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Generate AI Learning Journey</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Skill Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What do you want to learn?</h3>
              
              {/* Popular Skills */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Popular Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSelectedSkill(selectedSkill === skill ? '' : skill);
                        setSkillInput('');
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedSkill === skill
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Or enter a custom skill:</p>
                <input
                  type="text"
                  placeholder="e.g., Advanced TypeScript, Product Management, etc."
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setSelectedSkill('');
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleGenerateJourney}
                disabled={isGenerating || (!selectedSkill && !skillInput)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  isGenerating || (!selectedSkill && !skillInput)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Generating Journey...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>Generate Complete Journey</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleGenerateLearningPath}
                disabled={isGenerating || (!selectedSkill && !skillInput)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium border transition-colors ${
                  isGenerating || (!selectedSkill && !skillInput)
                    ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Generate Learning Path Only</span>
              </button>

              <button 
                onClick={handleGenerateAssessment}
                disabled={isGenerating || (!selectedSkill && !skillInput)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium border transition-colors ${
                  isGenerating || (!selectedSkill && !skillInput)
                    ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Create Assessment</span>
              </button>
            </div>

            {/* Journey Results */}
            {currentJourney && (
              <div className="mt-8 space-y-6">
                <h3 className="text-xl font-semibold">Your AI-Generated Learning Journey</h3>
                
                {currentJourney.learningPath && (
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="border-b px-6 py-4">
                      <h3 className="text-lg font-semibold">{currentJourney.learningPath.title}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{currentJourney.learningPath.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{currentJourney.learningPath.estimatedDuration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Difficulty: {currentJourney.learningPath.difficultyLevel}</span>
                        </div>
                      </div>
                      
                      {/* Modules */}
                      {currentJourney.learningPath.modules && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Learning Modules:</h4>
                          <div className="space-y-2">
                            {currentJourney.learningPath.modules.map((module: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                                <CheckCircle className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">{module.title}</p>
                                  <p className="text-sm text-gray-600">{module.description}</p>
                                  {module.estimatedHours && (
                                    <p className="text-xs text-gray-500">{module.estimatedHours} hours</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {currentJourney.recommendations && currentJourney.recommendations.length > 0 && (
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="border-b px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">AI Recommendations</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {currentJourney.recommendations.map((rec: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <p className="text-gray-600 text-sm">{rec.description}</p>
                            <span className={`inline-block px-2 py-1 mt-1 text-xs rounded ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {rec.priority} Priority
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
      {activeTab !== 'generate' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 text-center">
            <p className="text-gray-600">
              🚀 {activeTab === 'assessment' ? 'AI Skill Assessment' :
                   activeTab === 'recommendations' ? 'AI Recommendations' :
                   'My Learning Paths'} feature coming soon!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The AI agent system is ready - frontend implementation in progress.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningHub;