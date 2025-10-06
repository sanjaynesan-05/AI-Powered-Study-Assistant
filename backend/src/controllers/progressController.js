// Controllers for user progress and learning data persistence
const {
  UserProgress,
  AIInteraction,
  VideoHistory,
  LearningSession,
  SkillAssessment
} = require('../models/progressModels');

// User Progress Controller
class ProgressController {
  // Get user progress for a specific skill area
  static async getUserProgress(req, res) {
    try {
      const { userId, skillArea } = req.params;
      
      const progress = await UserProgress.findOne({ userId, skillArea });
      
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'No progress found for this skill area'
        });
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user progress',
        error: error.message
      });
    }
  }

  // Get all progress for a user
  static async getAllUserProgress(req, res) {
    try {
      const { userId } = req.params;
      
      const progressList = await UserProgress.find({ userId })
        .sort({ lastAccessedAt: -1 });

      res.json({
        success: true,
        data: progressList,
        totalSkillAreas: progressList.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user progress',
        error: error.message
      });
    }
  }

  // Update user progress
  static async updateUserProgress(req, res) {
    try {
      const { userId, skillArea } = req.params;
      const updateData = req.body;

      // Calculate streak data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingProgress = await UserProgress.findOne({ userId, skillArea });
      
      if (existingProgress) {
        const lastStudy = existingProgress.streakData?.lastStudyDate;
        if (lastStudy) {
          const lastStudyDate = new Date(lastStudy);
          lastStudyDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day - increment streak
            updateData.streakData = {
              ...existingProgress.streakData,
              currentStreak: (existingProgress.streakData?.currentStreak || 0) + 1,
              lastStudyDate: new Date()
            };
            updateData.streakData.longestStreak = Math.max(
              updateData.streakData.currentStreak,
              existingProgress.streakData?.longestStreak || 0
            );
          } else if (daysDiff > 1) {
            // Streak broken
            updateData.streakData = {
              currentStreak: 1,
              longestStreak: existingProgress.streakData?.longestStreak || 0,
              lastStudyDate: new Date()
            };
          }
        }
      }

      updateData.lastAccessedAt = new Date();

      const progress = await UserProgress.findOneAndUpdate(
        { userId, skillArea },
        updateData,
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        success: true,
        data: progress,
        message: 'Progress updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user progress',
        error: error.message
      });
    }
  }

  // Add completed module
  static async addCompletedModule(req, res) {
    try {
      const { userId, skillArea } = req.params;
      const { moduleId, title, timeSpent, score } = req.body;

      const progress = await UserProgress.findOneAndUpdate(
        { userId, skillArea },
        {
          $push: {
            completedModules: {
              moduleId,
              title,
              completedAt: new Date(),
              timeSpent,
              score
            }
          },
          $inc: { totalTimeSpent: timeSpent || 0 },
          lastAccessedAt: new Date()
        },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        data: progress,
        message: 'Module completion recorded'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording module completion',
        error: error.message
      });
    }
  }

  // Get learning analytics
  static async getLearningAnalytics(req, res) {
    try {
      const { userId } = req.params;
      const { timeframe = '30' } = req.query; // days

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeframe));

      // Get recent progress data
      const progressData = await UserProgress.find({ userId });
      
      // Get recent learning sessions
      const sessions = await LearningSession.find({
        userId,
        startTime: { $gte: startDate }
      }).sort({ startTime: -1 });

      // Get recent AI interactions
      const aiInteractions = await AIInteraction.find({
        userId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: -1 });

      // Calculate analytics
      const analytics = {
        totalTimeSpent: progressData.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0),
        skillAreasActive: progressData.length,
        averageProgress: progressData.length > 0 
          ? progressData.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / progressData.length 
          : 0,
        sessionsCount: sessions.length,
        aiInteractionsCount: aiInteractions.length,
        currentStreak: Math.max(...progressData.map(p => p.streakData?.currentStreak || 0), 0),
        longestStreak: Math.max(...progressData.map(p => p.streakData?.longestStreak || 0), 0),
        skillBreakdown: progressData.map(p => ({
          skillArea: p.skillArea,
          level: p.currentLevel,
          progress: p.progressPercentage,
          timeSpent: p.totalTimeSpent,
          modulesCompleted: p.completedModules?.length || 0
        })),
        recentActivity: sessions.slice(0, 10).map(s => ({
          type: s.type,
          skillArea: s.skillArea,
          duration: s.duration,
          date: s.startTime
        }))
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching learning analytics',
        error: error.message
      });
    }
  }
}

// AI Interaction Controller
class AIInteractionController {
  // Save AI interaction
  static async saveInteraction(req, res) {
    try {
      const interaction = new AIInteraction(req.body);
      await interaction.save();

      res.status(201).json({
        success: true,
        data: interaction,
        message: 'AI interaction saved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error saving AI interaction',
        error: error.message
      });
    }
  }

