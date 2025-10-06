// Controllers for user progress and learning data persistence
const { Op } = require('sequelize');
const {
  UserProgress,
  LearningSession,
  QuizResult,
  StudyMaterial
} = require('../models/indexPG');

// User Progress Controller
class ProgressController {
  // Get user progress for a specific skill area
  static async getUserProgress(req, res) {
    try {
      const { userId, skillArea } = req.params;
      
      const progress = await UserProgress.findOne({ 
        where: { userId, skillArea } 
      });
      
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
      
      const progressList = await UserProgress.findAll({ 
        where: { userId },
        order: [['lastAccessedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: progressList,
        totalSkillAreas: progressList.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching all user progress',
        error: error.message
      });
    }
  }

  // Create or update user progress
  static async updateProgress(req, res) {
    try {
      const { userId, skillArea } = req.params;
      const updateData = req.body;

      const [progress, created] = await UserProgress.findOrCreate({
        where: { userId, skillArea },
        defaults: {
          userId,
          skillArea,
          ...updateData,
          lastAccessedAt: new Date()
        }
      });

      if (!created) {
        await progress.update({
          ...updateData,
          lastAccessedAt: new Date()
        });
      }

      res.json({
        success: true,
        data: progress,
        message: created ? 'Progress created successfully' : 'Progress updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating progress',
        error: error.message
      });
    }
  }

  // Record a learning session
  static async recordSession(req, res) {
    try {
      const { userId } = req.params;
      const sessionData = {
        userId,
        ...req.body
      };

      const session = await LearningSession.create(sessionData);

      // Update overall progress
      await this.updateUserProgressFromSession(userId, sessionData);

      res.status(201).json({
        success: true,
        data: session,
        message: 'Learning session recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording learning session',
        error: error.message
      });
    }
  }

  // Get learning sessions for a user
  static async getUserSessions(req, res) {
    try {
      const { userId } = req.params;
      const { skillArea, limit = 10, offset = 0 } = req.query;

      const whereClause = { userId };
      if (skillArea) {
        whereClause.skillArea = skillArea;
      }

      const sessions = await LearningSession.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: sessions.rows,
        pagination: {
          total: sessions.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(sessions.count / limit)
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

  // Record quiz result
  static async recordQuizResult(req, res) {
    try {
      const { userId } = req.params;
      const quizData = {
        userId,
        ...req.body
      };

      const quizResult = await QuizResult.create(quizData);

      res.status(201).json({
        success: true,
        data: quizResult,
        message: 'Quiz result recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording quiz result',
        error: error.message
      });
    }
  }

  // Get quiz results for a user
  static async getUserQuizResults(req, res) {
    try {
      const { userId } = req.params;
      const { skillArea } = req.query;

      const whereClause = { userId };
      if (skillArea) {
        whereClause.skillArea = skillArea;
      }

      const quizResults = await QuizResult.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: quizResults
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching quiz results',
        error: error.message
      });
    }
  }

  // Get study materials
  static async getStudyMaterials(req, res) {
    try {
      const { category, difficulty, contentType } = req.query;

      const whereClause = { isActive: true };
      if (category) whereClause.category = category;
      if (difficulty) whereClause.difficulty = difficulty;
      if (contentType) whereClause.contentType = contentType;

      const materials = await StudyMaterial.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: materials
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching study materials',
        error: error.message
      });
    }
  }

  // Create study material
  static async createStudyMaterial(req, res) {
    try {
      const materialData = {
        ...req.body,
        createdBy: req.user?.id
      };

      const material = await StudyMaterial.create(materialData);

      res.status(201).json({
        success: true,
        data: material,
        message: 'Study material created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating study material',
        error: error.message
      });
    }
  }

  // Analytics endpoint - Get user learning analytics
  static async getUserAnalytics(req, res) {
    try {
      const { userId } = req.params;
      const { timeframe = '30' } = req.query;

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

      // Get progress data
      const progressData = await UserProgress.findAll({
        where: { userId }
      });

      // Get recent sessions
      const recentSessions = await LearningSession.findAll({
        where: {
          userId,
          createdAt: {
            [Op.gte]: daysAgo
          }
        },
        order: [['createdAt', 'DESC']]
      });

      // Get quiz performance
      const quizResults = await QuizResult.findAll({
        where: {
          userId,
          createdAt: {
            [Op.gte]: daysAgo
          }
        }
      });

      // Calculate analytics
      const totalTimeSpent = recentSessions.reduce((total, session) => total + session.duration, 0);
      const averageQuizScore = quizResults.length > 0 
        ? quizResults.reduce((total, quiz) => total + quiz.score, 0) / quizResults.length 
        : 0;

      const analytics = {
        progressOverview: progressData,
        recentActivity: {
          totalSessions: recentSessions.length,
          totalTimeSpent: totalTimeSpent,
          averageSessionDuration: recentSessions.length > 0 ? totalTimeSpent / recentSessions.length : 0
        },
        quizPerformance: {
          totalQuizzes: quizResults.length,
          averageScore: averageQuizScore,
          recentResults: quizResults.slice(0, 5)
        },
        skillDistribution: this.calculateSkillDistribution(progressData),
        streakData: this.calculateStreak(recentSessions)
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating user analytics',
        error: error.message
      });
    }
  }

  // Helper method to update progress from session data
  static async updateUserProgressFromSession(userId, sessionData) {
    try {
      const { skillArea, duration, score, completed } = sessionData;

      const [progress] = await UserProgress.findOrCreate({
        where: { userId, skillArea },
        defaults: {
          userId,
          skillArea,
          totalTimeSpent: duration,
          lastAccessedAt: new Date()
        }
      });

      // Update progress
      await progress.update({
        totalTimeSpent: progress.totalTimeSpent + duration,
        lastAccessedAt: new Date(),
        progressPercentage: completed ? Math.min(progress.progressPercentage + 5, 100) : progress.progressPercentage
      });

      return progress;
    } catch (error) {
      console.error('Error updating progress from session:', error);
    }
  }

  // Helper method to calculate skill distribution
  static calculateSkillDistribution(progressData) {
    const distribution = {};
    progressData.forEach(progress => {
      distribution[progress.skillArea] = {
        timeSpent: progress.totalTimeSpent,
        level: progress.currentLevel,
        percentage: progress.progressPercentage
      };
    });
    return distribution;
  }

  // Helper method to calculate learning streak
  static calculateStreak(sessions) {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sessionDates = sessions.map(session => 
      new Date(session.createdAt).toDateString()
    );
    const uniqueDates = [...new Set(sessionDates)].sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (consecutive days from today backwards)
    const today = new Date().toDateString();
    const todayIndex = uniqueDates.indexOf(today);
    
    if (todayIndex !== -1) {
      currentStreak = 1;
      for (let i = todayIndex - 1; i >= 0; i--) {
        const prevDate = new Date(uniqueDates[i]);
        const currDate = new Date(uniqueDates[i + 1]);
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, longestStreak };
  }
}

module.exports = ProgressController;