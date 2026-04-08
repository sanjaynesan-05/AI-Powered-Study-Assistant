import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for saved user on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkSavedUser = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
          try {
            const userData = JSON.parse(savedUser);
            
            const mappedUser: User = {
              id: userData._id,
              username: userData.name,
              email: userData.email,
              education: 'student', 
              skills: userData.skills || [],
              interests: userData.interests || [],
              profilePhoto: userData.profilePicture,
              role: userData.role,
              token: userData.token || token
            };
            
            if (isMounted) setUser(mappedUser);
          } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    checkSavedUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login({ email, password });
      
      if (!userData || !userData._id) {
        setError('Failed to login: Invalid response from server');
        return false;
      }
      
      const loggedInUser: User = {
        id: userData._id,
        username: userData.name,
        email: userData.email,
        education: 'student',
        skills: userData.skills || [],
        interests: userData.interests || [],
        profilePhoto: userData.profilePicture,
        role: userData.role,
        token: userData.token
      };
      
      setUser(loggedInUser);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.register({ name, email, password });
      
      if (!userData || !userData._id) {
        setError('Failed to sign up: Invalid response from server');
        return false;
      }
      
      const newUser: User = {
        id: userData._id,
        username: userData.name,
        email: userData.email,
        education: 'student',
        skills: userData.skills || [],
        interests: userData.interests || [],
        role: userData.role,
        token: userData.token
      };
      
      setUser(newUser);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (credential: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.googleLogin(credential);
      
      if (!userData || !userData._id) {
        setError('Failed to login: Invalid response from server');
        return false;
      }
      
      const loggedInUser: User = {
        id: userData._id,
        username: userData.name,
        email: userData.email,
        education: 'student',
        skills: userData.skills || [],
        interests: userData.interests || [],
        profilePhoto: userData.profilePicture,
        role: userData.role,
        token: userData.token
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      setUser(loggedInUser);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login with Google');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setLoading(true);
    
    const backendUpdates = {
      name: updates.username,
      email: updates.email,
      profilePicture: updates.profilePhoto,
      skills: updates.skills,
      interests: updates.interests
    };
    
    authService.updateProfile(backendUpdates)
      .then(response => {
        setUser(prev => prev ? {
          ...prev,
          ...updates,
          token: response.token || prev.token
        } : null);
      })
      .catch(error => {
        setError(error instanceof Error ? error.message : 'Failed to update profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders in children
  const value = useMemo(() => ({
    user,
    login,
    signup,
    googleLogin,
    logout,
    updateUser,
    loading,
    error
  }), [user, login, signup, googleLogin, logout, updateUser, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};