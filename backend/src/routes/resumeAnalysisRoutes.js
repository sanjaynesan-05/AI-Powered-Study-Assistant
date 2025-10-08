const express = require('express');
const router = express.Router();
const { upload, analyzeResume } = require('../controllers/resumeAnalysisController');
router.post('/analyze-resume', (req, res, next) => {
    console.log('Resume analysis route hit');
    upload.single('resume')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                error: err.message || 'Error uploading file'
            });
        }
        analyzeResume(req, res).catch(error => {
            console.error('Resume analysis error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to analyze resume',
                details: error.message
            });
        });
    });
});
module.exports = router;