import React, { useState, useEffect } from 'react';
import { Briefcase, BookOpen, ExternalLink, MapPin, DollarSign, Filter, Search, ChevronDown } from 'lucide-react';
import { Recommendation } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const RecommendationPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'job' | 'course'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'alphabetical'>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'TechCorp',
        type: 'job',
        description: 'Join our team to build amazing user interfaces with React and TypeScript.',
        skills: ['React', 'TypeScript', 'CSS'],
        location: 'San Francisco, CA',
        salary: '$80k - $120k',
        url: 'https://example-jobs.com/frontend-dev'
      },
      {
        id: '2',
        title: 'Advanced React Course',
        company: 'CodeAcademy Pro',
        type: 'course',
        description: 'Master advanced React patterns, hooks, and state management.',
        skills: ['React', 'JavaScript', 'Redux'],
        url: 'https://example-courses.com/react-advanced'
      },
      {
        id: '3',
        title: 'Full Stack Engineer',
        company: 'StartupXYZ',
        type: 'job',
        description: 'Build scalable web applications from frontend to backend.',
        skills: ['React', 'Node.js', 'MongoDB'],
        location: 'Remote',
        salary: '$90k - $140k',
        url: 'https://example-jobs.com/fullstack'
      },
      {
        id: '4',
        title: 'Python for Data Science',
        company: 'DataLearn',
        type: 'course',
        description: 'Learn Python programming specifically for data analysis and machine learning.',
        skills: ['Python', 'Data Analysis', 'Machine Learning'],
        url: 'https://example-courses.com/python-data'
      },
      {
        id: '5',
        title: 'UI/UX Designer',
        company: 'DesignStudio',
        type: 'job',
        description: 'Create beautiful and intuitive user experiences for web and mobile.',
        skills: ['Figma', 'Design Systems', 'Prototyping'],
        location: 'New York, NY',
        salary: '$70k - $100k',
        url: 'https://example-jobs.com/ux-designer'
      },
      {
        id: '6',
        title: 'Cybersecurity Bootcamp',
        company: 'SecureLearn',
        type: 'course',
        description: 'Comprehensive cybersecurity training covering ethical hacking and defense.',
        skills: ['Network Security', 'Ethical Hacking', 'Penetration Testing'],
        url: 'https://example-courses.com/cybersecurity'
      }
    ];

    setRecommendations(mockRecommendations);
  }, [user?.skills]);

  const sortedAndFilteredRecommendations = recommendations
    .filter(rec => {
      const matchesFilter = filter === 'all' || rec.type === filter;
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return 4.8 - 4.5; // Mock rating sort
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white 
                     hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h1 className="text-2xl font-bold mb-1 relative z-10">🎯 Recommendations</h1>
        <p className="text-blue-100 relative z-10">
          Personalized job and course recommendations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 
                     border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Filter and Sort */}
          <div className="flex items-center space-x-3">
            {/* Type Filter */}
            {(['all', 'job', 'course'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 
                          transform hover:scale-105 text-sm
                          ${filter === filterType
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
              >
                {filterType === 'all' ? 'All' : filterType === 'job' ? 'Jobs' : 'Courses'}
              </button>
            ))}

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                         border border-gray-300 dark:border-gray-600 rounded-lg
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300
                         transform hover:scale-105 text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Sort</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-800 
                             border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-10">
                  {[
                    { value: 'default', label: 'Default' },
                    { value: 'rating', label: 'Highly Rated' },
                    { value: 'alphabetical', label: 'A to Z' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as any);
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                               transition-all duration-300 first:rounded-t-lg last:rounded-b-lg text-sm"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-300px)]">
        {sortedAndFilteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg 
                     hover:shadow-xl transform hover:scale-105 transition-all duration-300 
                     overflow-hidden border border-gray-200/50 dark:border-gray-700/50 group
                     relative"
          >
            {/* Shining effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="p-5 relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    recommendation.type === 'job' 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    {recommendation.type === 'job' ? (
                      <Briefcase className={`w-5 h-5 ${
                        recommendation.type === 'job' 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`} />
                    ) : (
                      <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 
                                 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {recommendation.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {recommendation.company}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium
                  ${recommendation.type === 'job' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                  {recommendation.type === 'job' ? 'Job' : 'Course'}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                {recommendation.description}
              </p>

              {/* Job Details */}
              {recommendation.type === 'job' && (
                <div className="flex items-center space-x-4 mb-4 text-gray-500 dark:text-gray-400">
                  {recommendation.location && (
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{recommendation.location}</span>
                    </div>
                  )}
                  {recommendation.salary && (
                    <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs">
                      <DollarSign className="w-3 h-3" />
                      <span>{recommendation.salary}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              <div className="mb-4">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  Required Skills:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendation.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300
                        ${user?.skills?.includes(skill)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ring-1 ring-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => window.open(recommendation.url, '_blank')}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg 
                          font-medium transform hover:scale-105 transition-all duration-300
                          shadow-md hover:shadow-lg text-sm
                          ${recommendation.type === 'job'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
              >
                <span>{recommendation.type === 'job' ? 'Apply Now' : 'Enroll Now'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedAndFilteredRecommendations.length === 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-12 text-center
                       border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-4xl mb-3">
            {searchTerm ? '🔍' : '💼'}
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            {searchTerm ? 'No results found' : 'No recommendations available'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            {searchTerm 
              ? 'Try adjusting your search terms or filters'
              : 'Complete your profile and add skills to get recommendations'
            }
          </p>
        </div>
      )}

      {/* Skills Match Summary */}
      {user?.skills && user.skills.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6
                       border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                       transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 relative z-10">
            Your Skills Match
          </h2>
          
          <div className="grid grid-cols-3 gap-4 relative z-10">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {recommendations.filter(rec => 
                  rec.skills.some(skill => user.skills.includes(skill))
                ).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">Matching</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {recommendations.filter(rec => rec.type === 'job').length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">Jobs</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {recommendations.filter(rec => rec.type === 'course').length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">Courses</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};