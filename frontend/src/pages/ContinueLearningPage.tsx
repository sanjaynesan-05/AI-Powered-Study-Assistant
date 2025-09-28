import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Youtube, FileText, ArrowLeft, Clock } from 'lucide-react';

interface TopicItem {
  id: string;
  name: string;
  hasVideo: boolean;
  hasArticle: boolean;
  completed: boolean;
  videoUrl?: string;
  articleUrl?: string;
  estimatedTime?: string;
}

interface LearningPathDetails {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: TopicItem[];
}

export const ContinueLearningPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const pathId = queryParams.get('pathId');
  const pathTitle = queryParams.get('title');
  
  const [learningPath, setLearningPath] = useState<LearningPathDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For this example, we'll simulate fetching data based on the pathId
    const fetchLearningPathDetails = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock data based on category
        const mockData: Record<string, LearningPathDetails> = {
          '1': {
            id: '1',
            title: 'Frontend Development',
            category: 'Frontend Development',
            description: 'Master modern frontend development with HTML, CSS, JavaScript and React',
            difficulty: 'intermediate',
            topics: [
              {
                id: 't1',
                name: 'HTML Fundamentals',
                hasVideo: true,
                hasArticle: true,
                completed: true,
                videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
                articleUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
                estimatedTime: '1 hour'
              },
              {
                id: 't2',
                name: 'CSS Styling & Flexbox',
                hasVideo: true,
                hasArticle: true,
                completed: true,
                videoUrl: 'https://www.youtube.com/watch?v=JJSoEo8JSnc',
                articleUrl: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
                estimatedTime: '2 hours'
              },
              {
                id: 't3',
                name: 'JavaScript Basics',
                hasVideo: true,
                hasArticle: true,
                completed: true,
                videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
                articleUrl: 'https://javascript.info/first-steps',
                estimatedTime: '3 hours'
              },
              {
                id: 't4',
                name: 'ES6+ Features',
                hasVideo: true,
                hasArticle: true,
                completed: false,
                videoUrl: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc',
                articleUrl: 'https://www.javascripttutorial.net/es6/',
                estimatedTime: '2 hours'
              },
              {
                id: 't5',
                name: 'React Components & Props',
                hasVideo: true,
                hasArticle: true,
                completed: false,
                videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
                articleUrl: 'https://reactjs.org/docs/components-and-props.html',
                estimatedTime: '2.5 hours'
              },
              {
                id: 't6',
                name: 'React State & Hooks',
                hasVideo: true,
                hasArticle: true,
                completed: false,
                videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
                articleUrl: 'https://reactjs.org/docs/hooks-state.html',
                estimatedTime: '3 hours'
              },
              {
                id: 't7',
                name: 'Responsive Design',
                hasVideo: true,
                hasArticle: false,
                completed: false,
                videoUrl: 'https://www.youtube.com/watch?v=srvUrASNj0s',
                estimatedTime: '2 hours'
              },
              {
                id: 't8',
                name: 'State Management with Redux',
                hasVideo: true,
                hasArticle: true,
                completed: false,
                videoUrl: 'https://www.youtube.com/watch?v=poQXNp9ItL4',
                articleUrl: 'https://redux.js.org/introduction/getting-started',
                estimatedTime: '4 hours'
              },
            ]
          },
          '2': {
            id: '2',
            title: 'Cybersecurity Fundamentals',
            category: 'Cybersecurity',
            description: 'Learn ethical hacking, network security, and cyber defense strategies',
            difficulty: 'beginner',
            topics: [
              {
                id: 't1',
                name: 'Introduction to Cybersecurity',
                hasVideo: true,
                hasArticle: true,
                completed: false,
                videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
                articleUrl: 'https://www.nist.gov/itl/applied-cybersecurity/nice/resources/online-learning-content',
                estimatedTime: '1 hour'
              },
              {
                id: 't2',
                name: 'Network Security Basics',
                hasVideo: true,
                hasArticle: true,
                completed: false,
                videoUrl: 'https://www.youtube.com/watch?v=E03gh1huvW4',
                articleUrl: 'https://www.cisco.com/c/en/us/products/security/what-is-network-security.html',
                estimatedTime: '2 hours'
              },
            ]
          },
          // Add more mock data for other paths as needed
        };

        // Get the path details based on the ID
        const pathDetails = mockData[pathId || '1']; // Default to '1' if pathId is null
        setLearningPath(pathDetails);
        setIsLoading(false);
      }, 800); // Simulate loading delay
    };

    fetchLearningPathDetails();
  }, [pathId]);

  const handleGoBack = () => {
    navigate('/learning-path');
  };

  const handleToggleCompleted = (topicId: string) => {
    if (!learningPath) return;
    
    setLearningPath({
      ...learningPath,
      topics: learningPath.topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, completed: !topic.completed } 
          : topic
      )
    });
  };

  const handleOpenResource = (url: string) => {
    window.open(url, '_blank');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const completedTopics = learningPath?.topics.filter(topic => topic.completed).length || 0;
  const totalTopics = learningPath?.topics.length || 0;
  const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
      {/* Header with back button */}
      <div className="flex items-center mb-4 sm:mb-6">
        <button 
          onClick={handleGoBack}
          className="flex items-center justify-center p-2 mr-3 sm:mr-4 text-gray-600 transition-colors rounded-full dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Continue Learning
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : learningPath ? (
        <>
          {/* Course Info Panel */}
          <div className="relative p-4 sm:p-6 overflow-hidden transition-all duration-300 border shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl sm:rounded-2xl border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl group">
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 group-hover:opacity-100"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="mb-2 text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                    {learningPath.title}
                  </h2>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {learningPath.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`inline-block px-2 py-1 sm:px-3 rounded-lg text-xs font-medium ${getDifficultyColor(learningPath.difficulty)}`}>
                      {learningPath.difficulty}
                    </span>
                    <span className="inline-block px-2 py-1 sm:px-3 text-xs font-medium text-blue-800 bg-blue-100 rounded-lg dark:bg-blue-900 dark:text-blue-200">
                      {learningPath.category}
                    </span>
                  </div>
                </div>
                <div className="w-full lg:w-auto lg:min-w-[200px]">
                  <div className="p-3 sm:p-4 text-center bg-blue-50 dark:bg-blue-900/30 rounded-lg sm:rounded-xl">
                    <div className="mb-1 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Completed
                    </div>
                    <div className="w-full h-2 mt-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div 
                        className="h-2 transition-all duration-700 ease-out rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {completedTopics} of {totalTopics} topics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Topics Table */}
          <div className="overflow-hidden transition-all duration-300 border shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl sm:rounded-2xl border-gray-200/50 dark:border-gray-700/50">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {learningPath.topics.map((topic, index) => (
                <div 
                  key={topic.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0
                           ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/20'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {topic.name}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="inline w-3 h-3 mr-1" />
                        <span>{topic.estimatedTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCompleted(topic.id)}
                      className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-300 ml-2
                                ${topic.completed 
                                  ? 'bg-green-500 text-white'
                                  : 'border border-gray-300 text-gray-400 dark:border-gray-600'
                                }`}
                    >
                      {topic.completed && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {topic.hasVideo && (
                      <button
                        onClick={() => handleOpenResource(topic.videoUrl || '#')}
                        className="flex items-center px-2 py-1 text-xs text-red-600 bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      >
                        <Youtube className="w-3 h-3 mr-1" />
                        Video
                      </button>
                    )}
                    {topic.hasArticle && (
                      <button
                        onClick={() => handleOpenResource(topic.articleUrl || '#')}
                        className="flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
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
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Topic
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Estimated Time
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Resources
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {learningPath.topics.map((topic, index) => (
                    <tr 
                      key={topic.id} 
                      className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/20'} 
                               hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150`}
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {topic.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="inline w-4 h-4 mr-1" />
                          <span>{topic.estimatedTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex space-x-2 sm:space-x-3">
                          {topic.hasVideo && (
                            <button
                              onClick={() => handleOpenResource(topic.videoUrl || '#')}
                              className="p-1.5 sm:p-2 text-red-600 transition-colors bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50"
                              title="Watch Video"
                            >
                              <Youtube className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          {topic.hasArticle && (
                            <button
                              onClick={() => handleOpenResource(topic.articleUrl || '#')}
                              className="p-1.5 sm:p-2 text-blue-600 transition-colors bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50"
                              title="Read Article"
                            >
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <button
                          onClick={() => handleToggleCompleted(topic.id)}
                          className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md transition-all duration-300
                                    ${topic.completed 
                                      ? 'bg-green-500 text-white hover:bg-green-600'
                                      : 'border border-gray-300 text-gray-400 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                                    }`}
                        >
                          {topic.completed && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 sm:p-6 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Learning path not found. Please go back and select a valid learning path.
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 text-sm sm:text-base text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Learning Paths
          </button>
        </div>
      )}
    </div>
  );
};
