import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Filter, Search, ChevronDown, AlertTriangle, Clock, ExternalLink, Brain, Target, Award, RefreshCw } from 'lucide-react';
import { Recommendation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAIAgent } from '../contexts/AIAgentContext';
import { JobEligibilityTest, TestResult } from '../components/JobEligibilityTest';

export const MockTestPage: React.FC = () => {
  const { user } = useAuth();
  const { activeAssessment, setActiveAssessment, isGenerating } = useAIAgent();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'job' | 'ai'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'alphabetical'>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [testIsOpen, setTestIsOpen] = useState(false);
  
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(() => {
    const saved = localStorage.getItem('jobTestResults');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [failedAttempts, setFailedAttempts] = useState<Record<string, Date>>(() => {
    const saved = localStorage.getItem('jobFailedAttempts');
    if (saved) {
      const parsed = JSON.parse(saved);
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
      }
    ];

    setRecommendations(mockRecommendations);
  }, [user?.skills]);
  
  useEffect(() => {
    localStorage.setItem('jobTestResults', JSON.stringify(testResults));
  }, [testResults]);
  
  useEffect(() => {
    localStorage.setItem('jobFailedAttempts', JSON.stringify(failedAttempts));
  }, [failedAttempts]);
  
  const hasCooldown = (jobId: string) => {
    const failedDate = failedAttempts[jobId];
    if (!failedDate) return false;
    const cooldownPeriod = 24 * 60 * 60 * 1000;
    const cooldownEnds = new Date(failedDate.getTime() + cooldownPeriod);
    const now = new Date();
    return now < cooldownEnds;
  };
  
  const getCooldownRemaining = (jobId: string) => {
    const failedDate = failedAttempts[jobId];
    if (!failedDate) return '';
    const cooldownPeriod = 24 * 60 * 60 * 1000;
    const cooldownEnds = new Date(failedDate.getTime() + cooldownPeriod);
    const now = new Date();
    if (now >= cooldownEnds) return '';
    const remainingMs = cooldownEnds.getTime() - now.getTime();
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  const hasPassedTest = (jobId: string) => {
    return !!testResults[jobId]?.passed;
  };
  
  const handleOpenTest = (job: any) => {
    if (hasCooldown(job.id)) {
      alert(`You cannot retake this test yet. Please wait ${getCooldownRemaining(job.id)}.`);
      return;
    }
    setSelectedJob(job);
    setTestIsOpen(true);
  };
  
  const handleTestComplete = (result: TestResult) => {
    if (!selectedJob) return;
    setTestResults(prev => ({
      ...prev,
      [selectedJob.id]: result
    }));
    if (!result.passed) {
      setFailedAttempts(prev => ({
        ...prev,
        [selectedJob.id]: new Date()
      }));
    }
  };
  
  const handleCloseTest = () => {
    setTestIsOpen(false);
    setSelectedJob(null);
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white 
                     hover:shadow-xl transition-all duration-300 relative overflow-hidden group shadow-lg">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Mock Test Center</h1>
            </div>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl">
              Validate your skills with AI-powered diagnostic tests. High performance unlocks job applications.
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-black/20 p-3 rounded-xl backdrop-blur-md">
            <div className="text-center px-4 border-r border-white/10">
              <div className="text-xl font-bold">{Object.values(testResults).filter(r => r.passed).length}</div>
              <div className="text-[10px] uppercase tracking-wider text-blue-200">Tests Passed</div>
            </div>
            <div className="text-center px-4">
              <div className="text-xl font-bold">{Object.keys(testResults).length}</div>
              <div className="text-[10px] uppercase tracking-wider text-blue-200">Total Attempts</div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE AI ASSESSMENT (TOP PRIORITY) */}
      {activeAssessment && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-purple-500/30 shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl text-purple-600 dark:text-purple-400">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded">AI Generated</span>
                    <span className="text-xs text-gray-500">Ready to start</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Diagnostic: {activeAssessment.topic}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This test is specifically tailored to your current learning progress in {activeAssessment.topic}.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setActiveAssessment(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Discard
                </button>
                <button 
                  onClick={() => handleOpenTest({
                    ...activeAssessment,
                    id: activeAssessment.quiz_id || 'ai-custom',
                    title: activeAssessment.topic,
                    company: 'AI Assistant',
                    type: 'ai',
                  })}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATING STATE */}
      {isGenerating && !activeAssessment && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-blue-500/30 shadow-lg animate-pulse overflow-hidden relative">
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">AI Mentor is building your test...</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Crafting custom questions specialized for you.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
          <Award className="w-5 h-5 text-blue-500" />
          <span>Available Certifications & Tests</span>
        </h3>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid of certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5 hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Briefcase className="w-5 h-5" />
              </div>
              {hasPassedTest(recommendation.id) && (
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-[10px] font-bold rounded-lg uppercase">Certified</span>
              )}
            </div>
            
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
              {recommendation.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{recommendation.company} • {recommendation.location}</p>
            
            <div className="flex flex-wrap gap-1.5 mb-6">
              {recommendation.skills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                10-15 mins
              </div>
              {hasCooldown(recommendation.id) ? (
                <div className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  Retry in {getCooldownRemaining(recommendation.id)}
                </div>
              ) : (
                <button
                  onClick={() => handleOpenTest(recommendation)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    hasPassedTest(recommendation.id) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {hasPassedTest(recommendation.id) ? 'Re-take Test' : 'Start Test'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && !activeAssessment && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Tests Found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or generate a new test with AI Mentor.</p>
        </div>
      )}

      {/* MODAL */}
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
