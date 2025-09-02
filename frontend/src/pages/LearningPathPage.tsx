import React, { useState } from 'react';
import { Play, CheckCircle, Clock, Star, ExternalLink } from 'lucide-react';
import { LearningPath } from '../types';

export const LearningPathPage: React.FC = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'Full Stack Development',
      description: 'Master frontend and backend development with React, Node.js, and databases',
      progress: 65,
      totalLessons: 120,
      completedLessons: 78,
      difficulty: 'intermediate',
      category: 'Web Development'
    },
    {
      id: '2',
      title: 'Cybersecurity Fundamentals',
      description: 'Learn ethical hacking, network security, and cyber defense strategies',
      progress: 0,
      totalLessons: 85,
      completedLessons: 0,
      difficulty: 'beginner',
      category: 'Security'
    },
    {
      id: '3',
      title: 'Data Science & Analytics',
      description: 'Python, machine learning, statistics, and data visualization',
      progress: 30,
      totalLessons: 95,
      completedLessons: 28,
      difficulty: 'intermediate',
      category: 'Data Science'
    },
    {
      id: '4',
      title: 'Mobile App Development',
      description: 'Build native mobile apps with React Native and Flutter',
      progress: 15,
      totalLessons: 75,
      completedLessons: 11,
      difficulty: 'beginner',
      category: 'Mobile'
    },
    {
      id: '5',
      title: 'Cloud Computing (AWS)',
      description: 'Master cloud infrastructure, serverless, and DevOps practices',
      progress: 0,
      totalLessons: 110,
      completedLessons: 0,
      difficulty: 'advanced',
      category: 'Cloud'
    },
    {
      id: '6',
      title: 'AI & Machine Learning',
      description: 'Deep learning, neural networks, and AI application development',
      progress: 45,
      totalLessons: 130,
      completedLessons: 58,
      difficulty: 'advanced',
      category: 'AI/ML'
    },
    {
      id: '7',
      title: 'UI/UX Design',
      description: 'User experience design, prototyping, and design systems',
      progress: 80,
      totalLessons: 60,
      completedLessons: 48,
      difficulty: 'beginner',
      category: 'Design'
    },
    {
      id: '8',
      title: 'Blockchain Development',
      description: 'Smart contracts, DeFi, and decentralized application development',
      progress: 20,
      totalLessons: 90,
      completedLessons: 18,
      difficulty: 'advanced',
      category: 'Blockchain'
    },
    {
      id: '9',
      title: 'Digital Marketing',
      description: 'SEO, social media marketing, and growth hacking strategies',
      progress: 55,
      totalLessons: 70,
      completedLessons: 38,
      difficulty: 'beginner',
      category: 'Marketing'
    },
    {
      id: '10',
      title: 'Product Management',
      description: 'Product strategy, roadmapping, and agile methodologies',
      progress: 35,
      totalLessons: 80,
      completedLessons: 28,
      difficulty: 'intermediate',
      category: 'Management'
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStartContinue = (pathId: string) => {
    setLearningPaths(prev => 
      prev.map(path => 
        path.id === pathId && path.progress === 0 
          ? { ...path, progress: 5, completedLessons: 3 }
          : path
      )
    );
    window.open('https://example-learning-platform.com', '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white 
                     hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h1 className="text-2xl font-bold mb-1 relative z-10">📚 Learning Paths</h1>
        <p className="text-blue-100 relative z-10">
          Choose your learning journey and track progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg 
                     hover:shadow-xl transform hover:scale-105 transition-all duration-300 
                     overflow-hidden border border-gray-200/50 dark:border-gray-700/50 group
                     relative"
          >
            {/* Shining effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 
                               group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {path.title}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                    {path.difficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-900 
                               px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-medium">4.8</span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                {path.description}
              </p>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Progress</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {path.completedLessons}/{path.totalLessons}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full 
                             transition-all duration-700 ease-out"
                    style={{ width: `${path.progress}%` }}
                  />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {path.progress}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{Math.ceil(path.totalLessons / 10)} weeks</span>
                </div>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  {path.category}
                </span>
              </div>

              <button
                onClick={() => handleStartContinue(path.id)}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg 
                          font-medium transform hover:scale-105 transition-all duration-300
                          shadow-md hover:shadow-lg text-sm
                          ${path.progress > 0
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
              >
                <Play className="w-4 h-4" />
                <span>{path.progress > 0 ? 'Continue' : 'Start Learning'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              {path.progress > 0 && (
                <div className="mt-3 flex items-center justify-center space-x-1 text-green-600 dark:text-green-400
                               bg-green-50 dark:bg-green-900/30 py-2 px-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">In Progress</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 
                     border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                     transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 relative z-10">
          Learning Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {learningPaths.filter(path => path.progress > 0).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Active</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {learningPaths.reduce((sum, path) => sum + path.completedLessons, 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Lessons</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {Math.round(learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Average</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {learningPaths.filter(path => path.progress === 100).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};