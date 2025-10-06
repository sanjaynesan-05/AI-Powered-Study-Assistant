// Routes for user progress and learning data persistence
const express = require('express');
const {
  ProgressController,
  AIInteractionController,
  VideoHistoryController,
  LearningSessionController
} = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  UserProgress,
  AIInteraction,
  VideoHistory,
  LearningSession,
  SkillAssessment
} = require('../models/progressModels');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User Progress Routes
router.get('/progress/:userId', ProgressController.getAllUserProgress);
router.get('/progress/:userId/:skillArea', ProgressController.getUserProgress);
router.put('/progress/:userId/:skillArea', ProgressController.updateUserProgress);
router.post('/progress/:userId/:skillArea/module', ProgressController.addCompletedModule);
router.get('/analytics/:userId', ProgressController.getLearningAnalytics);

// AI Interaction Routes
router.post('/ai-interactions', AIInteractionController.saveInteraction);
router.get('/ai-interactions/:userId', AIInteractionController.getInteractionHistory);
router.put('/ai-interactions/:interactionId/feedback', AIInteractionController.updateFeedback);

// Video History Routes
router.put('/video-history/:userId/:videoId', VideoHistoryController.updateVideoSession);
router.get('/video-history/:userId', VideoHistoryController.getVideoHistory);
router.post('/video-history/:userId/:videoId/:sessionIndex/bookmark', VideoHistoryController.addBookmark);

// Learning Session Routes
router.post('/sessions', LearningSessionController.startSession);
router.put('/sessions/:sessionId/end', LearningSessionController.endSession);
router.get('/sessions/:userId', LearningSessionController.getSessions);

// Bulk data operations
router.post('/bulk/progress', async (req, res) => {
  try {
    const { updates } = req.body;
    const results = [];

    for (const update of updates) {
      const result = await ProgressController.updateUserProgress({
        params: { userId: update.userId, skillArea: update.skillArea },
        body: update.data
      }, { json: (data) => data });
      results.push(result);
    }

    res.json({
      success: true,
      data: results,
      message: 'Bulk progress update completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in bulk progress update',
      error: error.message
    });
  }
});

// Analytics endpoints
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get recent analytics data
    const analyticsReq = { params: { userId }, query: { timeframe: '7' } };
    const analyticsRes = { json: (data) => data };
    const analytics = await ProgressController.getLearningAnalytics(analyticsReq, analyticsRes);

    // Get recent AI interactions
    const interactionsReq = { params: { userId }, query: { limit: 5 } };
    const interactionsRes = { json: (data) => data };
    const interactions = await AIInteractionController.getInteractionHistory(interactionsReq, interactionsRes);

    // Get recent video history
    const videoReq = { params: { userId }, query: { limit: 5 } };
    const videoRes = { json: (data) => data };
    const videos = await VideoHistoryController.getVideoHistory(videoReq, videoRes);

    const dashboard = {
      analytics: analytics.data,
      recentInteractions: interactions.data,
      recentVideos: videos.data,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// Export/Import data
router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'json' } = req.query;

    // Fetch all user data
    const [progress, interactions, videos, sessions] = await Promise.all([
      UserProgress.find({ userId }),
      AIInteraction.find({ userId }).sort({ createdAt: -1 }).limit(1000),
      VideoHistory.find({ userId }).sort({ lastWatchedAt: -1 }),
      LearningSession.find({ userId }).sort({ startTime: -1 }).limit(500)
    ]);

    const exportData = {
      userId,
      exportDate: new Date(),
      data: {
        progress,
        interactions,
        videos,
        sessions
      },
      metadata: {
        totalProgress: progress.length,
        totalInteractions: interactions.length,
        totalVideos: videos.length,
        totalSessions: sessions.length
      }
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csv = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="learning-data-${userId}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="learning-data-${userId}.json"`);
      res.json(exportData);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error.message
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  const rows = [];
  
  // Add headers
  rows.push(['Type', 'Date', 'Skill Area', 'Details', 'Progress', 'Time Spent']);
  
  // Add progress data
  data.data.progress.forEach(p => {
    rows.push([
      'Progress',
      p.lastAccessedAt,
      p.skillArea,
      `Level: ${p.currentLevel}`,
      `${p.progressPercentage}%`,
      `${p.totalTimeSpent} min`
    ]);
  });
  
  // Add session data
  data.data.sessions.forEach(s => {
    rows.push([
      'Session',
      s.startTime,
      s.skillArea,
      s.type,
      '',
      `${s.duration} min`
    ]);
  });
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

module.exports = router;