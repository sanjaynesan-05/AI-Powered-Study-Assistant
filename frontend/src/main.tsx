import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AIAgentProvider } from './contexts/AIAgentContext';
import App from './App.tsx';
import './index.css';

// 1. Properly pull from Vite's environment variable map
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

if (!GOOGLE_CLIENT_ID) {
  console.warn("Missing VITE_GOOGLE_CLIENT_ID in your .env file!");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* ThemeProvider added near root to ensure widespread compatibility and availability */}
      <ThemeProvider>
        <AuthProvider>
          <AIAgentProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <App />
            </GoogleOAuthProvider>
          </AIAgentProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
