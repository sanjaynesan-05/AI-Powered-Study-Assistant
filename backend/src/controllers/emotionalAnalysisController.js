const humeService = require('../services/humeService');

const emotionalAnalysisController = {
    analyzeText: async (req, res) => {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const result = await humeService.analyzeText(text);
            res.json(result);
        } catch (error) {
            console.error('Error in text analysis:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    analyzeImage: async (req, res) => {
        try {
            if (!req.files || !req.files.image) {
                return res.status(400).json({ error: 'Image file is required' });
            }

            const imageBuffer = req.files.image.data;
            const result = await humeService.analyzeImage(imageBuffer);
            res.json(result);
        } catch (error) {
            console.error('Error in image analysis:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = emotionalAnalysisController;