/**
 * Learning Resource Agent - JavaScript implementation from Python agent
 * Recommends learning resources from various platforms using Gemini AI
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

class LearningResourceAgent {
    constructor(geminiApiKey, youtubeApiKey = null) {
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        this.youtubeApiKey = youtubeApiKey || process.env.YOUTUBE_API_KEY;
    }

    /**
     * Search for learning resources using real APIs
     */
    async searchResources(topic, pdfContent = null) {
        try {
            console.log(`🔍 Learning Agent: Searching resources for "${topic}"`);
            
            let resources = [];
            let analyzedTopic = topic;

            // If PDF content is provided, analyze it first
            if (pdfContent) {
                const pdfAnalysis = await this.analyzePdfContent(pdfContent);
                analyzedTopic = pdfAnalysis.keyTopics?.[0] || topic;
                console.log(`📄 PDF Analysis: Extracted topic "${analyzedTopic}"`);
            }

            // Gather resources from multiple sources
            const resourcePromises = [
                this.getGeeksforGeeksResources(analyzedTopic),
                this.getAIGeneratedResources(analyzedTopic)
            ];

            // Add YouTube search if API key available
            if (this.youtubeApiKey) {
                resourcePromises.push(this.searchYouTubeVideos(analyzedTopic));
            }

            const results = await Promise.allSettled(resourcePromises);
            
            // Collect successful results
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    resources = resources.concat(result.value);
                }
            });

            // Estimate difficulty and time
            const difficulty = this.estimateDifficulty(analyzedTopic, resources);
            const estimatedTime = this.estimateStudyTime(resources);

            return {
                resources: resources.slice(0, 5), // Top 5 resources
                difficulty,
                estimatedTime: `${estimatedTime} hours`,
                topic: analyzedTopic,
                totalFound: resources.length
            };

        } catch (error) {
            console.error('Learning Agent Error:', error);
            return this.getMockResources(topic);
        }
    }

    /**
     * Analyze PDF content to extract key topics
     */
    async analyzePdfContent(pdfContent) {
        try {
            const prompt = `Analyze this educational content and extract the main topics and learning objectives:

Content: ${pdfContent.substring(0, 2000)}...

Return a JSON object with:
- keyTopics: array of main topics
- learningObjectives: array of learning goals
- difficulty: estimated difficulty level
- prerequisites: suggested prerequisites

Format as valid JSON only.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            return JSON.parse(response);
        } catch (error) {
            console.error('PDF Analysis Error:', error);
            return {
                keyTopics: [],
                learningObjectives: [],
                difficulty: 'intermediate',
                prerequisites: []
            };
        }
    }

    /**
     * Search YouTube for educational videos
     */
    async searchYouTubeVideos(topic) {
        if (!this.youtubeApiKey) {
            return [];
        }

        try {
            const searchQuery = `${topic} tutorial programming coding learn`;
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: this.youtubeApiKey,
                    q: searchQuery,
                    type: 'video',
                    part: 'snippet',
                    maxResults: 3,
                    order: 'relevance',
                    videoDuration: 'medium',
                    videoDefinition: 'high'
                }
            });

            return response.data.items.map(item => ({
                title: item.snippet.title,
                description: item.snippet.description.substring(0, 150) + '...',
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                platform: 'YouTube',
                type: 'video',
                thumbnail: item.snippet.thumbnails.medium?.url,
                channel: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt
            }));

        } catch (error) {
            console.error('YouTube API Error:', error);
            return [];
        }
    }

    /**
     * Get GeeksforGeeks-style resources using AI
     */
    async getGeeksforGeeksResources(topic) {
        try {
            const prompt = `Generate 2-3 high-quality learning resources for "${topic}" in the style of GeeksforGeeks, W3Schools, or MDN.

Return a JSON array of resources with:
- title: descriptive title
- description: brief description (100 chars)
- url: realistic educational URL
- platform: platform name
- type: "article" or "tutorial"
- difficulty: "beginner", "intermediate", or "advanced"
- estimatedTime: reading time in minutes

Focus on practical, hands-on learning resources.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            // Clean and parse JSON
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedResponse);

        } catch (error) {
            console.error('GeeksforGeeks Resources Error:', error);
            return [];
        }
    }

    /**
     * Get AI-generated learning resources
     */
    async getAIGeneratedResources(topic) {
        try {
            const prompt = `Create 2 comprehensive learning resources for "${topic}".

Return JSON array with:
- title: engaging title
- description: detailed description (200 chars)
- url: educational website URL
- platform: source platform
- type: "course", "documentation", or "interactive"
- difficulty: skill level required
- estimatedTime: completion time
- keyPoints: array of 3 main learning points

Make resources practical and actionable.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedResponse);

        } catch (error) {
            console.error('AI Resources Error:', error);
            return [];
        }
    }

    /**
     * Estimate difficulty level based on topic and resources
     */
    estimateDifficulty(topic, resources) {
        const advancedKeywords = ['advanced', 'expert', 'optimization', 'architecture', 'design patterns'];
        const beginnerKeywords = ['introduction', 'basics', 'getting started', 'beginner'];
        
        const topicLower = topic.toLowerCase();
        
        if (advancedKeywords.some(keyword => topicLower.includes(keyword))) {
            return 'advanced';
        } else if (beginnerKeywords.some(keyword => topicLower.includes(keyword))) {
            return 'beginner';
        }
        
        return 'intermediate';
    }

    /**
     * Estimate study time based on resources
     */
    estimateStudyTime(resources) {
        if (!resources || resources.length === 0) {
            return 2;
        }

        let totalTime = 0;
        resources.forEach(resource => {
            if (resource.type === 'video') {
                totalTime += 0.5; // 30 minutes per video
            } else if (resource.type === 'course') {
                totalTime += 2; // 2 hours per course
            } else {
                totalTime += 0.75; // 45 minutes per article
            }
        });

        return Math.max(1, Math.ceil(totalTime));
    }

    /**
     * Fallback mock resources
     */
    getMockResources(topic) {
        return {
            resources: [
                {
                    title: `${topic} - Complete Tutorial`,
                    description: `Comprehensive guide to learning ${topic} from basics to advanced concepts`,
                    url: `https://www.example.com/${topic.toLowerCase().replace(/\s+/g, '-')}`,
                    platform: 'Educational Hub',
                    type: 'tutorial',
                    difficulty: 'intermediate',
                    estimatedTime: '45 minutes'
                },
                {
                    title: `Interactive ${topic} Playground`,
                    description: `Hands-on practice environment for ${topic} with real-time feedback`,
                    url: `https://playground.example.com/${topic.toLowerCase()}`,
                    platform: 'Code Playground',
                    type: 'interactive',
                    difficulty: 'beginner',
                    estimatedTime: '30 minutes'
                }
            ],
            difficulty: 'intermediate',
            estimatedTime: '2 hours',
            topic,
            totalFound: 2
        };
    }
}

module.exports = { LearningResourceAgent };