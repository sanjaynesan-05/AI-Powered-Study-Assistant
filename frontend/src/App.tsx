import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIMentorPage } from './pages/AIMentorPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { ContinueLearningPage } from './pages/ContinueLearningPage';
import { RecommendationPage } from './pages/RecommendationPage';



// No-op ProtectedRoute: always renders children (no auth)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

// AppContent component to handle routing and authentication state
const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Always show dashboard/profile as home page */}
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route element={<Layout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/ai-mentor" element={<AIMentorPage />} />
            <Route path="/resume-builder" element={<ResumeBuilderPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
            <Route path="/continue-learning" element={<ContinueLearningPage />} />
            <Route path="/recommendation" element={<RecommendationPage />} />
          </Route>
          {/* Catch-all: redirect unknown routes to dashboard/profile */}
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Add a loading screen for better user experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500); // Show loading for 1.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-violet-500">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">AI Mentor</h1>
          <div className="w-16 h-16 mx-auto border-t-4 border-r-4 border-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


