import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Recommendation } from '../types';

export interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface TestResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  completedAt: Date;
}

interface JobEligibilityTestProps {
  job: Recommendation;
  onClose: () => void;
  onComplete: (result: TestResult) => void;
  isOpen: boolean;
}

export const JobEligibilityTest: React.FC<JobEligibilityTestProps> = ({
  job,
  onClose,
  onComplete,
  isOpen
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Load previous test result from local storage if exists
  useEffect(() => {
    const savedResults = localStorage.getItem('jobTestResults');
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      if (parsedResults[job.id]) {
        setTestResult(parsedResults[job.id]);
        setTestCompleted(true);
      }
    }
  }, [job.id, isOpen]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = useCallback(() => {
    // Calculate results
    let correctAnswers = 0;
    
    questions.forEach(question => {
      const selectedOptionId = selectedAnswers[question.id];
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      
      if (selectedOption?.isCorrect) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 60; // 60% is the passing score
    
    const result: TestResult = {
      score,
      passed,
      totalQuestions: questions.length,
      completedAt: new Date()
    };
    
    setTestResult(result);
    setTestCompleted(true);
    
    // Exit fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    onComplete(result);
  }, [questions, selectedAnswers, onComplete]);

  // Generate questions based on the job role
  useEffect(() => {
    if (!job) return;
    
    // Here we're generating mock questions based on job skills
    // In a real app, you would fetch questions from an API
    const generatedQuestions = generateQuestionsForJob(job);
    setQuestions(generatedQuestions);
  }, [job]);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      if (!document.fullscreenElement && isOpen && !testCompleted) {
        setWarningCount(prev => prev + 1);
        if (warningCount >= 2) {
          // Auto-quit the test after 3 warnings
          handleSubmitTest();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isOpen, testCompleted, warningCount, handleSubmitTest]);

  // Enter fullscreen mode when the test starts
  useEffect(() => {
    if (isOpen && !isFullscreen && !testCompleted) {
      const enterFullscreen = async () => {
        try {
          await document.documentElement.requestFullscreen();
        } catch (error) {
          console.error('Could not enter fullscreen mode:', error);
        }
      };
      enterFullscreen();
    }
  }, [isOpen, isFullscreen, testCompleted]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, testCompleted, handleSubmitTest]);

  // Detect tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isOpen && !testCompleted) {
        setWarningCount(prev => prev + 1);
        if (warningCount >= 2) {
          // Auto-quit the test after 3 warnings
          handleSubmitTest();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, testCompleted, warningCount, handleSubmitTest]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If no questions are loaded yet
  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl">
          <p className="text-center">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Show results if the test is completed
  if (testCompleted && testResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Results</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
              <X size={24} />
            </button>
          </div>

          <div className="text-center mb-8">
            {testResult.passed ? (
              <div className="mb-6 flex flex-col items-center">
                <CheckCircle size={80} className="text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-600">Congratulations!</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  You passed the eligibility test for this position.
                </p>
              </div>
            ) : (
              <div className="mb-6 flex flex-col items-center">
                <AlertCircle size={80} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-red-600">Not Eligible</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Unfortunately, you didn't meet the minimum score required for this position.
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                  You can retry after 24 hours.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Your Score</span>
              <span className="font-bold text-gray-900 dark:text-white">{testResult.score.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${testResult.passed ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: `${testResult.score}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Passing score: 60%
            </p>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                      text-gray-800 dark:text-white rounded-lg transition-colors"
            >
              Close
            </button>
            {testResult.passed && (
              <button
                onClick={() => window.open(job.url, '_blank')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white 
                        rounded-lg transition-colors"
              >
                Continue to Application
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Eligibility Test: {job.title} at {job.company}
          </h2>
          
          {warningCount > 0 && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center">
              <AlertCircle size={18} className="mr-2" />
              <span className="text-sm">Warning: {warningCount}/3</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
            <Clock size={18} className="mr-2" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {currentQuestion.text}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map(option => (
              <div 
                key={option.id}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedAnswers[currentQuestion.id] === option.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0
                    ${selectedAnswers[currentQuestion.id] === option.id
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-500'
                    }`}
                  >
                    {selectedAnswers[currentQuestion.id] === option.id && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">{option.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg transition-colors
              ${currentQuestionIndex === 0
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
              }`}
          >
            Previous
          </button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmitTest}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Submit Test
            </button>
          )}
        </div>

        {/* Warning about tab switching */}
        <div className="mt-6 text-center text-sm text-red-500">
          <p>Warning: Exiting fullscreen mode or switching tabs will count as a warning.</p>
          <p>Three warnings will automatically end the test.</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate questions based on job role
const generateQuestionsForJob = (job: Recommendation): Question[] => {
  // In a real application, these questions should come from an API or database
  // based on the specific job requirements
  const frontendQuestions: Question[] = [
    {
      id: 'fe1',
      text: 'What does CSS stand for?',
      options: [
        { id: 'fe1-a', text: 'Computer Style Sheets', isCorrect: false },
        { id: 'fe1-b', text: 'Cascading Style Sheets', isCorrect: true },
        { id: 'fe1-c', text: 'Creative Style Sheets', isCorrect: false },
        { id: 'fe1-d', text: 'Colorful Style Sheets', isCorrect: false }
      ]
    },
    {
      id: 'fe2',
      text: 'Which of the following is NOT a JavaScript framework or library?',
      options: [
        { id: 'fe2-a', text: 'React', isCorrect: false },
        { id: 'fe2-b', text: 'Angular', isCorrect: false },
        { id: 'fe2-c', text: 'Django', isCorrect: true },
        { id: 'fe2-d', text: 'Vue', isCorrect: false }
      ]
    },
    {
      id: 'fe3',
      text: 'What is the purpose of useEffect hook in React?',
      options: [
        { id: 'fe3-a', text: 'To handle side effects in function components', isCorrect: true },
        { id: 'fe3-b', text: 'To create global state', isCorrect: false },
        { id: 'fe3-c', text: 'To replace Redux', isCorrect: false },
        { id: 'fe3-d', text: 'To optimize component rendering', isCorrect: false }
      ]
    },
    {
      id: 'fe4',
      text: 'What is the correct way to comment in JSX?',
      options: [
        { id: 'fe4-a', text: '// This is a comment', isCorrect: false },
        { id: 'fe4-b', text: '/* This is a comment */', isCorrect: false },
        { id: 'fe4-c', text: '<!-- This is a comment -->', isCorrect: false },
        { id: 'fe4-d', text: '{/* This is a comment */}', isCorrect: true }
      ]
    },
    {
      id: 'fe5',
      text: 'Which CSS property is used to make text bold?',
      options: [
        { id: 'fe5-a', text: 'font-weight', isCorrect: true },
        { id: 'fe5-b', text: 'text-style', isCorrect: false },
        { id: 'fe5-c', text: 'font-style', isCorrect: false },
        { id: 'fe5-d', text: 'text-weight', isCorrect: false }
      ]
    },
    {
      id: 'fe6',
      text: 'What does the "async" keyword do in JavaScript?',
      options: [
        { id: 'fe6-a', text: 'Makes a function run in a separate thread', isCorrect: false },
        { id: 'fe6-b', text: 'Allows use of the await keyword to handle promises', isCorrect: true },
        { id: 'fe6-c', text: 'Automatically caches function results', isCorrect: false },
        { id: 'fe6-d', text: 'Makes the function execute immediately', isCorrect: false }
      ]
    },
    {
      id: 'fe7',
      text: 'Which HTML tag is used to create a hyperlink?',
      options: [
        { id: 'fe7-a', text: '<link>', isCorrect: false },
        { id: 'fe7-b', text: '<a>', isCorrect: true },
        { id: 'fe7-c', text: '<href>', isCorrect: false },
        { id: 'fe7-d', text: '<url>', isCorrect: false }
      ]
    },
    {
      id: 'fe8',
      text: 'What is Redux used for?',
      options: [
        { id: 'fe8-a', text: 'Server-side rendering', isCorrect: false },
        { id: 'fe8-b', text: 'State management', isCorrect: true },
        { id: 'fe8-c', text: 'Form validation', isCorrect: false },
        { id: 'fe8-d', text: 'Animation effects', isCorrect: false }
      ]
    },
    {
      id: 'fe9',
      text: 'Which CSS property controls the space between elements?',
      options: [
        { id: 'fe9-a', text: 'spacing', isCorrect: false },
        { id: 'fe9-b', text: 'margin', isCorrect: true },
        { id: 'fe9-c', text: 'whitespace', isCorrect: false },
        { id: 'fe9-d', text: 'gap', isCorrect: false }
      ]
    },
    {
      id: 'fe10',
      text: 'What tool would you use to bundle JavaScript files for production?',
      options: [
        { id: 'fe10-a', text: 'Node.js', isCorrect: false },
        { id: 'fe10-b', text: 'Express', isCorrect: false },
        { id: 'fe10-c', text: 'Webpack', isCorrect: true },
        { id: 'fe10-d', text: 'JSON', isCorrect: false }
      ]
    }
  ];
  
  const backendQuestions: Question[] = [
    {
      id: 'be1',
      text: 'What is the purpose of middleware in Express.js?',
      options: [
        { id: 'be1-a', text: 'To connect to databases', isCorrect: false },
        { id: 'be1-b', text: 'To process requests before they reach routes', isCorrect: true },
        { id: 'be1-c', text: 'To create user interfaces', isCorrect: false },
        { id: 'be1-d', text: 'To optimize server performance', isCorrect: false }
      ]
    },
    {
      id: 'be2',
      text: 'Which of the following is NOT a NoSQL database?',
      options: [
        { id: 'be2-a', text: 'MongoDB', isCorrect: false },
        { id: 'be2-b', text: 'Cassandra', isCorrect: false },
        { id: 'be2-c', text: 'PostgreSQL', isCorrect: true },
        { id: 'be2-d', text: 'Redis', isCorrect: false }
      ]
    },
    {
      id: 'be3',
      text: 'What does REST stand for in the context of API development?',
      options: [
        { id: 'be3-a', text: 'React Entity State Transfer', isCorrect: false },
        { id: 'be3-b', text: 'Representational State Transfer', isCorrect: true },
        { id: 'be3-c', text: 'Reactive Element State Technology', isCorrect: false },
        { id: 'be3-d', text: 'Remote Endpoint Service Technology', isCorrect: false }
      ]
    },
    {
      id: 'be4',
      text: 'What is the purpose of JWT (JSON Web Tokens)?',
      options: [
        { id: 'be4-a', text: 'For styling web pages', isCorrect: false },
        { id: 'be4-b', text: 'For secure transmission of information', isCorrect: true },
        { id: 'be4-c', text: 'For connecting to databases', isCorrect: false },
        { id: 'be4-d', text: 'For building user interfaces', isCorrect: false }
      ]
    },
    {
      id: 'be5',
      text: 'What command would you use to create a new package.json file?',
      options: [
        { id: 'be5-a', text: 'node init', isCorrect: false },
        { id: 'be5-b', text: 'npm init', isCorrect: true },
        { id: 'be5-c', text: 'node create', isCorrect: false },
        { id: 'be5-d', text: 'npm build', isCorrect: false }
      ]
    },
    {
      id: 'be6',
      text: 'What does the HTTP status code 404 indicate?',
      options: [
        { id: 'be6-a', text: 'Server error', isCorrect: false },
        { id: 'be6-b', text: 'Resource not found', isCorrect: true },
        { id: 'be6-c', text: 'Unauthorized', isCorrect: false },
        { id: 'be6-d', text: 'Success', isCorrect: false }
      ]
    },
    {
      id: 'be7',
      text: 'Which of these is NOT a common HTTP method?',
      options: [
        { id: 'be7-a', text: 'GET', isCorrect: false },
        { id: 'be7-b', text: 'POST', isCorrect: false },
        { id: 'be7-c', text: 'SEND', isCorrect: true },
        { id: 'be7-d', text: 'DELETE', isCorrect: false }
      ]
    },
    {
      id: 'be8',
      text: 'What is an ORM?',
      options: [
        { id: 'be8-a', text: 'Object-Relational Mapping', isCorrect: true },
        { id: 'be8-b', text: 'Online Resource Management', isCorrect: false },
        { id: 'be8-c', text: 'Output Rendering Module', isCorrect: false },
        { id: 'be8-d', text: 'Operational Response Model', isCorrect: false }
      ]
    },
    {
      id: 'be9',
      text: 'Which of these is a benefit of using environment variables?',
      options: [
        { id: 'be9-a', text: 'They make code run faster', isCorrect: false },
        { id: 'be9-b', text: 'They keep sensitive information out of code', isCorrect: true },
        { id: 'be9-c', text: 'They automatically optimize database queries', isCorrect: false },
        { id: 'be9-d', text: 'They reduce the size of the application', isCorrect: false }
      ]
    },
    {
      id: 'be10',
      text: 'What is the purpose of websockets?',
      options: [
        { id: 'be10-a', text: 'To create static websites', isCorrect: false },
        { id: 'be10-b', text: 'To enable real-time bidirectional communication', isCorrect: true },
        { id: 'be10-c', text: 'To replace HTTP entirely', isCorrect: false },
        { id: 'be10-d', text: 'To improve database performance', isCorrect: false }
      ]
    }
  ];
  
  const fullstackQuestions: Question[] = [
    ...frontendQuestions.slice(0, 5),
    ...backendQuestions.slice(0, 5)
  ];
  
  // Select questions based on job title
  if (job.title.toLowerCase().includes('frontend')) {
    return frontendQuestions;
  } else if (job.title.toLowerCase().includes('backend')) {
    return backendQuestions;
  } else if (job.title.toLowerCase().includes('full')) {
    return fullstackQuestions;
  }
  
  // Default to a mix of questions if job role is unclear
  return [
    ...frontendQuestions.slice(0, 3),
    ...backendQuestions.slice(0, 4),
    ...frontendQuestions.slice(5, 8)
  ];
};
