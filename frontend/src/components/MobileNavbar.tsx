import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, FileText, Brain, Star, User } from 'lucide-react';

export const MobileNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Bot, label: 'AI Mentor', path: '/ai-mentor' },
    { icon: Brain, label: 'AI Learning Hub', path: '/ai-learning-hub' },
    { icon: FileText, label: 'Resume Builder', path: '/resume-builder' },
    { icon: Star, label: 'Recommendation', path: '/recommendation' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 
                   backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-2 py-2">
      <div className="flex items-center justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg scale-110' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};