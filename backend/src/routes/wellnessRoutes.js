const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

router.post('/analyze-wellness', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        // Save the image buffer to a temporary file
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        const tempImagePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
        await fs.promises.writeFile(tempImagePath, req.files.image.data);

        console.log('Attempting to analyze image at:', tempImagePath);
        
        // Run the Python script with the correct Python environment
        const pythonProcess = spawn('/Users/joeltharakan/Documents/MindBridge/AI-Powered-Study-Assistant/backend/venv/bin/python3', [
            path.join(__dirname, '../../analyze_image.py'),
            '--image',
            tempImagePath
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Python stdout:', output);
            result += output;
        });

        pythonProcess.stderr.on('data', (data) => {
            const output = data.toString();
            console.error('Python stderr:', output);
            error += output;
        });

        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                // Clean up the temporary file
                fs.unlinkSync(tempImagePath);
                
                if (code !== 0) {
                    console.error('Python process error:', error);
                    return reject(new Error('Failed to analyze image'));
                }
                resolve();
            });
        });

        try {
            const analysisResult = JSON.parse(result);
            res.json({
                emotion: analysisResult.emotion,
                confidence: analysisResult.confidence,
                stressLevel: analysisResult.stressLevel,
                category: analysisResult.category
            });
        } catch (parseError) {
            console.error('Error parsing Python output:', parseError);
            res.status(500).json({ 
                error: 'Failed to parse analysis result',
                mockData: true,
                emotion: 'neutral',
                confidence: 0.5,
                stressLevel: 50.0,
                category: 'Moderate Stress'
            });
        }
    } catch (error) {
        console.error('Error in wellness analysis:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            mockData: true,
            emotion: 'neutral',
            confidence: 0.5,
            stressLevel: 50.0,
            category: 'Moderate Stress'
        });
    }
});

module.exports = router;