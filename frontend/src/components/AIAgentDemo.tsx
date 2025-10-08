import React, { useState } from 'react';
import { useAIAgent } from '../contexts/AIAgentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Brain, BookOpen, Target, Heart, Zap, Settings } from 'lucide-react';

const AIAgentDemo: React.FC = () => {
  const {
    isGenerating,
    currentJourney,
    learningPaths,
    assessments,
    recommendations,
    wellnessInsights,
    motivationalSupport,
    learningResources,
    orchestratorStatus,
    error,
    generateCompleteJourney,
    getSmartResources,
    generateAdaptiveAssessment,
    performWellnessCheck,
    getMotivationBoost,
    checkOrchestratorStatus,
    clearError
  } = useAIAgent();

  const [targetSkill, setTargetSkill] = useState('');
  const [resourceTopic, setResourceTopic] = useState('');
  const [assessmentSkill, setAssessmentSkill] = useState('');

  const handleGenerateJourney = async () => {
    if (!targetSkill.trim()) return;
    
    try {
      await generateCompleteJourney(targetSkill, {
        experience_level: 'beginner',
        learning_style: 'visual',
        time_availability: '2-3 hours/day'
      });
    } catch (err) {
      console.error('Journey generation failed:', err);
    }
  };

  const handleGetResources = async () => {
    if (!resourceTopic.trim()) return;
    
    try {
      await getSmartResources(resourceTopic, 'intermediate');
    } catch (err) {
      console.error('Resource fetching failed:', err);
    }
  };

  const handleGenerateAssessment = async () => {
    if (!assessmentSkill.trim()) return;
    
    try {
      await generateAdaptiveAssessment(assessmentSkill, 'intermediate', 5);
    } catch (err) {
      console.error('Assessment generation failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          AI Agent System Demo
        </h1>
        <p className="text-xl text-gray-600">
          Experience the power of coordinated AI agents for personalized learning
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complete Journey Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Complete Learning Journey
            </CardTitle>
            <CardDescription>
              Generate an AI-orchestrated learning journey with all agents working together
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter skill to learn (e.g., React.js, Python, Machine Learning)"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
            />
            <Button 
              onClick={handleGenerateJourney}
              disabled={isGenerating || !targetSkill.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Orchestrating Agents...
                </>
              ) : (
                'Generate Complete Journey'
              )}
            </Button>
            
            {currentJourney && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Journey Generated!</h4>
                <p className="text-sm text-purple-700 mb-2">
                  {currentJourney.orchestrated_response?.ai_summary || 'AI-powered learning journey created successfully!'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentJourney.learningPath && (
                    <Badge variant="secondary">Learning Path Created</Badge>
                  )}
                  {currentJourney.assessment && (
                    <Badge variant="secondary">Assessment Ready</Badge>
                  )}
                  {currentJourney.recommendations && (
                    <Badge variant="secondary">Recommendations Generated</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Smart Learning Resources
            </CardTitle>
            <CardDescription>
              Get AI-curated learning resources from multiple sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter topic for resources (e.g., JavaScript Async/Await)"
              value={resourceTopic}
              onChange={(e) => setResourceTopic(e.target.value)}
            />
            <Button 
              onClick={handleGetResources}
              disabled={isGenerating || !resourceTopic.trim()}
              className="w-full"
              variant="outline"
            >
              Get Smart Resources
            </Button>
            
            {learningResources && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Resources Found!</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Smart learning resources generated successfully!
                </p>
                <div className="space-y-2">
                  {(learningResources as any).videos && (learningResources as any).videos.length > 0 && (
                    <Badge variant="secondary">{(learningResources as any).videos.length} Videos</Badge>
                  )}
                  {(learningResources as any).articles && (learningResources as any).articles.length > 0 && (
                    <Badge variant="secondary">{(learningResources as any).articles.length} Articles</Badge>
                  )}
                  {(learningResources as any).exercises && (learningResources as any).exercises.length > 0 && (
                    <Badge variant="secondary">{(learningResources as any).exercises.length} Exercises</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adaptive Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Adaptive Assessment
            </CardTitle>
            <CardDescription>
              Generate personalized assessments that adapt to your skill level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter skill for assessment (e.g., Python Basics)"
              value={assessmentSkill}
              onChange={(e) => setAssessmentSkill(e.target.value)}
            />
            <Button 
              onClick={handleGenerateAssessment}
              disabled={isGenerating || !assessmentSkill.trim()}
              className="w-full"
              variant="outline"
            >
              Generate Assessment
            </Button>
            
            {assessments.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Assessment Ready!</h4>
                <p className="text-sm text-green-700 mb-2">
                  Latest assessment: {(assessments[assessments.length - 1] as any).topic || 'AI-Generated Assessment'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {assessments[assessments.length - 1].questions?.length || 0} Questions
                  </Badge>
                  <Badge variant="secondary">
                    {assessments[assessments.length - 1].difficulty || 'Adaptive'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wellness Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Wellness & Balance
            </CardTitle>
            <CardDescription>
              Monitor your learning wellness and get balance recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={performWellnessCheck}
              disabled={isGenerating}
              className="w-full"
              variant="outline"
            >
              Perform Wellness Check
            </Button>
            
            {wellnessInsights && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Wellness Insights</h4>
                <p className="text-sm text-red-700 mb-2">
                  {(wellnessInsights as any).summary || 'Wellness check completed successfully!'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Stress Level: {(wellnessInsights as any).stress_level || 'Normal'}
                  </Badge>
                  <Badge variant="secondary">
                    Energy: {(wellnessInsights as any).energy_level || 'Good'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Motivation Boost */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Motivation Boost
            </CardTitle>
            <CardDescription>
              Get personalized motivation and encouragement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => getMotivationBoost({ context: 'demo' })}
              disabled={isGenerating}
              className="w-full"
              variant="outline"
            >
              Get Motivation Boost
            </Button>
            
            {motivationalSupport && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Motivation Message</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  {(motivationalSupport as any).message || 'Motivational support generated successfully!'}
                </p>
                {(motivationalSupport as any).tips && (
                  <div className="flex flex-wrap gap-2">
                    {(motivationalSupport as any).tips.slice(0, 2).map((tip: string, index: number) => (
                      <Badge key={index} variant="secondary">{tip}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Agent System Status
            </CardTitle>
            <CardDescription>
              Monitor the health and status of AI agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={checkOrchestratorStatus}
              disabled={isGenerating}
              className="w-full"
              variant="outline"
            >
              Check System Status
            </Button>
            
            {orchestratorStatus && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">System Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={orchestratorStatus.status === 'healthy' ? 'default' : 'destructive'}>
                    {orchestratorStatus.status || 'Unknown'}
                  </Badge>
                  <Badge variant="secondary">
                    {orchestratorStatus.active_agents || 0} Agents Active
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Current Session Summary</CardTitle>
          <CardDescription>
            Overview of your AI agent interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {learningPaths.length}
              </div>
              <div className="text-sm text-gray-600">Learning Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {assessments.length}
              </div>
              <div className="text-sm text-gray-600">Assessments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.length}
              </div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentJourney ? 1 : 0}
              </div>
              <div className="text-sm text-gray-600">Active Journey</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentDemo;