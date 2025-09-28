import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Clock, RefreshCw, Lightbulb, Sparkles } from 'lucide-react';
import { aiMentorService, type AIResponse, type StudyTopic } from '../services/aiMentorService';

/**
 * AI Mentor Chat Message Interface
 */
interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  topic?: string;
  isError?: boolean;
}

/**
 * AI Mentor Page Component
 * Provides an interactive chat interface with AI study assistant
 */
export const AIMentorPage: React.FC = () => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('General');
  const [availableTopics, setAvailableTopics] = useState<StudyTopic[]>([]);
  const [isServiceHealthy, setIsServiceHealthy] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize component
  useEffect(() => {
    initializeComponent();
  }, []);

  // Update suggested questions when topic changes
  useEffect(() => {
    const suggestions = aiMentorService.getSuggestedQuestions(selectedTopic);
    setSuggestedQuestions(suggestions);
  }, [selectedTopic]);

  /**
   * Initialize the component by loading topics and checking service health
   */
  const initializeComponent = async () => {
    try {
      // Load available topics
      const topics = await aiMentorService.getTopics();
      setAvailableTopics(topics);

      // Check service health
      const isHealthy = await aiMentorService.isHealthy();
      setIsServiceHealthy(isHealthy);

      // Add welcome message
      addWelcomeMessage();

    } catch (error) {
      console.error('Failed to initialize AI Mentor:', error);
      setIsServiceHealthy(false);
    }
  };

  /**
   * Add welcome message to start the conversation
   */
  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      content: `Hi there! 👋 I'm your AI Study Assistant, ready to help you learn and grow! 

I can help you with programming, career guidance, study techniques, and much more. What would you like to explore today?`,
      isUser: false,
      timestamp: new Date(),
      topic: 'General'
    };

    setMessages([welcomeMessage]);
  };

  /**
   * Send a message to the AI assistant
   */
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    
    if (!textToSend || isLoading) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      content: textToSend,
      isUser: true,
      timestamp: new Date(),
      topic: selectedTopic
    };

    // Add user message and clear input
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response
      const response: AIResponse = await aiMentorService.ask(textToSend, selectedTopic);

      // Create AI message
      const aiMessage: ChatMessage = {
        id: 'ai-' + Date.now(),
        content: response.message,
        isUser: false,
        timestamp: new Date(response.timestamp),
        topic: response.topic || selectedTopic,
        isError: !response.success
      };

      // Add AI response
      setMessages(prev => [...prev, aiMessage]);

      // Focus input for next question
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        content: '😅 Oops! Something went wrong. Could you try asking that again?',
        isUser: false,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle key press in input field
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Start a new conversation
   */
  const startNewChat = () => {
    setMessages([]);
    setInputValue('');
    addWelcomeMessage();
  };

  /**
   * Use a suggested question
   */
  const useSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Study Assistant</h1>
              <p className="text-blue-100">
                Your personal learning companion powered by Gemini AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isServiceHealthy 
                ? 'bg-green-500/20 text-green-100' 
                : 'bg-red-500/20 text-red-100'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isServiceHealthy ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {isServiceHealthy ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg flex flex-col gap-4">
          {/* Topic Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableTopics.map((topic) => (
                <option key={topic.id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Suggested Questions */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Suggested Questions
              </span>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestedQuestion(question)}
                  className="w-full p-3 text-left text-sm bg-gray-50 dark:bg-gray-700 
                           hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg
                           text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 
                     bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                     rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <RefreshCw className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Ready to start learning!
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Ask me anything about {selectedTopic.toLowerCase()} or choose a different topic.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser 
                      ? 'bg-blue-500 text-white' 
                      : message.isError 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {message.isUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[75%] ${message.isUser ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-4 rounded-2xl ${
                      message.isUser
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : message.isError
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-bl-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      
                      {/* Timestamp */}
                      <div className={`flex items-center gap-1 mt-2 text-xs ${
                        message.isUser 
                          ? 'text-blue-100 justify-end' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {formatTime(message.timestamp)}
                        {message.topic && message.topic !== 'General' && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{message.topic}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md p-4 max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
                           style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
                           style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me about ${selectedTopic.toLowerCase()}...`}
                disabled={isLoading}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-200 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
