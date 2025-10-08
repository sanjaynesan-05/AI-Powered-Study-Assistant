import React from 'react';
import { 
  Bot, 
  FileText, 
  BookOpen, 
  Star,
  User,
  Brain,
  Cpu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Bot, label: 'AI Mentor', path: '/ai-mentor' },
    { icon: Brain, label: 'AI Learning Hub', path: '/ai-learning-hub' },
    { icon: Cpu, label: 'AI Agents', path: '/ai-agents' },
    { icon: FileText, label: 'Resume Builder', path: '/resume-builder' },
    { icon: BookOpen, label: 'Learning Path', path: '/learning-path' },
    { icon: Star, label: 'Recommendation', path: '/recommendation' },
  ];

  return (
    <div className={`fixed left-0 top-16 bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md 
                    border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg
                    transition-all duration-300 ease-in-out z-30
                    ${isOpen ? 'w-64' : 'w-16'}`}>
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-3 text-left transition-all duration-300
                         rounded-xl group relative overflow-hidden
                         ${isActive 
                           ? 'bg-blue-500 text-white shadow-lg' 
                           : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                         }`}
            >
              <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'} transition-all duration-300`} />
              {isOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};