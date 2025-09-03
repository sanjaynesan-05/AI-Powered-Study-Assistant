import React, { useState } from 'react';
import { Play, Star, ExternalLink, Map } from 'lucide-react';
import { LearningPath } from '../types';
import { useNavigate } from 'react-router-dom';

export const LearningPathPage: React.FC = () => {
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'Frontend Development',
      description: 'Master modern frontend development with HTML, CSS, JavaScript and React',
      progress: 65,
      totalLessons: 120,
      completedLessons: 78,
      difficulty: 'intermediate',
      category: 'Frontend Development'
    },
    {
      id: '2',
      title: 'Cybersecurity Fundamentals',
      description: 'Learn ethical hacking, network security, and cyber defense strategies',
      progress: 0,
      totalLessons: 85,
      completedLessons: 0,
      difficulty: 'beginner',
      category: 'Cybersecurity'
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
      title: 'Backend Development',
      description: 'Master Node.js, Express, databases, and API development',
      progress: 15,
      totalLessons: 75,
      completedLessons: 11,
      difficulty: 'beginner',
      category: 'Backend Development'
    },
    {
      id: '5',
      title: 'Fullstack Development',
      description: 'Master both frontend and backend development with React, Node.js, and databases',
      progress: 0,
      totalLessons: 110,
      completedLessons: 0,
      difficulty: 'advanced',
      category: 'Fullstack Development'
    },
    
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStartContinue = (pathId: string, title: string) => {
    // Update the progress locally if it's 0
    setLearningPaths(prev => 
      prev.map(path => 
        path.id === pathId && path.progress === 0 
          ? { ...path, progress: 5, completedLessons: 3 }
          : path
      )
    );
    
    // Navigate to the continue learning page with the path ID and title
    navigate(`/continue-learning?pathId=${pathId}&title=${encodeURIComponent(title)}`);
  };
  
  const handleGoToRoadmap = (pathId: string, category: string) => {
    // Open the appropriate roadmap PDF based on the category
    switch (category) {
      case 'Frontend Development':
        window.open('https://roadmap.sh/pdfs/roadmaps/frontend.pdf', '_blank');
        break;
      case 'Backend Development':
        window.open('https://roadmap.sh/pdfs/roadmaps/backend.pdf', '_blank');
        break;
      case 'Fullstack Development':
        window.open('https://roadmap.sh/pdfs/roadmaps/full-stack.pdf', '_blank');
        break;
      case 'Data Science':
        window.open('https://roadmap.sh/pdfs/roadmaps/ai-data-scientist.pdf', '_blank');
        break;
      case 'Cybersecurity':
        window.open('https://roadmap.sh/pdfs/roadmaps/cyber-security.pdf', '_blank');
        break;
      default:
        // Fallback to navigate to internal roadmap page if no direct PDF is available
        navigate(`/roadmap?pathId=${pathId}&category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="relative p-6 overflow-hidden text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl hover:shadow-xl group">
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-white/10 group-hover:opacity-100" />
        <h1 className="relative z-10 mb-1 text-2xl font-bold">📚 Learning Paths</h1>
        <p className="relative z-10 text-blue-100">
          Choose your learning journey and track progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className="relative overflow-hidden transition-all duration-300 transform border shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl hover:shadow-xl hover:scale-105 border-gray-200/50 dark:border-gray-700/50 group w-80 h-64 mx-auto flex flex-col"
          >
            {/* Shining effect */}
            <div className="absolute inset-0 transition-transform duration-1000 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full" />
            
            <div className="relative z-10 p-5 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-gray-800 transition-colors duration-300 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {path.title}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                    {path.difficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleGoToRoadmap(path.id, path.category)}
                    className="flex items-center justify-center w-8 h-8 transition-colors duration-300 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50"
                    title="View Roadmap"
                  >
                    <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </button>
                  <div className="flex items-center px-2 py-1 space-x-1 text-yellow-500 rounded-lg bg-yellow-50 dark:bg-yellow-900">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-medium">4.8</span>
                  </div>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400 flex-1">
                {path.description}
              </p>

              <button
                onClick={() => handleStartContinue(path.id, path.title)}
                className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-sm font-medium text-white transition-all duration-300 transform bg-blue-500 rounded-lg shadow-md hover:scale-105 hover:shadow-lg hover:bg-blue-600"
              >
                <Play className="w-4 h-4" />
                <span>Start Learning</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};