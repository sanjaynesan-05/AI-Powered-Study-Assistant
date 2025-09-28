import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Clock, RefreshCw } from 'lucide-react';
import { aiMentorService, type AIResponse, type StudyTopic } from '../services/aiMentorService';
import { RefinedAIResponse } from '../components/RefinedAIResponse';

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
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  
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
    // Removed suggested questions functionality - we'll focus on the main chat
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

      // Set this message as typing and add it
      setTypingMessageId(aiMessage.id);
      setMessages(prev => [...prev, aiMessage]);

      // After a brief delay, stop typing effect
      setTimeout(() => {
        setTypingMessageId(null);
      }, response.message.length * 10 + 1000); // Updated to match 10ms per character

      // Show a subtle notification if using fallback response
      if (!response.success && response.message.includes('experiencing high demand')) {
        console.info('💡 Using enhanced fallback response due to API unavailability');
      }

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
   * Format timestamp for display
   */
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-2 sm:p-4 gap-2 sm:gap-4 max-w-7xl mx-auto">
      {/* Header with Topic Selection and New Chat */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">AI Study Assistant</h1>
              <p className="text-blue-100 text-sm sm:text-base hidden sm:block">
                Your personal learning companion powered by Gemini AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Study Topic Dropdown - Compact for mobile */}
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-2 sm:px-4 py-2 pr-6 sm:pr-8
                         focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm
                         appearance-none cursor-pointer hover:bg-white/20 transition-colors
                         w-24 sm:w-auto min-w-0"
              >
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.name} className="text-gray-900 bg-white">
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* New Chat Button - Compact for mobile */}
            <button
              onClick={startNewChat}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 border border-white/20 
                       text-white rounded-lg px-2 sm:px-4 py-2 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">New</span>
              <span className="hidden sm:inline">Chat</span>
            </button>

            {/* Service Status - Hidden on mobile */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
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

      {/* Main Chat Container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg flex flex-col min-h-0 h-[calc(100vh-120px)] sm:h-auto">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Ready to start learning!
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base px-4">
                Ask me anything about {selectedTopic.toLowerCase()} or choose a different topic.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-4 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  message.isUser 
                    ? 'bg-blue-500 text-white' 
                    : message.isError 
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {message.isUser ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-[90%] sm:max-w-[85%] ${message.isUser ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-br-md px-3 py-2 sm:px-4 sm:py-3'
                      : message.isError
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-bl-md px-3 py-2 sm:px-4 sm:py-3'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-2 sm:px-4 sm:py-3'
                  }`}>
                    {message.isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        <RefinedAIResponse 
                          content={message.content} 
                          isTyping={typingMessageId === message.id} 
                        />
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className={`flex items-center gap-1 mt-2 sm:mt-3 text-xs ${
                      message.isUser 
                        ? 'text-blue-100 justify-end' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {formatTime(message.timestamp)}
                      {message.topic && message.topic !== 'General' && (
                        <>
                          <span className="mx-1 hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{message.topic}</span>
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
            <div className="flex gap-2 sm:gap-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 max-w-xs">
                <div className="flex items-center gap-2 sm:gap-3">
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
        <div className="p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me about ${selectedTopic.toLowerCase()}...`}
              disabled={isLoading}
              className="flex-1 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
