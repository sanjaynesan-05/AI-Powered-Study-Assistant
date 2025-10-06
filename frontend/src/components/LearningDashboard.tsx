import React, { useState } from 'react';
import { 
  useUserProgress, 
  useLearningAnalytics, 
  useAIInteractions, 
  useVideoHistory,
  useLearningSession,
  useDashboard 
} from '../hooks/useDataPersistence';
import { 
  BarChart, 
  TrendingUp, 
  BookOpen, 
  Play, 
  Brain, 
  Clock, 
  Target,
  Award,
  Activity,
  RefreshCw
} from 'lucide-react';

const LearningDashboard: React.FC = () => {
  const { loading: dashboardLoading, refreshDashboard } = useDashboard();
  const { analytics, loading: analyticsLoading } = useLearningAnalytics(30);
  const { allProgress, loading: progressLoading } = useUserProgress();
  const { interactions, loading: interactionsLoading } = useAIInteractions();
  const { videoHistory, loading: videoLoading } = useVideoHistory();
  const { sessions, loading: sessionsLoading } = useLearningSession();

  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'interactions' | 'videos' | 'sessions'>('overview');

  const isLoading = dashboardLoading || analyticsLoading || progressLoading || interactionsLoading || videoLoading || sessionsLoading;

  // Mock data for demonstration when real data isn't available
  const mockData = {
    totalTimeSpent: 1250,
    skillAreasActive: 5,
    averageProgress: 68,
    currentStreak: 7,
    longestStreak: 15,
    sessionsCount: 23,
    aiInteractionsCount: 45
  };

  const displayData = analytics || mockData;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, percentage, color = 'blue' }: any) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your progress and achievements</p>
        </div>
        <button
          onClick={refreshDashboard}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'interactions', label: 'AI Interactions', icon: Brain },
              { id: 'videos', label: 'Video History', icon: Play },
              { id: 'sessions', label: 'Study Sessions', icon: BookOpen }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Clock}
                  title="Total Study Time"
                  value={`${Math.floor((displayData.totalTimeSpent || 0) / 60)}h ${(displayData.totalTimeSpent || 0) % 60}m`}
                  subtitle="This month"
                  color="blue"
                />
                <StatCard
                  icon={Target}
                  title="Active Skills"
                  value={displayData.skillAreasActive || 0}
                  subtitle="In progress"
                  color="green"
                />
                <StatCard
                  icon={Award}
                  title="Current Streak"
                  value={`${displayData.currentStreak || 0} days`}
                  subtitle={`Best: ${displayData.longestStreak || 0} days`}
                  color="orange"
                />
                <StatCard
                  icon={Activity}
                  title="Avg Progress"
                  value={`${Math.round(displayData.averageProgress || 0)}%`}
                  subtitle="Across all skills"
                  color="purple"
                />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Progress</h3>
                  {allProgress.slice(0, 5).map((progress, index) => (
                    <ProgressBar
                      key={index}
                      label={progress.skillArea}
                      percentage={progress.progressPercentage}
                      color="blue"
                    />
                  ))}
                  {allProgress.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No progress data available</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Study Sessions</span>
                      <span className="font-semibold">{displayData.sessionsCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">AI Interactions</span>
                      <span className="font-semibold">{displayData.aiInteractionsCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Videos Watched</span>
                      <span className="font-semibold">{videoHistory.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Skills Improving</span>
                      <span className="font-semibold">{allProgress.filter(p => p.progressPercentage > 0).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Skill Progress</h3>
              {allProgress.map((progress, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{progress.skillArea}</h4>
                      <p className="text-sm text-gray-600">Level: {progress.currentLevel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{progress.progressPercentage}%</p>
                      <p className="text-sm text-gray-500">{Math.floor(progress.totalTimeSpent / 60)}h studied</p>
                    </div>
                  </div>
                  <ProgressBar
                    label=""
                    percentage={progress.progressPercentage}
                    color="blue"
                  />
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Modules:</span>
                      <span className="ml-2 font-medium">{progress.completedModules?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Streak:</span>
                      <span className="ml-2 font-medium">{progress.streakData?.currentStreak || 0} days</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Study:</span>
                      <span className="ml-2 font-medium">
                        {progress.lastAccessedAt ? new Date(progress.lastAccessedAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Achievements:</span>
                      <span className="ml-2 font-medium">{progress.achievements?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
              {allProgress.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No progress data available</p>
                  <p className="text-sm text-gray-400 mt-1">Start learning to see your progress here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">AI Interaction History</h3>
              {interactions.slice(0, 10).map((interaction, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{interaction.agentType}</h4>
                      <p className="text-sm text-gray-600 mt-1">{interaction.query}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(interaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 text-sm">
                    <div className="text-gray-700">
                      {typeof interaction.response === 'string' 
                        ? interaction.response.substring(0, 200) + '...'
                        : JSON.stringify(interaction.response).substring(0, 200) + '...'
                      }
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence: {Math.round((interaction.confidence || 0) * 100)}%</span>
                    <span>Processing: {interaction.processingTime || 0}ms</span>
                    {interaction.fallbackUsed && <span className="text-orange-600">Fallback used</span>}
                  </div>
                </div>
              ))}
              {interactions.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No AI interactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start chatting with AI agents to see history here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Video Watch History</h3>
              {videoHistory.slice(0, 10).map((video, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-30 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{video.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{video.channelTitle}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                        <span>Watch time: {Math.floor(video.totalWatchTime / 60)}m</span>
                        <span>Completed: {video.completionCount}x</span>
                        <span>Skill: {video.skillArea}</span>
                        <span>Last: {new Date(video.lastWatchedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {videoHistory.length === 0 && (
                <div className="text-center py-12">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No videos watched yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start watching educational videos to see history here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Study Sessions</h3>
              {sessions.slice(0, 10).map((session, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{session.skillArea}</h4>
                      <p className="text-sm text-gray-600">Type: {session.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">{session.duration || 0}min</p>
                      <p className="text-sm text-gray-500">{new Date(session.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {session.activities && session.activities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Activities:</p>
                      <div className="space-y-1">
                        {session.activities.slice(0, 3).map((activity, actIndex) => (
                          <div key={actIndex} className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                            {activity.title} - {activity.timeSpent}min
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No study sessions recorded</p>
                  <p className="text-sm text-gray-400 mt-1">Start a study session to see data here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;