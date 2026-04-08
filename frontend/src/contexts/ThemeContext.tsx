import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state once with lazy initialization to avoid layout shifts and repeated checks
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      
      // Fall back to system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.warn('Unable to read theme from local storage', e);
    }
    
    // Default fallback
    return 'light';
  });

  // Effect to handle DOM updates whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Apply baseline tailwind-equivalent colors to body to prevent flash of wrong colors
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#f9fafb';
    } else {
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#111827';
    }
  }, [theme]);

  // Memoize the toggle function to maintain stable reference
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Memoize context value strictly to prevent excessive children re-renders
  const value = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};