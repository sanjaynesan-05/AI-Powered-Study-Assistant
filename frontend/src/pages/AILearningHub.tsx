import React, { useState, useEffect } from 'react';
import { useAIAgent } from '../contexts/AIAgentContext';
import { useAuth } from '../contexts/AuthContext';
import { advancedAILearningService, LearningObjective, EnhancedTopic } from '../services/advancedAILearningService';
import { youtubeService, YouTubeVideo } from '../services/youtubeService';
import { enhancedLearningPathService, EnhancedLearningPath } from '../services/enhancedLearningPathService';
import StepByStepLearningPath from '../components/StepByStepLearningPath';
import UnifiedLearningView from '../components/UnifiedLearningView';
import ErrorBoundary from '../components/ErrorBoundary';
import SkeletonLearningView from '../components/SkeletonLearningView';
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
  Award,
  Star,
  Map,
  ExternalLink,
  ArrowLeft,
  Youtube,
  FileText,
  ChevronRight,
  ChevronDown,
  Zap,
  Users,
  Code,
  Sparkles,
  Search
} from 'lucide-react';
import { useRef } from 'react';

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
    clearError,
    learningResources,
    getSmartResources,
    enhancedPaths,
    setEnhancedPaths,
    generateEnhancedJourney
  } = useAIAgent();

  // Form states
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillInput, setSkillInput] = useState('');

  // Enhanced learning path states
  const [enhancedLearningPath, setEnhancedLearningPath] = useState<EnhancedLearningPath | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showEnhancedPath, setShowEnhancedPath] = useState(false);
  const [loadingEnhancedPath, setLoadingEnhancedPath] = useState(false);
  const [fullPipelineData, setFullPipelineData] = useState<any>(null);
  const [isGeneratingPipeline, setIsGeneratingPipeline] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [requestHistory, setRequestHistory] = useState<string[]>([]);
  const [persona, setPersona] = useState('mentor'); // mentor | coach | chill
  const [userStats, setUserStats] = useState({ 
    xp: parseInt(localStorage.getItem('ai_learning_xp') || '0'),
    level: parseInt(localStorage.getItem('ai_learning_level') || '1') 
  });
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [difficulty, setDifficulty] = useState('beginner');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
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
  const [showLearningResources, setShowLearningResources] = useState(false);

  // Enhanced Learning Path states
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [pathTopics, setPathTopics] = useState<any[]>([]);
  const [showDetailedPath, setShowDetailedPath] = useState(false);

  // Get supported skills from enhanced learning path service
  const popularSkills = enhancedLearningPathService.getSupportedSkills();

  // Additional skills that don't have enhanced paths yet
  const additionalSkills = [
    'DevOps', 'Digital Marketing', 'UI/UX Design',
    'Cloud Computing', 'Cybersecurity', 'Blockchain'
  ];

  useEffect(() => {
    let interval: any;
    let durationInterval: any;
    
    if (isGeneratingPipeline) {
       interval = setInterval(() => {
          setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
       }, 5000);
       
       durationInterval = setInterval(() => {
          setLoadingDuration(prev => prev + 1);
       }, 1000);
    } else {
       setLoadingStep(0);
       setLoadingDuration(0);
       clearInterval(interval);
       clearInterval(durationInterval);
    }
    return () => {
       clearInterval(interval);
       clearInterval(durationInterval);
    };
  }, [isGeneratingPipeline]);

  useEffect(() => {
    if (fullPipelineData && resultsRef.current) {
       resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
       
       // Award XP (Investor Grade Loop)
       const newXP = userStats.xp + 50;
       const newLevel = Math.floor(newXP / 250) + 1;
       setUserStats({ xp: newXP, level: newLevel });
       localStorage.setItem('ai_learning_xp', newXP.toString());
       localStorage.setItem('ai_learning_level', newLevel.toString());
    }
  }, [fullPipelineData]);

  // Derived Personalization Insights
  const getPersonalizationInsight = () => {
    if (requestHistory.length < 2) return "Establishing your learning profile...";
    const focus = requestHistory[0];
    const diffPref = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    return `Optimized for your pattern: focusing on ${focus} with ${diffPref} depth.`;
  };

  const handleGenerateJourney = async () => {
    if (!selectedSkill && !skillInput) return;

    const targetSkill = selectedSkill || skillInput;

    // Check if skill is supported for enhanced learning path
    if (enhancedLearningPathService.isSkillSupported(targetSkill)) {
      // Show level selection modal or use default 'Beginner'
      const level = difficulty === 'beginner' ? 'Beginner' :
        difficulty === 'intermediate' ? 'Intermediate' : 'Advanced';
      await generateEnhancedPath(targetSkill, level);
    } else {
      // Fallback to regular AI journey generation
      await generateCompleteJourney(targetSkill, preferences);
      // Also fetch learning resources using Gemini AI
      await getSmartResources(targetSkill, difficulty);
      setShowLearningResources(true);
      setActiveTab('paths'); // Immediately redirect the user so they can clearly see the saved course
    }
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

  // Enhanced Learning Path Functions
  const generateEnhancedPath = async (skill: string, level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner') => {
    setLoadingEnhancedPath(true);
    try {
      const path = await enhancedLearningPathService.generateEnhancedLearningPath(skill, level);
      setEnhancedLearningPath(path);

      // Store the path into the "My Paths" collection so it doesn't vanish
      setEnhancedPaths(prev => {
        // Prevent storing direct duplicates
        if (!prev.find(p => p.title === path.title)) {
          return [path, ...prev];
        }
        return prev;
      });

      setShowEnhancedPath(true);
      setCompletedSteps([]); // Reset completed steps
    } catch (error) {
      console.error('Error generating enhanced learning path:', error);
      // Show error message to user
      alert(`Unable to generate enhanced path for ${skill}. This skill may not be supported yet.`);
    }
    setLoadingEnhancedPath(false);
  };

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleBackToSkillSelection = () => {
    setShowEnhancedPath(false);
    setEnhancedLearningPath(null);
    setCompletedSteps([]);
  };

  // Enhanced Learning Path Functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStartLearning = (path: any) => {
    setSelectedPath(path);
    setPathTopics(path.topics);
    setShowDetailedPath(true);
  };

  const handleBackToOverview = () => {
    setShowDetailedPath(false);
    setSelectedPath(null);
    setPathTopics([]);
  };

  const handleToggleTopicComplete = (topicId: string) => {
    const updatedPaths = enhancedPaths.map(path => {
      if (path.id === selectedPath.id) {
        const updatedTopics = path.topics.map((topic: any) =>
          topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
        );
        const completedCount = updatedTopics.filter((t: any) => t.completed).length;
        const progress = Math.round((completedCount / updatedTopics.length) * 100);

        const updatedPath = {
          ...path,
          topics: updatedTopics,
          completedTopics: completedCount,
          progress: progress
        };

        setSelectedPath(updatedPath);
        setPathTopics(updatedTopics);
        return updatedPath;
      }
      return path;
    });
    setEnhancedPaths(updatedPaths);
  };

  const handleOpenResource = (url: string) => {
    window.open(url, '_blank');
  };

  const handleToggleTopicExpansion = (topicId: string) => {
    setExpandedTopicId(prev => prev === topicId ? null : topicId);
  };

  const handleGoToRoadmap = (_pathId: string, category: string) => {
    const roadmaps: Record<string, string> = {
      'Frontend Development': 'https://roadmap.sh/pdfs/roadmaps/frontend.pdf',
      'Backend Development': 'https://roadmap.sh/pdfs/roadmaps/backend.pdf',
      'Data Science': 'https://roadmap.sh/pdfs/roadmaps/ai-data-scientist.pdf',
      'Cybersecurity': 'https://roadmap.sh/pdfs/roadmaps/cyber-security.pdf',
      'Fullstack Development': 'https://roadmap.sh/pdfs/roadmaps/full-stack.pdf'
    };

    const roadmapUrl = roadmaps[category];
    if (roadmapUrl) {
      window.open(roadmapUrl, '_blank');
    }
  };

  // Enhanced AI-powered learning path generation
  const handleGenerateEnhancedJourney = async (forcedSkill?: string) => {
    const baseSkill = forcedSkill || selectedSkill || skillInput;
    if (!baseSkill || isGeneratingPipeline) return;

    // Personality Injection
    const personaInstruction = persona === 'coach' ? " (Fast-paced, action-oriented coach tone)" : 
                               persona === 'chill' ? " (Relaxed, simple, conversational chill tone)" : 
                               " (Structured, academic mentor tone)";
    const targetSkill = baseSkill + personaInstruction;

    // Update history
    setRequestHistory(prev => {
       const newHistory = [baseSkill, ...prev.filter(s => s !== baseSkill)].slice(0, 5);
       return newHistory;
    });

    setIsGeneratingPipeline(true);
    setLoadingStep(0);
    setLoadingDuration(0);
    setPipelineError(null);
    setFullPipelineData(null);
    
    try {
       const result = await advancedAILearningService.generateFullLearningPipeline(targetSkill);
       if (result.status === "error") {
           setPipelineError(result.warning || "There was an error generating your learning path.");
       } else {
           setFullPipelineData(result);
       }
    } catch (err: any) {
       console.error("Pipeline Error", err);
       setPipelineError(err.message || "A network error occurred. Please try again.");
    } finally {
       setIsGeneratingPipeline(false);
    }
  };
  // Enhanced YouTube video search for topics
  const handleSearchVideosForTopic = async (topicName: string) => {
    try {
      const videos = await youtubeService.searchEducationalVideos({
        query: `${topicName} tutorial programming`,
        maxResults: 3,
        duration: 'medium'
      });

      if (videos.length > 0) {
        // Update the current topic with real YouTube videos
        const updatedTopics = pathTopics.map(topic =>
          topic.name === topicName
            ? { ...topic, videos: videos, hasVideo: true, videoUrl: videos[0].videoUrl }
            : topic
        );
        setPathTopics(updatedTopics);

        // Open the first video
        handleOpenResource(videos[0].videoUrl);
      }
    } catch (error) {
      console.error('Video search failed:', error);
      // Fallback to curated videos
      const curatedVideos = youtubeService.getCuratedVideos(topicName);
      if (curatedVideos.length > 0) {
        handleOpenResource(curatedVideos[0].videoUrl);
      }
    }
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

  // Show Enhanced Learning Path if active
  if (showEnhancedPath && enhancedLearningPath) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBackToSkillSelection}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Skill Selection</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Enhanced Learning Path</span>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {enhancedLearningPath.skill}
            </div>
          </div>
        </div>

        <StepByStepLearningPath
          learningPath={enhancedLearningPath}
          onStepComplete={handleStepComplete}
          completedSteps={completedSteps}
        />
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
          Harness the power of AI to create personalized, rich learning journeys and dynamic modules.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
          {[
            { id: 'generate', label: 'Generate Journey', icon: Target },
            { id: 'paths', label: 'My Paths', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === id
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Popular Skills:</p>
                  <div className="flex items-center space-x-1 text-xs text-yellow-600">
                    <Sparkles className="w-3 h-3" />
                    <span>Enhanced paths available</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSelectedSkill(selectedSkill === skill ? '' : skill);
                        setSkillInput('');
                      }}
                      className={`relative px-3 py-1 rounded-full text-sm border transition-colors ${selectedSkill === skill
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {skill}
                      {enhancedLearningPathService.isSkillSupported(skill) && (
                        <Sparkles className="w-3 h-3 inline ml-1 text-yellow-500" />
                      )}
                    </button>
                  ))}
                  {additionalSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSelectedSkill(selectedSkill === skill ? '' : skill);
                        setSkillInput('');
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedSkill === skill
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
                  onKeyDown={(e) => {
                    if(e.key === 'Enter') handleGenerateEnhancedJourney(skillInput);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Request History */}
              {requestHistory.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Recent goals:</p>
                  <div className="flex flex-wrap gap-2">
                     {requestHistory.map((historyItem, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                             setSkillInput(historyItem);
                             setSelectedSkill('');
                             handleGenerateEnhancedJourney(historyItem);
                          }}
                          className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-full px-3 py-1 flex items-center transition"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {historyItem}
                        </button>
                     ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center">
                   <Users className="w-4 h-4 mr-2 text-indigo-500" />
                   AI Personality Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                   {['mentor', 'coach', 'chill'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setPersona(p)}
                        className={`py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg border transition-all ${
                           persona === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'
                        }`}
                      >
                         {p}
                      </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center">
                   <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                   Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border border-gray-100 bg-gray-50/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Commitment (hours/week)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={preferences.timeCommitment}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    timeCommitment: parseInt(e.target.value) || 10
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Learning Style</label>
                <select
                  value={preferences.learningStyle}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    learningStyle: e.target.value
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="hands-on">Hands-on</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Career Goals (Optional)</label>
              <textarea
                placeholder="e.g., Become a full-stack developer, transition to data science..."
                value={preferences.careerGoals}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  careerGoals: e.target.value
                }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

              {isGeneratingPipeline && (
                <div className="w-full mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* Progress Bar Container */}
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
                    <span className="uppercase tracking-wider">Pipeline Progress</span>
                    <span>{Math.min(loadingStep * 25 + 10, 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      style={{ width: `${Math.min(loadingStep * 25 + 10, 100)}%` }}
                    ></div>
                  </div>

                  {/* Node Flow Graph Visualization */}
                  <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                       {/* Connection Paths */}
                       <path 
                         d="M 120 40 L 280 40" 
                         stroke={loadingStep > 0 ? "#6366f1" : "#e5e7eb"} 
                         strokeWidth="2" fill="none" 
                         className={loadingStep === 1 ? "animate-dash" : ""}
                         strokeDasharray={loadingStep === 1 ? "5,5" : "0"}
                       />
                       <path 
                         d="M 380 40 C 440 40, 440 10, 500 10" 
                         stroke={loadingStep > 1 ? "#6366f1" : "#e5e7eb"} 
                         strokeWidth="2" fill="none"
                         className={loadingStep === 2 ? "animate-dash" : ""}
                       />
                       <path 
                         d="M 380 40 C 440 40, 440 70, 500 70" 
                         stroke={loadingStep > 1 ? "#6366f1" : "#e5e7eb"} 
                         strokeWidth="2" fill="none"
                         className={loadingStep === 2 ? "animate-dash" : ""}
                       />
                    </svg>

                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                       {/* Step 1: Orchestrator */}
                       <div className="flex justify-center">
                          <div className={`w-32 p-3 rounded-2xl border bg-white flex flex-col items-center text-center transition-all duration-500 ${loadingStep === 0 ? 'border-indigo-400 shadow-lg scale-110' : 'border-gray-100 opacity-60'}`}>
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${loadingStep === 0 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                <Brain className="w-5 h-5" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-tighter">Orchestrator</span>
                             {loadingStep === 0 && <span className="text-[8px] text-indigo-400 animate-pulse">Analyzing...</span>}
                          </div>
                       </div>

                       {/* Step 2: Course Gen */}
                       <div className="flex justify-center">
                          <div className={`w-32 p-3 rounded-2xl border bg-white flex flex-col items-center text-center transition-all duration-500 ${loadingStep === 1 ? 'border-indigo-400 shadow-lg scale-110' : 'border-gray-100 opacity-60'}`}>
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${loadingStep === 1 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                <Code className="w-5 h-5" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-tighter">Course Gen</span>
                             {loadingStep === 1 && <span className="text-[8px] text-indigo-400 animate-pulse">Building...</span>}
                          </div>
                       </div>

                       {/* Step 3: Parallel Agents */}
                       <div className="flex flex-col space-y-4">
                          <div className={`w-32 p-2 rounded-xl border bg-white flex items-center space-x-2 transition-all duration-500 ${loadingStep === 2 ? 'border-indigo-400 shadow shadow-indigo-100 translate-x-2' : 'border-gray-100 opacity-40'}`}>
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center ${loadingStep === 2 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Youtube className="w-3 h-3" />
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-tighter">Resources</span>
                          </div>
                          <div className={`w-32 p-2 rounded-xl border bg-white flex items-center space-x-2 transition-all duration-500 ${loadingStep >= 3 ? 'border-indigo-400 shadow shadow-indigo-100 translate-x-2' : 'border-gray-100 opacity-40'}`}>
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center ${loadingStep >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Award className="w-3 h-3" />
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-tighter">Quiz Engine</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {loadingDuration > 15 && (
                     <div className="flex items-center justify-center space-x-2 py-2 bg-amber-50 border border-amber-100 rounded-lg animate-pulse">
                       <Clock className="w-4 h-4 text-amber-600" />
                       <span className="text-amber-700 text-xs font-medium">This is taking longer than usual due to high complexity...</span>
                     </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center mt-6">


              <button
                onClick={handleGenerateJourney}
                disabled={isGenerating || loadingEnhancedPath || (!selectedSkill && !skillInput)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${isGenerating || loadingEnhancedPath || (!selectedSkill && !skillInput)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : enhancedLearningPathService.isSkillSupported(selectedSkill || skillInput)
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isGenerating || loadingEnhancedPath ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>
                      {loadingEnhancedPath ? 'Creating Enhanced Path...' : 'Generating Journey...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>Generate Basic Journey</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateLearningPath}
                disabled={isGenerating || (!selectedSkill && !skillInput)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium border transition-colors ${isGenerating || (!selectedSkill && !skillInput)
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
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium border transition-colors ${isGenerating || (!selectedSkill && !skillInput)
                  ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Award className="h-4 w-4" />
                <span>Create Assessment</span>
              </button>
            </div>
            
            {/* Pipeline Error State */}
            {pipelineError && (
              <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center animate-fade-in text-center">
                <XCircle className="h-10 w-10 text-red-500 mb-3" />
                <h3 className="text-xl font-bold text-red-800 mb-2">Generation Failed</h3>
                <p className="text-red-600 mb-6">{pipelineError}</p>
                <button 
                  onClick={() => handleGenerateEnhancedJourney()}
                  className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 transition flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Pipeline</span>
                </button>
              </div>
            )}
            
            {/* Empty State / Standby */}
            {!fullPipelineData && !isGeneratingPipeline && !pipelineError && (
              <div className="mt-8 border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center opacity-70">
                 <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-blue-400" />
                 </div>
                 <h3 className="text-lg font-medium text-gray-700 mb-1">Enter a goal up top</h3>
                 <p className="text-gray-500">Pick a popular skill or type your own to generate your AI learning path.</p>
              </div>
            )}

            {/* Unified Learning Pipeline Results */}
            {isGeneratingPipeline && (
               <div className="mt-8">
                  <SkeletonLearningView />
               </div>
            )}

            {fullPipelineData && (
              <div ref={resultsRef} className="animate-fade-in mt-8 w-full block">
                 <ErrorBoundary>
                   <UnifiedLearningView 
                      pipelineResponse={fullPipelineData}
                      onRegenerate={() => handleGenerateEnhancedJourney()}
                   />
                 </ErrorBoundary>
              </div>
            )}

            {/* Journey Results */}
            {currentJourney && !fullPipelineData && (
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
                            <span className={`inline-block px-2 py-1 mt-1 text-xs rounded ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
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

      {/* Assessment Tab */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {!currentAssessment && !showResults && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">AI-Powered Skill Assessment</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Take an AI-generated assessment to evaluate your skills and get personalized feedback.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Skill Area</label>
                      <input
                        type="text"
                        placeholder="e.g., JavaScript, Python, Marketing"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAssessment}
                    disabled={isGenerating || !skillInput}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${isGenerating || !skillInput
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Generating Assessment...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Start Assessment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Questions */}
          {currentAssessment && !showResults && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{currentAssessment.title}</h2>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    Question {currentQuestion + 1} of {currentAssessment.questions.length}
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / currentAssessment.questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="p-6">
                {currentAssessment.questions[currentQuestion] && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {currentAssessment.questions[currentQuestion].question}
                      </h3>

                      <div className="space-y-3">
                        {currentAssessment.questions[currentQuestion].options.map((option: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerQuestion(index)}
                            className="w-full text-left p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className={`px-4 py-2 rounded text-sm ${currentQuestion === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        Previous
                      </button>

                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {currentAssessment.questions[currentQuestion].difficulty}
                      </span>

                      <button
                        onClick={() => {
                          if (currentQuestion < currentAssessment.questions.length - 1) {
                            setCurrentQuestion(currentQuestion + 1);
                          }
                        }}
                        disabled={currentQuestion === currentAssessment.questions.length - 1}
                        className={`px-4 py-2 rounded text-sm ${currentQuestion === currentAssessment.questions.length - 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assessment Results */}
          {showResults && assessmentResults && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Assessment Results</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-blue-600">
                    {assessmentResults.score}%
                  </div>
                  <p className="text-lg text-gray-600">
                    {assessmentResults.performance}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded text-sm ${assessmentResults.passed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {assessmentResults.passed ? 'Passed' : 'Need Improvement'}
                  </span>
                </div>

                {assessmentResults.feedback && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">AI Feedback</h4>
                    <p className="text-gray-600">{assessmentResults.feedback}</p>
                  </div>
                )}

                {assessmentResults.recommendations && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recommendations</h4>
                    <ul className="space-y-2">
                      {assessmentResults.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-1" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={resetAssessment}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Take Another Assessment</span>
                  </button>
                  <button
                    onClick={() => {
                      const skill = currentAssessment.skillArea;
                      resetAssessment();
                      setSelectedSkill(skill);
                      setActiveTab('generate');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Create Learning Path</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="border-b px-6 py-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Personalized AI Recommendations</h2>
              </div>
            </div>
            <div className="p-6">
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recommendations yet. Complete your profile to get personalized suggestions.</p>
                  <button
                    onClick={getPersonalizedRecommendations}
                    disabled={isGenerating}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {isGenerating ? 'Loading...' : 'Get Recommendations'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                          {rec.actionItems && (
                            <ul className="mt-3 space-y-1">
                              {rec.actionItems.map((item: string, idx: number) => (
                                <li key={idx} className="text-sm flex items-center space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 text-xs rounded ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                            {rec.priority} Priority
                          </span>
                          <div className="text-xs text-gray-500">
                            {Math.round(rec.confidence * 100)}% confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skill Gap Analysis */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Skill Gap Analysis</h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Target role (e.g., Senior Software Engineer)"
                    value={preferences.careerGoals}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      careerGoals: e.target.value
                    }))}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSkillGapAnalysis}
                    disabled={isGenerating || !preferences.careerGoals}
                    className={`px-4 py-2 rounded-md font-medium ${isGenerating || !preferences.careerGoals
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isGenerating ? 'Analyzing...' : 'Analyze Gaps'}
                  </button>
                </div>

                {skillGapResults && (
                  <div className="mt-4 space-y-4">
                    <h4 className="font-semibold">Gap Analysis Results</h4>
                    {skillGapResults.missingSkills && (
                      <div>
                        <h5 className="font-medium text-red-600">Skills to Develop:</h5>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skillGapResults.missingSkills.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {skillGapResults.recommendations && (
                      <div>
                        <h5 className="font-medium">Next Steps:</h5>
                        <ul className="mt-2 space-y-1">
                          {skillGapResults.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm flex items-start space-x-2">
                              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Learning Paths Tab */}
      {activeTab === 'paths' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {showDetailedPath && (
                  <button
                    onClick={handleBackToOverview}
                    className="flex items-center justify-center p-2 mr-2 text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <BookOpen className="h-5 w-5" />
                <h2 className="text-xl font-semibold">
                  {showDetailedPath ? `${selectedPath?.title} - Progress` : 'My Learning Paths'}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!showDetailedPath ? (
              // Learning Paths Overview
              enhancedPaths.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No learning paths yet. Generate your first AI-powered learning journey!</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Learning Path
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {enhancedPaths.map((path) => (
                    <div
                      key={path.id}
                      className="relative overflow-hidden transition-all duration-300 transform border shadow-lg bg-white/90 backdrop-blur-md rounded-xl hover:shadow-xl hover:scale-105 border-gray-200/50 group w-full h-80 flex flex-col"
                    >
                      {/* Shining effect */}
                      <div className="absolute inset-0 transition-transform duration-1000 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full" />

                      <div className="relative z-10 p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-2">
                            <h3 className="mb-2 text-lg font-bold text-gray-800 transition-colors duration-300 group-hover:text-blue-600 leading-tight">
                              {path.title}
                            </h3>
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                              {path.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => handleGoToRoadmap(path.id, path.category)}
                              className="flex items-center justify-center w-8 h-8 transition-colors duration-300 rounded-full bg-blue-50 hover:bg-blue-100"
                              title="View Roadmap"
                            >
                              <Map className="w-4 h-4 text-blue-600" />
                            </button>
                            <div className="flex items-center px-2 py-1 space-x-1 text-yellow-500 rounded-lg bg-yellow-50">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-xs font-medium">{path.rating}</span>
                            </div>
                          </div>
                        </div>

                        <p className="mb-4 text-sm leading-relaxed text-gray-600 flex-1">
                          {path.description}
                        </p>

                        {/* Progress Section */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium text-blue-600">{path.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${path.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{path.completedTopics}/{path.totalTopics} topics</span>
                            <span>{path.estimatedDuration}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartLearning(path)}
                          className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-sm font-medium text-white transition-all duration-300 transform bg-blue-500 rounded-lg shadow-md hover:scale-105 hover:shadow-lg hover:bg-blue-600"
                        >
                          <Play className="w-4 h-4" />
                          <span>{path.progress > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Detailed Path View
              <div className="space-y-6">
                {/* Path Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedPath?.title}</h3>
                      <p className="text-gray-600 mb-4">{selectedPath?.description}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(selectedPath?.difficulty)}`}>
                          {selectedPath?.difficulty}
                        </span>
                        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-lg">
                          {selectedPath?.category}
                        </span>
                      </div>
                    </div>
                    <div className="w-full lg:w-auto lg:min-w-[200px]">
                      <div className="p-4 text-center bg-white/80 backdrop-blur-sm rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedPath?.progress}%
                        </div>
                        <div className="text-xs text-gray-600 mb-2">Completed</div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 transition-all duration-700 ease-out rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${selectedPath?.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {selectedPath?.completedTopics} of {selectedPath?.totalTopics} topics
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topics List */}
                <div className="bg-white border rounded-xl overflow-hidden">
                  {/* Mobile View */}
                  <div className="block lg:hidden">
                    {pathTopics.map((topic, index) => (
                      <div
                        key={topic.id}
                        className={`p-4 border-b border-gray-200 last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <div 
                          className="flex items-start justify-between mb-3 cursor-pointer group"
                          onClick={() => handleToggleTopicExpansion(topic.id)}
                        >
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center group-hover:text-blue-600 transition">
                              {expandedTopicId === topic.id ? 
                                <ChevronDown className="w-3 h-3 mr-2 text-blue-500" /> : 
                                <ChevronRight className="w-3 h-3 mr-2 text-gray-400" />
                              }
                              {topic.name}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 ml-5">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{topic.estimatedTime}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                               e.stopPropagation();
                               handleToggleTopicComplete(topic.id);
                            }}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-300 ml-2 ${topic.completed
                              ? 'bg-green-500 text-white'
                              : 'border border-gray-300 text-gray-400'
                              }`}
                          >
                            {topic.completed && <CheckCircle className="w-3 h-3" />}
                          </button>
                        </div>
                        
                        {expandedTopicId === topic.id && (
                          <div className="mt-2 ml-5 mb-4 animate-in slide-in-from-top-1 duration-300">
                             <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                {topic.description || "In-depth learning content is being finalized for this module."}
                             </p>
                             <div className="flex flex-wrap gap-2">
                                {topic.videoUrl && (
                                   <button 
                                     onClick={() => handleOpenResource(topic.videoUrl)}
                                     className="flex items-center px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700"
                                   >
                                      <Youtube className="w-3 h-3 mr-1" /> Video
                                   </button>
                                )}
                                {topic.articleUrl && (
                                   <button 
                                     onClick={() => handleOpenResource(topic.articleUrl)}
                                     className="flex items-center px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                   >
                                      <FileText className="w-3 h-3 mr-1" /> Guide
                                   </button>
                                )}
                             </div>
                          </div>
                        )}

                        <div className="flex space-x-2 ml-5">
                          {topic.hasVideo && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleOpenResource(topic.videoUrl)}
                                className="flex items-center px-2 py-1 text-xs text-red-600 bg-red-100 rounded-full hover:bg-red-200"
                              >
                                <Youtube className="w-3 h-3 mr-1" />
                                Watch
                              </button>
                              <button
                                onClick={() => handleSearchVideosForTopic(topic.name)}
                                className="flex items-center px-2 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100"
                                title="Search for more videos"
                              >
                                <Zap className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {topic.hasArticle && (
                            <button
                              onClick={() => handleOpenResource(topic.articleUrl)}
                              className="flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Article
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Topic
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Time
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Resources
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pathTopics.map((topic, index) => (
                          <React.Fragment key={topic.id}>
                            <tr
                              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150 group`}
                            >
                              <td 
                                className="px-6 py-4 cursor-pointer"
                                onClick={() => handleToggleTopicExpansion(topic.id)}
                              >
                                <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                  {expandedTopicId === topic.id ? 
                                    <ChevronDown className="w-4 h-4 mr-3 text-blue-500 scale-125 transition-transform" /> : 
                                    <ChevronRight className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-400 transition-transform" />
                                  }
                                  {topic.name}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="w-4 h-4 mr-1 text-blue-400" />
                                  <span>{topic.estimatedTime}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-3">
                                  {topic.hasVideo && (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => handleOpenResource(topic.videoUrl)}
                                        className="p-2 text-red-600 transition-colors bg-red-100 rounded-full hover:bg-red-200"
                                        title="Watch Video"
                                      >
                                        <Youtube className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleSearchVideosForTopic(topic.name)}
                                        className="p-2 text-red-600 transition-colors bg-red-50 border border-red-200 rounded-full hover:bg-red-100"
                                        title="Search for more videos"
                                      >
                                        <Zap className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                  {topic.hasArticle && (
                                    <button
                                      onClick={() => handleOpenResource(topic.articleUrl)}
                                      className="p-2 text-blue-600 transition-colors bg-blue-100 rounded-full hover:bg-blue-200"
                                      title="Read Article"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleTopicComplete(topic.id)}
                                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-300 ${topic.completed
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'border border-gray-300 text-gray-400 hover:border-gray-400'
                                    }`}
                                >
                                  {topic.completed && <CheckCircle className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>
                            {expandedTopicId === topic.id && (
                              <tr className="bg-blue-50/20">
                                <td colSpan={4} className="px-8 py-6 border-t border-blue-100 shadow-inner">
                                  <div className="animate-in slide-in-from-top-2 duration-400">
                                    <div className="flex items-start space-x-4 mb-4">
                                       <div className="p-2 bg-blue-100 rounded-lg">
                                          <BookOpen className="w-5 h-5 text-blue-600" />
                                       </div>
                                       <div className="flex-1">
                                          <h5 className="text-sm font-bold text-gray-800 mb-1">Topic Insight</h5>
                                          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                                            {topic.description || "In-depth learning content is being finalized for this module. Explore the resources below to get started."}
                                          </p>
                                       </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-4 pl-11">
                                      {topic.videoUrl && (
                                        <button 
                                          onClick={() => handleOpenResource(topic.videoUrl)} 
                                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition shadow-sm hover:shadow-md"
                                        >
                                          <Youtube className="w-4 h-4 mr-2" /> Launch Video Player
                                        </button>
                                      )}
                                      {topic.articleUrl && (
                                        <button 
                                          onClick={() => handleOpenResource(topic.articleUrl)} 
                                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                                        >
                                          <FileText className="w-4 h-4 mr-2" /> Access Documentation
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Curated Learning Resources */}
      {showLearningResources && learningResources && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Curated Learning Resource</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Difficulty: {learningResources.difficulty || 'N/A'}</span>
                <span>•</span>
                <span>{learningResources.estimated_time || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {learningResources.resources && learningResources.resources.length > 0 ? (
              <div className="space-y-4">
                {learningResources.resources.map((resource: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-xl font-semibold text-gray-900">{resource.title}</h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            Verified Tutorial
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{resource.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center space-x-1">
                            <ExternalLink className="h-4 w-4" />
                            <span>{resource.platform}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>Complete Tutorial</span>
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="ml-4">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Start Learning</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No learning resources available.</p>
                <p className="text-sm">Try generating a journey for a different topic.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Placeholder for tabs without full implementation yet */}
      {activeTab === 'assessment' && !currentAssessment && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">AI Adaptive Assessment</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Generate an AI-powered diagnostic test to identify your skill gaps and get a personalized learning path.
          </p>
          <button 
            onClick={() => setActiveTab('generate')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Generator
          </button>
        </div>
      )}

      {activeTab === 'recommendations' && recommendations.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">AI-Powered Recommendations</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Once you complete assessments and paths, our AI will provide personalized next steps and skill-up recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default AILearningHub;