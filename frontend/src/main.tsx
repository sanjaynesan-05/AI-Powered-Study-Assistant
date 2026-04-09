import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AIAgentProvider } from './contexts/AIAgentContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// 1. Hardcoded Client ID for absolute stability during demo
const GOOGLE_CLIENT_ID = "822870483476-s93qhpao8sv7imnsir4vuqa5g9l8cpr9.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AIAgentProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <App />
            </GoogleOAuthProvider>
          </AIAgentProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </BrowserRouter>
);
