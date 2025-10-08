const express = require('express');
const router = express.Router();
const emotionalAnalysisController = require('../controllers/emotionalAnalysisController');

// Analyze text endpoint
router.post('/analyze-text', emotionalAnalysisController.analyzeText);

// Analyze image endpoint
router.post('/analyze', emotionalAnalysisController.analyzeImage);

module.exports = router;