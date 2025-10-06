const express = require('express');
const ProgressController = require('../controllers/progressControllerPG');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// User Progress Routes
router.get('/user/:userId', ProgressController.getAllUserProgress);
router.get('/user/:userId/skill/:skillArea', ProgressController.getUserProgress);
router.put('/user/:userId/skill/:skillArea', ProgressController.updateProgress);

// Learning Session Routes
router.post('/user/:userId/sessions', ProgressController.recordSession);
router.get('/user/:userId/sessions', ProgressController.getUserSessions);

// Quiz Routes
router.post('/user/:userId/quiz-results', ProgressController.recordQuizResult);
router.get('/user/:userId/quiz-results', ProgressController.getUserQuizResults);

// Study Materials Routes
router.get('/materials', ProgressController.getStudyMaterials);
router.post('/materials', ProgressController.createStudyMaterial);

// Analytics Routes
router.get('/user/:userId/analytics', ProgressController.getUserAnalytics);

module.exports = router;