  // Get user's AI interaction history
  static async getInteractionHistory(req, res) {
    try {
      const { userId } = req.params;
      const { agentType, limit = 50, page = 1 } = req.query;

      const query = { userId };
      if (agentType) query.agentType = agentType;

      const interactions = await AIInteraction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await AIInteraction.countDocuments(query);

      res.json({
        success: true,
        data: interactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching interaction history',
        error: error.message
      });
    }
  }

  // Update interaction feedback
  static async updateFeedback(req, res) {
    try {
      const { interactionId } = req.params;
      const { rating, comment, helpful } = req.body;

      const interaction = await AIInteraction.findByIdAndUpdate(
        interactionId,
        {
          feedback: { rating, comment, helpful }
        },
        { new: true }
      );

      if (!interaction) {
        return res.status(404).json({
          success: false,
          message: 'Interaction not found'
        });
      }

      res.json({
        success: true,
        data: interaction,
        message: 'Feedback updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating feedback',
        error: error.message
      });
    }
  }
}

// Video History Controller
class VideoHistoryController {
  // Add or update video watch session
  static async updateVideoSession(req, res) {
    try {
      const { userId, videoId } = req.params;
      const { 
        title, 
        channelTitle, 
        duration, 
        category, 
        skillArea,
        sessionData 
      } = req.body;

      let videoHistory = await VideoHistory.findOne({ userId, videoId });

      if (!videoHistory) {
        // Create new video history
        videoHistory = new VideoHistory({
          userId,
          videoId,
          title,
          channelTitle,
          duration,
          category,
          skillArea,
          watchHistory: [sessionData],
          totalWatchTime: sessionData.watchedDuration || 0,
          completionCount: sessionData.completed ? 1 : 0
        });
      } else {
        // Update existing video history
        videoHistory.watchHistory.push(sessionData);
        videoHistory.totalWatchTime += sessionData.watchedDuration || 0;
        if (sessionData.completed) {
          videoHistory.completionCount += 1;
        }
        videoHistory.lastWatchedAt = new Date();
      }

      await videoHistory.save();

      res.json({
        success: true,
        data: videoHistory,
        message: 'Video session updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating video session',
        error: error.message
      });
    }
  }

  // Get user's video history
  static async getVideoHistory(req, res) {
    try {
      const { userId } = req.params;
      const { skillArea, limit = 20, page = 1 } = req.query;

      const query = { userId };
      if (skillArea) query.skillArea = skillArea;

      const videos = await VideoHistory.find(query)
        .sort({ lastWatchedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await VideoHistory.countDocuments(query);

      res.json({
        success: true,
        data: videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching video history',
        error: error.message
      });
    }
  }

  // Add video bookmark
  static async addBookmark(req, res) {
    try {
      const { userId, videoId, sessionIndex } = req.params;
      const { timestamp, note } = req.body;

      const videoHistory = await VideoHistory.findOne({ userId, videoId });
      
      if (!videoHistory || !videoHistory.watchHistory[sessionIndex]) {
        return res.status(404).json({
          success: false,
          message: 'Video session not found'
        });
      }

      videoHistory.watchHistory[sessionIndex].bookmarks.push({
        timestamp,
        note,
        createdAt: new Date()
      });

      await videoHistory.save();

      res.json({
        success: true,
        data: videoHistory,
        message: 'Bookmark added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding bookmark',
        error: error.message
      });
    }
  }
}

// Learning Session Controller
class LearningSessionController {
  // Start a new learning session
  static async startSession(req, res) {
    try {
      const session = new LearningSession({
        ...req.body,
        startTime: new Date()
      });

      await session.save();

      res.status(201).json({
        success: true,
        data: session,
        message: 'Learning session started'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error starting learning session',
        error: error.message
      });
    }
  }

  // End learning session
  static async endSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { activities, goals, reflections, metadata } = req.body;

      const endTime = new Date();
      const session = await LearningSession.findOne({ sessionId });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      const duration = Math.floor((endTime - session.startTime) / (1000 * 60)); // minutes

      session.endTime = endTime;
      session.duration = duration;
      if (activities) session.activities = activities;
      if (goals) session.goals = goals;
      if (reflections) session.reflections = reflections;
      if (metadata) session.metadata = metadata;

      await session.save();

      res.json({
        success: true,
        data: session,
        message: 'Learning session completed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error ending learning session',
        error: error.message
      });
    }
  }

  // Get user's learning sessions
  static async getSessions(req, res) {
    try {
      const { userId } = req.params;
      const { skillArea, type, limit = 20, page = 1 } = req.query;

      const query = { userId };
      if (skillArea) query.skillArea = skillArea;
      if (type) query.type = type;

      const sessions = await LearningSession.find(query)
        .sort({ startTime: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await LearningSession.countDocuments(query);

      res.json({
        success: true,
        data: sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching learning sessions',
        error: error.message
      });
    }
  }
}

module.exports = {
  ProgressController,
  AIInteractionController,
  VideoHistoryController,
  LearningSessionController
};