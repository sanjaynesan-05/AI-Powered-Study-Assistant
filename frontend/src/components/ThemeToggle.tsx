import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 
                 border border-gray-200 dark:border-gray-600"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${
          theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
        } text-yellow-500`} />
        <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'
        } text-blue-400`} />
      </div>
    </button>
  );
};