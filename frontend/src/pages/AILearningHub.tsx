import React, { useState, useEffect } from 'react';
import { useAIAgent } from '../contexts/AIAgentContext';
import { useAuth } from '../contexts/AuthContext';
import { advancedAILearningService, LearningObjective, EnhancedTopic } from '../services/advancedAILearningService';
import { youtubeService, YouTubeVideo } from '../services/youtubeService';
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
  Zap,
  Users,
  Code,
  Sparkles
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
  
  // Enhanced Learning Path states
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [pathTopics, setPathTopics] = useState<any[]>([]);
  const [showDetailedPath, setShowDetailedPath] = useState(false);
  const [enhancedPaths, setEnhancedPaths] = useState<any[]>([
    {
      id: '1',
      title: 'Frontend Development Mastery',
      description: 'Master modern frontend development with HTML, CSS, JavaScript and React',
      progress: 65,
      totalTopics: 12,
      completedTopics: 8,
      difficulty: 'intermediate',
      category: 'Frontend Development',
      estimatedDuration: '8-12 weeks',
      rating: 4.8,
      topics: [
        {
          id: 't1',
          name: 'HTML Fundamentals',
          completed: true,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
          articleUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
          estimatedTime: '1 hour'
        },
        {
          id: 't2',
          name: 'CSS Styling & Flexbox',
          completed: true,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=JJSoEo8JSnc',
          articleUrl: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
          estimatedTime: '2 hours'
        },
        {
          id: 't3',
          name: 'JavaScript Basics',
          completed: true,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
          articleUrl: 'https://javascript.info/first-steps',
          estimatedTime: '3 hours'
        },
        {
          id: 't4',
          name: 'ES6+ Features',
          completed: false,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc',
          articleUrl: 'https://www.javascripttutorial.net/es6/',
          estimatedTime: '2 hours'
        },
        {
          id: 't5',
          name: 'React Components & Props',
          completed: false,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
          articleUrl: 'https://reactjs.org/docs/components-and-props.html',
          estimatedTime: '2.5 hours'
        }
      ]
    },
    {
      id: '2',
      title: 'Data Science & Analytics',
      description: 'Python, machine learning, statistics, and data visualization mastery',
      progress: 30,
      totalTopics: 10,
      completedTopics: 3,
      difficulty: 'intermediate',
      category: 'Data Science',
      estimatedDuration: '10-14 weeks',
      rating: 4.9,
      topics: [
        {
          id: 't1',
          name: 'Python Fundamentals',
          completed: true,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
          articleUrl: 'https://docs.python.org/3/tutorial/',
          estimatedTime: '2 hours'
        },
        {
          id: 't2',
          name: 'NumPy & Pandas',
          completed: false,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=ZB7BZMhfPgk',
          articleUrl: 'https://pandas.pydata.org/docs/getting_started/index.html',
          estimatedTime: '3 hours'
        }
      ]
    }
  ]);

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

  // Convert AI-generated paths to enhanced format
  useEffect(() => {
    if (learningPaths.length > 0) {
      const convertedPaths = learningPaths.map((path: any, index: number) => ({
        id: `ai-${index + 1}`,
        title: path.title || 'AI Generated Path',
        description: path.description || 'AI-powered learning journey',
        progress: 0,
        totalTopics: path.modules?.length || 5,
        completedTopics: 0,
        difficulty: path.difficultyLevel || 'intermediate',
        category: path.skillArea || 'General',
        estimatedDuration: path.estimatedDuration || '6-8 weeks',
        rating: 4.7,
        topics: path.modules?.map((module: any, moduleIndex: number) => ({
          id: `t${moduleIndex + 1}`,
          name: module.title || module.name || `Topic ${moduleIndex + 1}`,
          completed: false,
          hasVideo: true,
          hasArticle: true,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          articleUrl: 'https://developer.mozilla.org/en-US/docs/Web',
          estimatedTime: module.estimatedHours ? `${module.estimatedHours} hours` : '2 hours'
        })) || [
          {
            id: 't1',
            name: 'Introduction',
            completed: false,
            hasVideo: true,
            hasArticle: true,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            articleUrl: 'https://developer.mozilla.org/en-US/docs/Web',
            estimatedTime: '1 hour'
          }
        ]
      }));
      
      // Add converted paths to enhanced paths (avoid duplicates)
      setEnhancedPaths(prev => {
        const existingIds = prev.map(p => p.id);
        const newPaths = convertedPaths.filter((path: any) => !existingIds.includes(path.id));
        return [...prev, ...newPaths];
      });
    }
  }, [learningPaths]);

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
  const handleGenerateEnhancedJourney = async () => {
    if (!selectedSkill && !skillInput) return;
    
    const targetSkill = selectedSkill || skillInput;
    
    const objective: LearningObjective = {
      skill: targetSkill,
      currentLevel: difficulty as 'beginner' | 'intermediate' | 'advanced',
      targetLevel: difficulty === 'beginner' ? 'intermediate' : 'advanced' as 'intermediate' | 'advanced' | 'expert',
      timeframe: `${preferences.timeCommitment} weeks`,
      learningStyle: preferences.learningStyle as 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed',
      careerGoals: preferences.careerGoals ? [preferences.careerGoals] : ['General skill improvement']
    };

    try {
      const enhancedTopics = await advancedAILearningService.generateIntelligentLearningPath(objective);
      
      // Add to enhanced paths
      const newPath = {
        id: `enhanced-${Date.now()}`,
        title: `AI-Enhanced ${targetSkill} Mastery`,
        description: `Comprehensive AI-powered learning journey for ${targetSkill} with personalized content`,
        progress: 0,
        totalTopics: enhancedTopics.length,
        completedTopics: 0,
        difficulty: difficulty,
        category: targetSkill,
        estimatedDuration: '10-14 weeks',
        rating: 4.9,
        topics: enhancedTopics.map(topic => ({
          id: topic.id,
          name: topic.title,
          completed: false,
          hasVideo: topic.videos.length > 0,
          hasArticle: topic.articles.length > 0,
          videoUrl: topic.videos[0]?.videoUrl || '',
          articleUrl: topic.articles[0]?.url || '',
          estimatedTime: topic.estimatedTime,
          description: topic.description,
          exercises: topic.exercises,
          assessmentQuestions: topic.assessmentQuestions
        }))
      };
      
      setEnhancedPaths(prev => [newPath, ...prev]);
      setActiveTab('paths'); // Switch to paths tab to show the new path
    } catch (error) {
      console.error('Enhanced journey generation failed:', error);
      // Fallback to regular journey generation
      await handleGenerateJourney();
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

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleGenerateEnhancedJourney}
                disabled={isGenerating || (!selectedSkill && !skillInput)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  isGenerating || (!selectedSkill && !skillInput)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Generating Enhanced Journey...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate AI-Enhanced Journey</span>
                  </>
                )}
              </button>

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
                    <span>Generate Basic Journey</span>
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
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                      isGenerating || !skillInput
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
                        className={`px-4 py-2 rounded text-sm ${
                          currentQuestion === 0
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
                        className={`px-4 py-2 rounded text-sm ${
                          currentQuestion === currentAssessment.questions.length - 1
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
                  <span className={`inline-block px-3 py-1 rounded text-sm ${
                    assessmentResults.passed 
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
                          <span className={`px-2 py-1 text-xs rounded ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
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
                    className={`px-4 py-2 rounded-md font-medium ${
                      isGenerating || !preferences.careerGoals
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
                        className={`p-4 border-b border-gray-200 last:border-b-0 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{topic.name}</h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{topic.estimatedTime}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleTopicComplete(topic.id)}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-300 ml-2 ${
                              topic.completed 
                                ? 'bg-green-500 text-white'
                                : 'border border-gray-300 text-gray-400'
                            }`}
                          >
                            {topic.completed && <CheckCircle className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="flex space-x-2">
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
                          <tr 
                            key={topic.id} 
                            className={`${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } hover:bg-blue-50 transition-colors duration-150`}
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
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
                                className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-300 ${
                                  topic.completed 
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'border border-gray-300 text-gray-400 hover:border-gray-400'
                                }`}
                              >
                                {topic.completed && <CheckCircle className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>
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