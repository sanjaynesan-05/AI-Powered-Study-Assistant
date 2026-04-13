import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AIMentorPage } from './pages/AIMentorPage';
import AILearningHub from './pages/AILearningHub';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { MockTestPage } from './pages/MockTestPage';
import { ProfilePage } from './pages/ProfilePage';
import { ContinueLearningPage } from './pages/ContinueLearningPage';

/**
 * Main Application Component
 * Handles routing and provides the core structure of the AI-powered study assistant
 */
function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected App Routes - Wraps Layout and enforces authentication globally for children */}
      <Route
        element={
          <ProtectedRoute redirectTo="/">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ai-mentor" element={<AIMentorPage />} />
        <Route path="/ai-learning-hub" element={<AILearningHub />} />
        <Route path="/resume-builder" element={<ResumeBuilderPage />} />
        <Route path="/mock-test" element={<MockTestPage />} />
        <Route path="/continue-learning" element={<ContinueLearningPage />} />
      </Route>

      {/* Catch-all redirect to landing page, prevents loop behavior matching empty indexes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
