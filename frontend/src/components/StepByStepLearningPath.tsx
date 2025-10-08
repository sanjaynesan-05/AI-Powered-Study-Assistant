import React, { useState } from 'react';
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  Code, 
  CheckCircle, 
  ExternalLink, 
  ChevronRight,
  Award,
  Target,
  Zap,
  Youtube
} from 'lucide-react';
import { 
  EnhancedLearningPath, 
  EnhancedLearningStep
} from '../services/enhancedLearningPathService';

interface StepByStepLearningPathProps {
  learningPath: EnhancedLearningPath;
  onStepComplete?: (stepId: string) => void;
  completedSteps?: string[];
}

const StepByStepLearningPath: React.FC<StepByStepLearningPathProps> = ({
  learningPath,
  onStepComplete,
  completedSteps = []
}) => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [activeTimestamp, setActiveTimestamp] = useState<string | null>(null);

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Learning Path Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{learningPath.title}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="text-lg">{learningPath.totalDuration}</span>
            </div>
            <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
              {learningPath.difficulty}
            </div>
          </div>
        </div>
        <p className="text-xl opacity-90 mb-6">{learningPath.description}</p>
        
        {/* Skills & Applications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Skills You'll Learn
            </h3>
            <ul className="text-sm opacity-90 space-y-1">
              {learningPath.skillsYouWillLearn.slice(0, 3).map((skill, index) => (
                <li key={index} className="flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Prerequisites
            </h3>
            <ul className="text-sm opacity-90 space-y-1">
              {learningPath.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Career Applications
            </h3>
            <ul className="text-sm opacity-90 space-y-1">
              {learningPath.careerApplications.slice(0, 3).map((career, index) => (
                <li key={index} className="flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  {career}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Learning Steps */}
      <div className="space-y-6">
        {learningPath.learningSteps.map((step, index) => (
          <LearningStepCard
            key={step.id}
            step={step}
            stepNumber={index + 1}
            isCompleted={isStepCompleted(step.id)}
            isActive={activeStep === step.id}
            onToggle={() => setActiveStep(activeStep === step.id ? null : step.id)}
            onComplete={() => onStepComplete?.(step.id)}
            activeTimestamp={activeTimestamp}
            onTimestampClick={setActiveTimestamp}
          />
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg">
            {completedSteps.length} of {learningPath.learningSteps.length} steps completed
          </span>
          <span className="text-lg font-semibold text-green-600">
            {Math.round((completedSteps.length / learningPath.learningSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / learningPath.learningSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface LearningStepCardProps {
  step: EnhancedLearningStep;
  stepNumber: number;
  isCompleted: boolean;
  isActive: boolean;
  onToggle: () => void;
  onComplete: () => void;
  activeTimestamp: string | null;
  onTimestampClick: (timestamp: string | null) => void;
}

const LearningStepCard: React.FC<LearningStepCardProps> = ({
  step,
  stepNumber,
  isCompleted,
  isActive,
  onToggle,
  onComplete,
  activeTimestamp,
  onTimestampClick
}) => {
  const formatTimestamp = (timestamp: string) => {
    const parts = timestamp.split(':');
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1].padStart(2, '0')}`;
    }
    return timestamp;
  };

  const getYouTubeUrlWithTimestamp = (videoUrl: string, timestamp: string) => {
    const timeInSeconds = convertTimestampToSeconds(timestamp);
    return `${videoUrl}&t=${timeInSeconds}s`;
  };

  const convertTimestampToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  };

  return (
    <div className={`border rounded-2xl transition-all duration-300 ${
      isCompleted 
        ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      {/* Step Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
              isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
            }`}>
              {isCompleted ? <CheckCircle className="w-6 h-6" /> : stepNumber}
            </div>
            <div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {step.estimatedTime}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Target className="w-4 h-4 mr-1" />
                  {step.difficulty}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className={`w-6 h-6 transition-transform ${isActive ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Expanded Content */}
      {isActive && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Learning Objectives */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Learning Objectives
            </h4>
            <ul className="space-y-2">
              {step.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Video Tutorial with Timestamps */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-4 flex items-center">
              <Youtube className="w-5 h-5 mr-2 text-red-500" />
              Video Tutorial with Timestamps
            </h4>
            
            {/* Main Video */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{step.primaryVideo.title}</h5>
                <a
                  href={step.primaryVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Watch Full Video</span>
                </a>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                by {step.primaryVideo.channelTitle}
              </p>
            </div>

            {/* Timestamps */}
            <div className="space-y-2">
              {step.videoTimestamps.map((timestamp, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    activeTimestamp === timestamp.startTime
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => onTimestampClick(
                    activeTimestamp === timestamp.startTime ? null : timestamp.startTime
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <PlayCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-sm">
                        {formatTimestamp(timestamp.startTime)} - {formatTimestamp(timestamp.endTime)}
                      </span>
                      <span className="font-semibold">{timestamp.title}</span>
                    </div>
                    <a
                      href={getYouTubeUrlWithTimestamp(step.primaryVideo.videoUrl, timestamp.startTime)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {timestamp.description}
                  </p>
                  
                  {activeTimestamp === timestamp.startTime && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded">
                      <h6 className="font-medium mb-2">Key Points:</h6>
                      <ul className="space-y-1">
                        {timestamp.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start text-sm">
                            <Zap className="w-3 h-3 mr-2 mt-1 text-yellow-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practice Exercises */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-purple-500" />
              Practice Exercises
            </h4>
            <div className="space-y-4">
              {step.practiceExercises.map((exercise) => (
                <div key={exercise.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{exercise.title}</h5>
                    <span className={`px-2 py-1 rounded text-xs ${
                      exercise.difficulty === 'Easy' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : exercise.difficulty === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{exercise.description}</p>
                  {exercise.geeksForGeeksLink && (
                    <a
                      href={exercise.geeksForGeeksLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 hover:text-green-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Practice on GeeksforGeeks
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-500" />
              Code Examples
            </h4>
            <div className="space-y-4">
              {step.codeExamples.map((example) => (
                <div key={example.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h5 className="font-medium">{example.title}</h5>
                  </div>
                  <div className="p-4">
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                    <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{example.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Quiz */}
          <div className="p-6">
            <h4 className="font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-orange-500" />
              Quick Knowledge Check
            </h4>
            <div className="space-y-4">
              {step.quickQuiz.map((question, index) => (
                <QuizQuestion key={question.id} question={question} questionIndex={index} />
              ))}
            </div>
            
            {/* Complete Step Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onComplete}
                disabled={isCompleted}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2 inline" />
                    Step Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface QuizQuestionProps {
  question: any;
  questionIndex: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, questionIndex }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h5 className="font-medium mb-3">
        Question {questionIndex + 1}: {question.question}
      </h5>
      <div className="space-y-2 mb-3">
        {question.options.map((option: string, optionIndex: number) => (
          <button
            key={optionIndex}
            onClick={() => handleAnswerSelect(optionIndex)}
            disabled={showExplanation}
            className={`w-full text-left p-3 rounded border transition-colors ${
              selectedAnswer === optionIndex
                ? isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : showExplanation && optionIndex === question.correctAnswer
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {showExplanation && (
        <div className={`p-3 rounded ${
          isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          <div className="flex items-center mb-2">
            <CheckCircle className={`w-4 h-4 mr-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
            <span className="font-medium">
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default StepByStepLearningPath;