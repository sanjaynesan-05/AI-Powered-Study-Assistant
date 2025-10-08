const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
        }
    }
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const extractText = async (file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    try {
        if (ext === '.pdf') {
            const data = await pdf(file.buffer);
            return data.text;
        } else if (ext === '.doc' || ext === '.docx') {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            return result.value;
        }
        throw new Error('Unsupported file type');
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to extract text from file: ${error.message}`);
    }
};
const analyzeWithGemini = async (text) => {
    try {
        const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Analyze this resume as a professional resume expert. Focus on these key areas:
1. FORMATTING & STRUCTURE
• Overall layout and professional appearance
• Section organization and flow
• Visual hierarchy effectiveness
• Readability and spacing
2. CONTENT QUALITY
• Achievement descriptions and impact
• Role clarity and responsibilities
• Action verb usage
• Quantifiable results
3. SKILLS ANALYSIS
• Technical competencies evaluation
• Soft skills presentation
• Industry alignment
• Skill gap identification
4. EDUCATION & EXPERIENCE
• Qualification presentation
• Career progression clarity
• Professional development
• Certifications impact
5. ACTIONABLE IMPROVEMENTS
• Critical enhancements needed
• Missing key elements
• Format optimization
• Content strengthening
6. COMPETITIVE POSITIONING
• Industry standards alignment
• ATS optimization
• Market relevance
• Personal brand strength
Please analyze this resume and provide specific, actionable feedback for improvement:
${text}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        throw new Error('Failed to analyze with Gemini AI: ' + error.message);
    }
};
const analyzeWithGemini = async (text) => {
    try {
        const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Please provide a detailed analysis of this resume. Include:
        1. Format and Structure
        - Layout and organization
        - Professional appearance
        - Readability and flow
        2. Content Evaluation
        - Achievement highlights
        - Role descriptions
        - Action verbs and metrics used
        3. Skills Assessment
        - Technical competencies
        - Soft skills
        - Industry-relevant skills
        4. Experience & Education
        - Career progression
        - Relevant qualifications
        - Professional development
        5. Improvement Areas
        - Specific recommendations
        - Missing elements
        - Enhancement suggestions
        6. Overall Impact
        - Market alignment
        - Personal branding
        - Competitive positioning
        Resume Content:
        ${text}
        Please provide detailed, actionable feedback for each section.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        throw new Error('Failed to analyze with Gemini AI: ' + error.message);
    }
};
const analyzeResume = async (req, res) => {
    console.log('Starting resume analysis...');
    try {
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ 
                success: false,
                error: 'Please select a resume file to upload.' 
            });
        }
        console.log('File received:', req.file.originalname, 'Size:', req.file.size);
        let fileContent;
        try {
            fileContent = await extractText(req.file);
            console.log('Text extracted successfully, length:', fileContent?.length || 0);
            if (!fileContent || fileContent.trim().length === 0) {
                throw new Error('No text content could be extracted from the file');
            }
        } catch (extractError) {
            console.error('Text extraction failed:', extractError);
            return res.status(400).json({
                success: false,
                error: 'Could not read the resume content. Please ensure the file is not corrupted and contains text.'
            });
        }
        try {
            console.log('Starting Gemini analysis...');
            const analysis = await analyzeWithGemini(fileContent);
            if (!analysis) {
                throw new Error('No analysis was generated');
            }
            console.log('Analysis completed successfully');
            return res.json({
                success: true,
                message: analysis
            });
        } catch (analysisError) {
            console.error('Analysis failed:', analysisError);
            return res.status(500).json({
                success: false,
                error: 'Failed to analyze your resume. Please try again.',
                details: analysisError.message
            });
        }
    } catch (error) {
        console.error('Resume analysis error:', error);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred',
            details: error.message
        });
    }
};
        if (!fileContent || fileContent.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text content could be extracted from the file. Please ensure the file contains readable text.'
            });
        }
        try {
            console.log('Starting Gemini analysis...');
            const analysis = await analyzeWithGemini(fileContent);
            if (!analysis) {
                throw new Error('No analysis was generated');
            }
            return res.json({
                success: true,
                message: analysis
            });
        } catch (geminiError) {
            console.error('Gemini analysis error:', geminiError);
            return res.status(500).json({
                success: false,
                error: 'Failed to analyze resume with AI',
                details: geminiError.message
            });
        }        1. Overall Structure and Format:
           - Document organization
           - Visual hierarchy
           - Readability
        2. Content Quality and Relevance:
           - Impact and achievement focus
           - Use of action verbs
           - Relevance to modern job market
        3. Skills and Qualifications:
           - Technical skills assessment
           - Soft skills representation
           - Education and certifications
        4. Experience Descriptions:
           - Quantifiable achievements
           - Role clarity
           - Career progression
        5. Areas for Improvement:
           - Specific weaknesses
           - Missing elements
           - Format issues
        6. Action Items:
           - Prioritized list of improvements
           - Specific suggestions for each section
           - Tips for better impact
        Please provide constructive, specific feedback that will help improve the resume.
        Here's the resume content:
        ${fileContent}`;
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const analysis = response.text();
            if (!analysis || analysis.trim().length === 0) {
                throw new Error('Empty analysis received from AI');
            }
            res.json({
                success: true,
                message: analysis
            });
        } catch (aiError) {
            console.error('AI analysis error:', aiError);
            res.status(500).json({
                success: false,
                error: 'AI analysis failed. Please try again.',
                details: aiError.message
            });
        }
    } catch (error) {
        console.error('Resume analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze resume',
            details: error.toString()
        });
    }
};
module.exports = {
    upload,
    analyzeResume
};