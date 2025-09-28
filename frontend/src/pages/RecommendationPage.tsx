import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Filter, Search, ChevronDown, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { Recommendation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { JobEligibilityTest, TestResult } from '../components/JobEligibilityTest';

export const RecommendationPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'job'>('job');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'alphabetical'>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Recommendation | null>(null);
  const [testIsOpen, setTestIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(() => {
    const saved = localStorage.getItem('jobTestResults');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [failedAttempts, setFailedAttempts] = useState<Record<string, Date>>(() => {
    const saved = localStorage.getItem('jobFailedAttempts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert string dates back to Date objects
      Object.keys(parsed).forEach(key => {
        parsed[key] = new Date(parsed[key]);
      });
      return parsed;
    }
    return {};
  });

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
        id: '7',
        title: 'Backend Developer',
        company: 'CloudSolutions',
        type: 'job',
        description: 'Develop robust backend systems using Node.js and databases.',
        skills: ['Node.js', 'MongoDB', 'Express'],
        location: 'Austin, TX',
        salary: '$85k - $130k',
        url: 'https://example-jobs.com/backend-dev'
      },
      {
        id: '8',
        title: 'DevOps Engineer',
        company: 'InfraTech',
        type: 'job',
        description: 'Build and maintain CI/CD pipelines and cloud infrastructure.',
        skills: ['Docker', 'Kubernetes', 'AWS'],
        location: 'Chicago, IL',
        salary: '$95k - $150k',
        url: 'https://example-jobs.com/devops'
      }
    ];

    setRecommendations(mockRecommendations);
  }, [user?.skills]);
  
  // Store test results in local storage
  useEffect(() => {
    localStorage.setItem('jobTestResults', JSON.stringify(testResults));
  }, [testResults]);
  
  // Store failed attempts in local storage
  useEffect(() => {
    localStorage.setItem('jobFailedAttempts', JSON.stringify(failedAttempts));
  }, [failedAttempts]);
  
  // All jobs require an eligibility test in this implementation
  
  // Check if user has a cooldown period for a failed job application
  const hasCooldown = (jobId: string) => {
    const failedDate = failedAttempts[jobId];
    if (!failedDate) return false;
    
    // Calculate 24 hours from failed attempt
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in ms
    const cooldownEnds = new Date(failedDate.getTime() + cooldownPeriod);
    const now = new Date();
    
    return now < cooldownEnds;
  };
  
  // Get remaining cooldown time in hours and minutes
  const getCooldownRemaining = (jobId: string) => {
    const failedDate = failedAttempts[jobId];
    if (!failedDate) return '';
    
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in ms
    const cooldownEnds = new Date(failedDate.getTime() + cooldownPeriod);
    const now = new Date();
    
    if (now >= cooldownEnds) return '';
    
    const remainingMs = cooldownEnds.getTime() - now.getTime();
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  // Check if user has passed the test for this job
  const hasPassedTest = (jobId: string) => {
    return !!testResults[jobId]?.passed;
  };
  
  // Handle opening the test
  const handleOpenTest = (job: Recommendation) => {
    if (hasCooldown(job.id)) {
      alert(`You cannot retake this test yet. Please wait ${getCooldownRemaining(job.id)}.`);
      return;
    }
    
    // Always set the selected job and open the test modal
    setSelectedJob(job);
    setTestIsOpen(true);
  };
  
  // Handle test completion
  const handleTestComplete = (result: TestResult) => {
    if (!selectedJob) return;
    
    // Save the test result
    setTestResults(prev => ({
      ...prev,
      [selectedJob.id]: result
    }));
    
    // Record failed attempts for cooldown
    if (!result.passed) {
      setFailedAttempts(prev => ({
        ...prev,
        [selectedJob.id]: new Date()
      }));
    }
    
    // We no longer immediately close the test
    // The user can see the results and choose to close it themselves
    // setTestIsOpen(false);
  };
  
  // Handle closing the test modal
  const handleCloseTest = () => {
    setTestIsOpen(false);
    setSelectedJob(null);
  };

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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white 
                     hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h1 className="text-xl sm:text-2xl font-bold mb-1 relative z-10">🎯 Job Recommendations</h1>
        <p className="text-blue-100 relative z-10 text-sm sm:text-base">
          Personalized job recommendations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 
                     border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-4">
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Type Filter */}
            {(['all', 'job'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-all duration-300 
                          transform hover:scale-105 text-xs sm:text-sm
                          ${filter === filterType
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
              >
                {filterType === 'all' ? 'All' : 'Jobs'}
              </button>
            ))}

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center space-x-2 px-3 py-2 sm:px-4 bg-gray-100 dark:bg-gray-700 
                         border border-gray-300 dark:border-gray-600 rounded-lg
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300
                         transform hover:scale-105 text-xs sm:text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-2 right-0 w-40 sm:w-48 bg-white dark:bg-gray-800 
                             border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-10">
                  {[
                    { value: 'default', label: 'Default' },
                    { value: 'rating', label: 'Highly Rated' },
                    { value: 'alphabetical', label: 'A to Z' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as 'default' | 'rating' | 'alphabetical');
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-3 py-2 sm:px-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                               transition-all duration-300 first:rounded-t-lg last:rounded-b-lg text-xs sm:text-sm"
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)]">
        {sortedAndFilteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg 
                     hover:shadow-xl transform hover:scale-105 transition-all duration-300 
                     overflow-hidden border border-gray-200/50 dark:border-gray-700/50 group
                     relative"
          >
            {/* Shining effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="p-4 sm:p-5 relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 
                                 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                      {recommendation.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base truncate">
                      {recommendation.company}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 sm:px-3 rounded-lg text-xs font-medium flex-shrink-0
                  bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Job
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                {recommendation.description}
              </p>

              {/* Job Details */}
              {recommendation.type === 'job' && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3 sm:mb-4 text-gray-500 dark:text-gray-400">
                  {recommendation.location && (
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs w-fit">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{recommendation.location}</span>
                    </div>
                  )}
                  {recommendation.salary && (
                    <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs w-fit">
                      <DollarSign className="w-3 h-3 flex-shrink-0" />
                      <span>{recommendation.salary}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              <div className="mb-4">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-xs sm:text-sm">
                  Required Skills:
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
              {hasCooldown(recommendation.id) ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg 
                           font-medium cursor-not-allowed shadow-md text-xs sm:text-sm
                           bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <span>Cooldown: {getCooldownRemaining(recommendation.id)}</span>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              ) : hasPassedTest(recommendation.id) ? (
                <div className="flex flex-col w-full space-y-2">
                  <button
                    onClick={() => handleOpenTest(recommendation)}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 sm:px-4 rounded-lg 
                             font-medium transform hover:scale-105 transition-all duration-300
                             shadow-md hover:shadow-lg text-xs sm:text-sm
                             bg-green-500 hover:bg-green-600 text-white"
                  >
                    <span>View Test Results</span>
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => window.open(recommendation.url, '_blank')}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 sm:px-4 rounded-lg 
                             font-medium transform hover:scale-105 transition-all duration-300
                             shadow-md hover:shadow-lg text-xs sm:text-sm
                             bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenTest(recommendation)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg 
                           font-medium transform hover:scale-105 transition-all duration-300
                           shadow-md hover:shadow-lg text-xs sm:text-sm
                           bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <span>Take Eligibility Test</span>
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sortedAndFilteredRecommendations.length === 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center
                       border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-3xl sm:text-4xl mb-3">
            {searchTerm ? '🔍' : '💼'}
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            {searchTerm ? 'No results found' : 'No recommendations available'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">
            {searchTerm 
              ? 'Try adjusting your search terms or filters'
              : 'Complete your profile and add skills to get recommendations'
            }
          </p>
        </div>
      )}

      {/* Skills Match Summary */}
      {user?.skills && user.skills.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6
                       border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl 
                       transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 relative z-10">
            Your Skills Match
          </h2>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
            <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 rounded-lg sm:rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {recommendations.filter(rec => 
                  rec.skills.some(skill => user.skills.includes(skill))
                ).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">Matching</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg sm:rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {recommendations.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">Total Jobs</div>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Test Modal */}
      {testIsOpen && selectedJob && (
        <JobEligibilityTest
          job={selectedJob}
          isOpen={testIsOpen}
          onClose={handleCloseTest}
          onComplete={handleTestComplete}
        />
      )}
    </div>
  );
};