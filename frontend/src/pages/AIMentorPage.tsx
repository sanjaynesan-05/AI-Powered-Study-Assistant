import React, { useState } from 'react';
import { Send, Plus, Bot, ChevronDown } from 'lucide-react';
import { ChatMessage } from '../types';

export const AIMentorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Career Guidance');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const topics = [
    'Career Guidance',
    'Skill Development',
    'Interview Preparation',
    'Resume Review',
    'Learning Path Suggestions',
    'Industry Insights'
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your question about ${selectedTopic.toLowerCase()}. As your AI mentor, I'd be happy to help guide you through this topic. Based on your query: "${inputValue}", here's my advice...`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const startNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col space-y-4">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white 
                     hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h1 className="text-2xl font-bold mb-1 relative z-10">🤖 AI Mentor</h1>
        <p className="text-blue-100 relative z-10">Get personalized guidance and expert advice</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Choose a topic and start your conversation
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Topic Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 
                       border border-gray-300 dark:border-gray-600 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300
                       shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300">{selectedTopic}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-64 bg-white dark:bg-gray-800 
                           border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-10">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                             transition-all duration-300 first:rounded-t-lg last:rounded-b-lg text-sm"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white 
                     rounded-lg hover:bg-blue-600 transform hover:scale-105 
                     transition-all duration-300 shadow-md hover:shadow-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg 
                     flex flex-col overflow-hidden border border-gray-200/50 dark:border-gray-700/50
                     hover:shadow-xl transition-all duration-300 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Welcome to AI Mentor
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Ask me anything about {selectedTopic.toLowerCase()}!
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-xl transform hover:scale-105 transition-all duration-300
                                shadow-md hover:shadow-lg
                                ${message.isBot 
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                                  : 'bg-blue-500 text-white'
                                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-750/50 relative z-10">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask about ${selectedTopic.toLowerCase()}...`}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:focus:ring-blue-800
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       transform hover:scale-105 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-md hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};