import React, { useState, useEffect, useCallback } from 'react';
import { Recommendation } from '../types';
import { ExternalLink, AlertCircle, CheckCircle, X, Maximize, MessageCircle } from 'lucide-react';

export interface TestResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  completedAt: Date;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface JobEligibilityTestProps {
  job: Recommendation;
  onClose: () => void;
  onComplete: (result: TestResult) => void;
  isOpen: boolean;
}

// Full implementation of the job eligibility test component
export const JobEligibilityTest: React.FC<JobEligibilityTestProps> = ({
  job,
  onClose,
  onComplete,
  isOpen
}) => {
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(10).fill(-1));
  const [testStarted, setTestStarted] = useState(false);
  const [testFailed, setTestFailed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  
  // Fail the test due to violation (exiting fullscreen or switching tabs)
  const failTest = useCallback((reason: string) => {
    const result: TestResult = {
      score: 0,
      passed: false,
      totalQuestions: 10,
      completedAt: new Date()
    };
    
    setTestFailed(true);
    setTestResult(result);
    setShowResults(true);
    onComplete(result);
    
    // Exit fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
    }
    
    // Show reason for test failure
    alert(`Test failed: ${reason}`);
  }, [onComplete]);

  // Complete the test and calculate score
  const completeTest = useCallback(() => {
    // For simulation purposes, we'll calculate a random score
    const score = Math.floor(Math.random() * 41) + 60; // Random score between 60-100
    const passed = score >= 60; // Pass mark is 60%
    
    const result: TestResult = {
      score,
      passed,
      totalQuestions: 10,
      completedAt: new Date()
    };
    
    setTestResult(result);
    setShowResults(true);
    onComplete(result);
    
    // Exit fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
    }
  }, [onComplete]);

  // Generate questions based on job title and skills
  const generateQuestions = useCallback(() => {
    // In a real app, these would be fetched from the server based on the job
    // Here we'll generate some mock questions related to the job role
    const jobType = job.title.toLowerCase();
    
    const frontendQuestions = [
      {
        id: 1,
        text: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "Which of the following is not a JavaScript framework?",
        options: ["React", "Vue", "Angular", "Flask"],
        correctAnswer: 3
      },
      {
        id: 3,
        text: "What is the purpose of the 'useState' hook in React?",
        options: ["To fetch data from an API", "To manage component state", "To create CSS styles", "To handle routing"],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "Which property is used to change the text color in CSS?",
        options: ["text-color", "font-color", "color", "foreground-color"],
        correctAnswer: 2
      },
      {
        id: 5,
        text: "What does the 'async' keyword do in JavaScript?",
        options: ["Makes a function run faster", "Makes a function return a Promise", "Stops a function from executing", "Runs a function in a new thread"],
        correctAnswer: 1
      },
      {
        id: 6,
        text: "Which CSS property is used to add space between elements?",
        options: ["spacing", "margin", "padding", "gap"],
        correctAnswer: 1
      },
      {
        id: 7,
        text: "What is the purpose of the 'key' prop in React lists?",
        options: ["To encrypt data", "For styling list items", "To help React identify which items have changed", "To specify the list order"],
        correctAnswer: 2
      },
      {
        id: 8,
        text: "Which method is used to add an element at the end of an array in JavaScript?",
        options: ["push()", "append()", "add()", "insert()"],
        correctAnswer: 0
      },
      {
        id: 9,
        text: "What is the purpose of media queries in CSS?",
        options: ["To play videos", "To make websites responsive", "To query a database", "To load images faster"],
        correctAnswer: 1
      },
      {
        id: 10,
        text: "Which of the following is true about TypeScript?",
        options: ["It's a styling language", "It's a database query language", "It's a superset of JavaScript with static typing", "It's a server-side framework"],
        correctAnswer: 2
      }
    ];
    
    const backendQuestions = [
      {
        id: 1,
        text: "What is Node.js?",
        options: ["A database system", "A JavaScript runtime environment", "A frontend framework", "A testing library"],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "What does REST stand for in RESTful API?",
        options: ["Remote Entity State Transfer", "Representational State Transfer", "Reactive State Transfer", "Request Entity Service Technology"],
        correctAnswer: 1
      },
      {
        id: 3,
        text: "Which of the following is not a NoSQL database?",
        options: ["MongoDB", "Cassandra", "PostgreSQL", "Redis"],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "What is middleware in Express.js?",
        options: ["A database connector", "Functions that have access to the request and response objects", "A frontend component", "A testing framework"],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "Which HTTP status code indicates a successful response?",
        options: ["200", "404", "500", "301"],
        correctAnswer: 0
      },
      {
        id: 6,
        text: "What does ORM stand for?",
        options: ["Object Relational Mapping", "Online Resource Management", "Operational Risk Management", "Object Registry Model"],
        correctAnswer: 0
      },
      {
        id: 7,
        text: "Which of the following is not a method to handle asynchronous operations in JavaScript?",
        options: ["Callbacks", "Promises", "Async/Await", "For loops"],
        correctAnswer: 3
      },
      {
        id: 8,
        text: "What is the purpose of environment variables in backend development?",
        options: ["To store sensitive information", "To control server temperature", "To manage frontend UI", "To document code"],
        correctAnswer: 0
      },
      {
        id: 9,
        text: "Which of the following is not a common authentication method?",
        options: ["JWT", "OAuth", "Session-based", "CSS-Auth"],
        correctAnswer: 3
      },
      {
        id: 10,
        text: "What is the purpose of database indexing?",
        options: ["To encrypt data", "To improve search performance", "To create backups", "To format data"],
        correctAnswer: 1
      }
    ];
    
    const fullstackQuestions = [
      {
        id: 1,
        text: "What architecture pattern separates an application into three interconnected parts?",
        options: ["SOLID", "MVC", "REST", "CRUD"],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "Which of the following is not a common full-stack development tool?",
        options: ["Git", "Docker", "Photoshop", "VS Code"],
        correctAnswer: 2
      },
      {
        id: 3,
        text: "What is GraphQL?",
        options: ["A database system", "A query language for APIs", "A charting library", "A CSS framework"],
        correctAnswer: 1
      },
      {
        id: 4,
        text: "Which deployment model allows you to pay only for what you use?",
        options: ["On-premise", "Serverless", "VPS", "Dedicated hosting"],
        correctAnswer: 1
      },
      {
        id: 5,
        text: "What does CI/CD stand for?",
        options: ["Continuous Integration/Continuous Deployment", "Code Interface/Code Design", "Computer Interaction/Computer Design", "Client Interface/Client Development"],
        correctAnswer: 0
      },
      {
        id: 6,
        text: "Which of the following is not a common database relationship type?",
        options: ["One-to-One", "One-to-Many", "Many-to-Many", "All-to-None"],
        correctAnswer: 3
      },
      {
        id: 7,
        text: "What is WebSockets used for?",
        options: ["Static file serving", "Database queries", "Real-time communication", "Authentication"],
        correctAnswer: 2
      },
      {
        id: 8,
        text: "Which of the following is not a common state management solution?",
        options: ["Redux", "Context API", "MobX", "XAMPP"],
        correctAnswer: 3
      },
      {
        id: 9,
        text: "What is the purpose of a load balancer?",
        options: ["To optimize database queries", "To distribute network traffic across multiple servers", "To cache static assets", "To compile code"],
        correctAnswer: 1
      },
      {
        id: 10,
        text: "Which of the following best describes microservices architecture?",
        options: ["A monolithic application with multiple features", "A style that structures an application as a collection of small autonomous services", "A single service handling all application features", "A database design pattern"],
        correctAnswer: 1
      }
    ];
    
    // Select questions based on job title
    if (jobType.includes('frontend')) {
      return frontendQuestions;
    } else if (jobType.includes('backend')) {
      return backendQuestions;
    } else if (jobType.includes('full') || jobType.includes('stack')) {
      return fullstackQuestions;
    } else {
      // Default to a mix of questions
      return [...frontendQuestions.slice(0, 4), ...backendQuestions.slice(0, 3), ...fullstackQuestions.slice(0, 3)];
    }
  }, [job.title]);

  const questions = React.useMemo(() => generateQuestions(), [generateQuestions]);
  
  // Load previous test result from local storage if exists
  useEffect(() => {
    const savedResults = localStorage.getItem('jobTestResults');
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      if (parsedResults[job.id]) {
        setTestResult(parsedResults[job.id]);
        setShowResults(true);
      } else {
        // Reset test state if no previous results for this job
        setTestResult(null);
        setShowResults(false);
      }
    }
  }, [job.id, isOpen]);
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // If test has started and user exits fullscreen, fail the test
      if (testStarted && !document.fullscreenElement && !testFailed && !showResults) {
        failTest("You exited fullscreen mode during the test.");
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [testStarted, testFailed, showResults]);
  
  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (testStarted && document.visibilityState === 'hidden' && !testFailed && !showResults) {
        failTest("You switched tabs or minimized the browser during the test.");
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testStarted, testFailed, showResults]);
  
  // Timer for the test
  useEffect(() => {
    let timer: number | null = null;
    
    if (testStarted && !showResults && !testFailed && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timer) window.clearInterval(timer);
            completeTest(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [testStarted, showResults, testFailed, timeRemaining, completeTest]);
  
  if (!isOpen) return null;
  
  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Start the test in fullscreen mode
  const startTest = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers(Array(questions.length).fill(-1));
      setTimeRemaining(600); // Reset timer to 10 minutes
    } catch (err) {
      alert('Error entering fullscreen mode. Please make sure your browser supports fullscreen and you have granted permission.');
    }
  };
  
  // Handle selecting an answer
  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = optionIndex;
      return newAnswers;
    });
  };
  
  // Navigate to the next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  // Navigate to the previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Complete the test and calculate score
  const completeTest = () => {
    // Calculate score based on correct answers
    const correctCount = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
    
    const score = (correctCount / questions.length) * 100;
    const passed = score >= 60; // Pass mark is 60%
    
    const result: TestResult = {
      score,
      passed,
      totalQuestions: questions.length,
      completedAt: new Date()
    };
    
    setTestResult(result);
    setShowResults(true);
    onComplete(result);
    
    // Exit fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
    }
  };
  
  // Fail the test due to violation (exiting fullscreen or switching tabs)
  const failTest = (reason: string) => {
    const result: TestResult = {
      score: 0,
      passed: false,
      totalQuestions: questions.length,
      completedAt: new Date()
    };
    
    setTestFailed(true);
    setTestResult(result);
    setShowResults(true);
    onComplete(result);
    
    // Exit fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
    }
    
    // Show reason for test failure
    alert(`Test failed: ${reason}`);
  };
  
  // Show results if the test is completed
  if (showResults && testResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="w-full max-w-2xl p-8 bg-white dark:bg-gray-800 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Results</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
              <X size={24} />
            </button>
          </div>

          <div className="mb-8 text-center">
            {testResult.passed ? (
              <div className="flex flex-col items-center mb-6">
                <CheckCircle size={80} className="mb-4 text-green-500" />
                <h3 className="text-2xl font-bold text-green-600">Congratulations!</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  You passed the eligibility test for this position.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-6">
                <AlertCircle size={80} className="mb-4 text-red-500" />
                <h3 className="text-2xl font-bold text-red-600">Not Eligible</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Unfortunately, you didn't meet the minimum score required for this position.
                </p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  You can retry after 24 hours.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
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
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Passing score: 60%
            </p>
          </div>

          <div className="flex justify-between">
            <div>
              <button 
                onClick={onClose} 
                className="px-6 py-3 text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowResults(false);
                  setTestResult(null);
                  setTestFailed(false);
                }} 
                className="px-6 py-3 ml-3 text-gray-800 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              >
                Retake Test
              </button>
            </div>
            {testResult.passed && (
              <button
                onClick={() => window.open(job.url, '_blank')}
                className="flex items-center px-6 py-3 space-x-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <span>Continue to Application</span>
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Show test questions when test has started
  if (testStarted && !showResults && !testFailed) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
        {/* Header with timer */}
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Eligibility Test: {job.title} at {job.company}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="px-4 py-2 text-sm font-bold text-white bg-blue-500 rounded-lg">
              Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
            <span className="px-4 py-2 text-sm font-bold text-white bg-green-500 rounded-lg">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h3 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
              {currentQuestion.text}
            </h3>
            
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(currentQuestionIndex, index)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="inline-block w-8 h-8 mr-3 text-center text-white bg-gray-500 rounded-full">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-auto">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="px-6 py-3 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={completeTest}
                className="px-6 py-3 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
              >
                Submit Test
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 mt-6 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-center mt-4 text-sm text-gray-500">
            <span>
              {selectedAnswers.filter(ans => ans !== -1).length} of {questions.length} questions answered
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Initial screen with test instructions
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-2xl p-8 bg-white dark:bg-gray-800 rounded-2xl">
        <h2 className="mb-4 text-2xl font-bold">Eligibility Test for {job.title}</h2>
        <p className="mb-6">
          This test will determine your eligibility for the {job.title} position at {job.company}.
          You need to score at least 60% to be eligible to apply.
        </p>
        
        <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700">
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>Warning:</strong> This test should be taken in fullscreen mode.
            Exiting fullscreen or switching tabs will result in automatic test failure.
          </p>
        </div>
        
        <div className="mb-6 space-y-3 text-gray-700 dark:text-gray-300">
          <p>⏰ <strong>Time Limit:</strong> 10 minutes</p>
          <p>✓ <strong>Passing Score:</strong> 60% or higher</p>
          <p>❓ <strong>Questions:</strong> 10 multiple choice questions related to {job.title}</p>
          <p>⚠️ <strong>Security:</strong> Test will be terminated if you exit fullscreen or switch tabs</p>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          
          {/* For development testing only */}
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                const result: TestResult = {
                  score: 40,
                  passed: false,
                  totalQuestions: 10,
                  completedAt: new Date()
                };
                setTestResult(result);
                setShowResults(true);
                onComplete(result);
              }}
              className="px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Simulate Failure
            </button>
            <button 
              onClick={() => {
                const result: TestResult = {
                  score: 80,
                  passed: true,
                  totalQuestions: 10,
                  completedAt: new Date()
                };
                setTestResult(result);
                setShowResults(true);
                onComplete(result);
              }}
              className="px-6 py-3 text-white bg-green-500 rounded-lg hover:bg-green-600"
            >
              Simulate Success
            </button>
          </div>
          
          <button 
            onClick={startTest}
            className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};
