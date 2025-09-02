import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, Menu, ChevronLeft } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Sidebar } from './Sidebar';
import { MobileNavbar } from './MobileNavbar';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC = () => {
  // Sidebar open state is only needed for desktop
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md 
                        border-b border-gray-200/50 dark:border-gray-700/50 
                        px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Sidebar toggle only on desktop */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:inline-flex p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Logo size="sm" />
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg 
                     bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 
                     hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-300
                     border border-red-200 dark:border-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block text-sm">Logout</span>
          </button>
        </div>
      </header>


      {/* Desktop Sidebar only */}
      <div className="hidden lg:block">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 pt-16 pb-20 lg:pb-4 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <main className="p-4 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation only */}
      <MobileNavbar />
    </div>
  );
};